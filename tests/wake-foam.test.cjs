const { test } = require('node:test');
const assert = require('node:assert/strict');
const F = require('../wake-foam.js');
const base = { isShip: true, speedAmount: .6, bow: { x: .3, z: 0 },
  stern: { x: -.3, z: 0 }, length: .6, beam: .09, dx: 1, dz: 0,
  propellers: [{ x: -.27, z: 0 }] };

test('foam is emitted locally, not as hull-length strips or white V-arms', () => {
  const sources = F.sources(base);
  assert.equal(sources.length, 4);
  for (const source of sources) {
    assert.ok(source.length < base.length * .2);
    assert.ok(source.axisX < 0);
  }
  assert.equal(sources[0].x, base.stern.x);
  assert.equal(sources[1].x, base.propellers[0].x);
});
test('stopped vessels and non-ships emit no navigation foam', () => {
  for (const override of [{ speedAmount: 0 }, { speedAmount: .1 }, { isShip: false }, { strength: 0 }]) {
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
    { speedAmount: Infinity }, { dx: Infinity }, { strength: NaN }]) {
    assert.deepEqual(F.sources({ ...base, ...override }), []);
  }
  assert.equal(F.sources({ ...base, propellers: [{ x: NaN, z: 0 }] }).length, 3);
});
