const { test } = require('node:test');
const assert = require('node:assert/strict');
const K = require('../kelvin-wake.js');
const base = { x: 0, z: 0, dx: 1, dz: 0, speed: .3, length: .6, beam: .09, draft: .02,
  gravity: 9.81 / 40, time: 0, dt: 1 / 6, isShip: true, minWavelength: .06 };

test('deep-water dispersion, phase locking and speed-dependent wavelength', () => {
  for (const theta of [0, .3, .6, .9, 1.2]) {
    const w = K.dispersion(.3, theta, base.gravity);
    assert.ok(Math.abs(w.omega ** 2 - base.gravity * w.k) < 1e-12);
    assert.ok(Math.abs(w.omega / w.k - .3 * Math.cos(theta)) < 1e-12);
    assert.ok(Math.abs(w.groupSpeed - w.omega / w.k / 2) < 1e-12);
    assert.equal(K.dispersion(.6, theta, base.gravity).k, w.k / 4);
  }
});
test('packet energy centres trail a straight ship inside the Kelvin wedge', () => {
  for (let theta = -1.5; theta <= 1.5; theta += .001) {
    const w = K.dispersion(base.speed, theta, base.gravity);
    const behind = base.speed - Math.cos(theta) * w.groupSpeed;
    const sideways = Math.abs(Math.sin(theta) * w.groupSpeed);
    assert.ok(Math.atan2(sideways, behind) <= K.KELVIN_HALF_ANGLE + 1e-12);
  }
});
test('stopped ships and non-ships never emit navigation packets', () => {
  assert.deepEqual(K.emit({ ...base, speed: 0 }), []);
  assert.deepEqual(K.emit({ ...base, speed: .005 }), []);
  assert.deepEqual(K.emit({ ...base, isShip: false }), []);
});
test('zero wake gain and invalid transforms cannot inject waves', () => {
  assert.deepEqual(K.emit({ ...base, strength: 0 }), []);
  assert.deepEqual(K.emit({ ...base, x: NaN }), []);
  assert.deepEqual(K.emit({ ...base, dt: 0 }), []);
});
test('old waves keep their world-space direction after a turn and stop', () => {
  const first = K.emit(base);
  const copy = JSON.stringify(first);
  K.emit({ ...base, time: 1, dx: 0, dz: 1 });
  K.emit({ ...base, time: 2, speed: 0 });
  assert.equal(JSON.stringify(first), copy);
  assert.ok(K.evolve(first[0], 3).x > first[0].x);
  assert.equal(K.evolve(first[0], 8), null);
});
test('beam/draft attenuate high-frequency waves and emission is dt weighted', () => {
  const first = K.emit(base)[0];
  const wide = K.emit({ ...base, draft: .1 })[0];
  assert.ok(Math.abs(wide.amplitude) < Math.abs(first.amplitude));
  const halfDt = K.emit({ ...base, dt: base.dt / 2 })[0];
  assert.equal(halfDt.amplitude, first.amplitude / 2);
  assert.deepEqual(K.emit({ ...base, speed: .01, minWavelength: .1 }), []);
});
test('directional field has negligible far-forward or broadside energy', () => {
  const packets = [];
  const end = 5;
  for (let time = 0; time < end; time += 1 / 6) {
    packets.push(...K.emit({ ...base, x: base.speed * time, time }).map(p => K.evolve(p, end)));
  }
  const sum = (x, z) => packets.reduce((h, p) => h + K.height(p, x, z), 0);
  let rear = 0, front = 0, side = 0;
  for (let x = .1; x <= 1.5; x += .02) {
    for (let z = -.6; z <= .6; z += .02) {
      rear += sum(base.speed * end - x, z) ** 2;
      front += sum(base.speed * end + .6 + x, z) ** 2;
      side += sum(base.speed * end, 1 + x) ** 2;
    }
  }
  assert.ok(rear > 1e-9);
  assert.ok(front < rear * .001);
  assert.ok(side < rear * .001);
});
