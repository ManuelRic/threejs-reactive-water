const { test } = require('node:test');
const assert = require('node:assert/strict');
const F = require('../wake-foam.js');
const base = { isShip: true, speed: .18, bow: { x: .3, z: 0 },
  stern: { x: -.3, z: 0 }, length: .6, beam: .09, dx: 1, dz: 0,
  propellers: [{ x: -.27, z: 0 }] };

test('local foam stays at stern and propellers; side crests are handled by the GPU field', () => {
  const sources = F.sources(base);
  assert.equal(sources.length, 4);
  for (const source of sources) {
    assert.ok(source.length < base.length * .22);
    assert.ok(source.axisX < 0);
  }
  assert.equal(sources[0].x, base.stern.x);
  assert.equal(sources[1].x, base.propellers[0].x);
});
test('stopped vessels and non-ships emit no navigation foam', () => {
  for (const override of [{ speed: 0 }, { speed: .0005 }, { isShip: false }, { strength: 0 }]) {
    assert.deepEqual(F.sources({ ...base, ...override }), []);
  }
});
test('foam heading rotates and propeller control changes only propeller emission', () => {
  const normal = F.sources(base);
  const turned = F.sources({ ...base, dx: 0, dz: 1, propellerWash: 0 });
  assert.equal(Math.abs(turned[0].axisX), 0);
  assert.equal(turned[0].axisZ, -1);
  assert.equal(turned[1].intensity, 0);
  assert.equal(turned[0].intensity, normal[0].intensity);
});

test('invalid contact coordinates cannot contaminate the foam field', () => {
  for (const override of [{ bow: null }, { stern: { x: NaN, z: 0 } },
    { speed: Infinity }, { dx: Infinity }, { strength: NaN }]) {
    assert.deepEqual(F.sources({ ...base, ...override }), []);
  }
  assert.equal(F.sources({ ...base, propellers: [{ x: NaN, z: 0 }] }).length, 3);
});

test('manoeuvring creates faint stern wash with almost no bow foam', () => {
  for (const knots of [1, 2, 4]) {
    const slow = F.sources({ ...base, speed: knots * 1852 / 3600 / 40 });
    assert.ok(slow[0].intensity > 0 && slow[0].intensity < .06);
    assert.ok(slow[1].intensity > slow[0].intensity);
    assert.equal(slow.length, 4, 'manoeuvring keeps faint local stern foam');
    assert.ok(slow[2].intensity < slow[0].intensity * .22);
    assert.ok(slow[3].intensity < slow[0].intensity * .22);
  }
  const cruise = F.sources(base);
  assert.equal(cruise.length, 4, 'side crests must not be stamped at fixed hull offsets');
  const planing = F.sources({ ...base, speed: .45 });
  assert.equal(planing.length, 6, 'bow breaking is reserved for planing speeds');
  assert.ok(planing[4].intensity + planing[5].intensity < planing[0].intensity * .12);
});

test('stern shear foam responds to turns while historical side foam stays in the GPU field', () => {
  const straight = F.sources(base);
  const turning = F.sources({ ...base, turn: .8 });
  // Sources 2 and 3 are port/starboard stern shear layers.
  assert.equal(straight[2].intensity, straight[3].intensity);
  assert.ok(turning[3].intensity > turning[2].intensity);
  assert.ok(turning[3].axisZ > turning[2].axisZ);
});
