const { test } = require('node:test');
const assert = require('node:assert/strict');
const THREE = require('three');
const V = require('../vessel-motion.js');
const O = require('../ocean-surface.js');
const hull = { x: 0, z: 0, dx: -1, dz: 0, bow: .3, stern: .3, beam: .1 };
const config = { length: .6, beam: .1, draft: .008, gravity: 9.81/40 };

test('flat water produces no artificial bobbing or tilt', () => {
  const plane = V.waterPlane(hull, () => .04), state = {};
  for (let i = 0; i < 600; i++) V.advance(state, plane, 1/60, config);
  assert.ok(Math.abs(state.height - .032) < 1e-12);
  assert.ok(Math.abs(state.pitch) < 1e-12 && Math.abs(state.roll) < 1e-12);
});

test('hull aligns with a water slope on its real local axes at any yaw', () => {
  for (const yaw of [0, .8, Math.PI/2, Math.PI]) {
    const dx = -Math.cos(yaw), dz = Math.sin(yaw);
    const plane = V.waterPlane({ ...hull, x: .7, z: -.4, dx, dz },
      (x,z) => .03 + ((x-.7)*dx+(z+.4)*dz)*.12 + (-(x-.7)*dz+(z+.4)*dx)*.08);
    assert.ok(Math.abs(plane.height-.03) < 1e-12);
    assert.ok(Math.abs(Math.tan(plane.pitch)-.12) < 1e-12);
    assert.ok(Math.abs(Math.tan(plane.roll)-.08) < 1e-12);
    const tilt = new THREE.Euler(plane.roll, 0, -plane.pitch, 'ZXY');
    const bow = new THREE.Vector3(-.3,0,0).applyEuler(tilt);
    const right = new THREE.Vector3(0,0,-.05).applyEuler(tilt);
    assert.ok(bow.y > 0, 'rising bow rotates about local Z');
    assert.ok(right.y > 0, 'rising starboard rotates about local X');
  }
});

test('damped motion is stable at 30, 60 and 120 Hz and follows full water height', () => {
  const results = [30,60,120].map(rate => {
    const state = { height: -config.draft, pitch: 0, roll: 0 };
    for (let i=0;i<rate*8;i++) V.advance(state, {height:.08,pitch:.2,roll:-.1},1/rate,config);
    return state;
  });
  for (const state of results) {
    assert.ok(Math.abs(state.height-.072) < 1e-6);
    assert.ok(Math.abs(state.pitch-.2) < 1e-6);
    assert.ok(Math.abs(state.roll+.1) < 1e-6);
    assert.ok(Math.abs(state.pitch-results[0].pitch) < 1e-12);
  }
});

test('contact constraint prevents the hull from hovering after a falling wave', () => {
  const state = { height: .072, heightVelocity: 0, pitch: 0, roll: 0 };
  const fallingSurface = { height: 0, pitch: 0, roll: 0 };
  V.advance(state, fallingSurface, 1 / 60, config);
  const waterline = fallingSurface.height - config.draft;
  assert.ok(state.height <= waterline + Math.max(.0015, config.draft * .25));
  assert.ok(state.heightVelocity <= 0, 'contact correction must not add upward velocity');
});

test('cargo-scale draft keeps a finite portion of the hull below a flat waterline', () => {
  const cargo = { ...config, draft: .022 }, state = {};
  V.advance(state, { height: 0, pitch: 0, roll: 0 }, 1 / 60, { ...cargo, reset: true });
  assert.equal(state.height, -.022);
  assert.ok(state.height < -.015, 'the visual hull must not balance on its keel');
});

test('world-space ocean sampling tracks horizontally displaced steep waves', () => {
  for (const spectral of [false,true]) {
    const sampler = O.sampler({ spectral, strength:.06, frequency:.8, speed:1, sharpness:1.05,
      choppiness:1.25, windDirection:.48, windSpeed:15, spacing:7/192, time:4 });
    for (let x=-1;x<=1;x+=.1) {
      const z=x*.3, d=sampler.displacement(x,z);
      assert.ok(Math.abs(sampler.height(x+d.x,z+d.z)-d.y) < .001,
        'buoyancy height must match the displaced water crest');
    }
  }
});
