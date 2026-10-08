const { test } = require('node:test');
const assert = require('node:assert/strict');
const K = require('../kelvin-wake.js');
const base = { x: 0, z: 0, dx: 1, dz: 0, speed: .3, length: .6, beam: .09, draft: .02,
  gravity: 9.81 / 40, time: 0, dt: 1 / 6, isShip: true, minWavelength: .06 };

test('bow displacement survives at 1–4 knots, vanishes at rest and scales with speed', () => {
  let previous = 0;
  for (const knots of [1,2,4,8,14]) {
    const p = K.hull({ ...base, speed: knots * 1852 / 3600 / 40 });
    const bowCrest = K.hullHeight(p,.3 - .09*.10,.09*.22);
    const trough = K.hullHeight(p,.3 - .09*.10,.09*.78);
    assert.ok(bowCrest > 0 && bowCrest >= previous);
    assert.ok(trough < 0);
    assert.ok(Math.abs(K.hullHeight(p,1,0)) < 1e-9, 'pressure remains local to the bow');
    assert.ok(bowCrest < base.draft);
    previous = bowCrest;
  }
  assert.equal(K.hull({ ...base, speed: 0 }), null);
  assert.equal(K.hull({ ...base, isShip: false }), null);
});

test('calm-water manoeuvring has a small bow ripple, not a high-speed ridge', () => {
  const peakAt = (knots, turn = 0) => {
    const hull = K.hull({ ...base, speed: knots * 1852 / 3600 / 40,
      strength: 1.18, turn }); // includes the cargo ship's default wake gain
    let peak = 0;
    for (let aft = 0; aft < 1.5; aft += .02) {
      for (let side = -1; side <= 1; side += .02) {
        peak = Math.max(peak, Math.abs(K.hullHeight(hull,
          hull.bow - hull.beam * aft, hull.beam * side)));
      }
    }
    return peak * 40; // scene units -> metres
  };
  for (const turn of [-1, 0, 1]) {
    let previous = 0;
    for (const [knots, limit] of [[1, .001], [2, .004], [4, .015]]) {
      const peak = peakAt(knots, turn);
      assert.ok(peak > previous && peak < limit, `${knots} kn, turn ${turn}: ${peak} m`);
      previous = peak;
    }
    assert.ok(peakAt(4, turn) < peakAt(14, turn) * .10,
      'harbour-speed bow height stays below a tenth of cruising bow height');
  }
});

test('wake response depends on hull-relative speed and remains scale consistent', () => {
  const options = { ...base, speed: .08 };
  const short = K.hull(options);
  const long = K.hull({ ...options, length: 2.4 });
  assert.ok(long.amplitude < short.amplitude,
    'a longer displacement hull must not receive the same speed boost');
  const scale = 10;
  const scaled = K.hull({ ...options, length: options.length * scale,
    beam: options.beam * scale, draft: options.draft * scale,
    speed: options.speed * Math.sqrt(scale) });
  assert.ok(Math.abs(scaled.amplitude / short.amplitude - scale) < 1e-10);
});

test('resolved slow wake packets are substantially weaker than cruising packets', () => {
  const amplitudeAt = knots => K.emit({ ...base, speed: knots * 1852 / 3600 / 40,
    minWavelength: .005 }).reduce((sum, p) => sum + Math.abs(p.amplitude), 0);
  const slow = amplitudeAt(4), cruise = amplitudeAt(14);
  assert.ok(slow > 0, 'do not remove the low-speed wake entirely');
  assert.ok(slow < cruise * .10, `slow ${slow}, cruise ${cruise}`);
});

test('deep-water dispersion, phase locking and speed-dependent wavelength', () => {
  for (const theta of [0, .3, .6, .9, 1.2]) {
    const w = K.dispersion(.3, theta, base.gravity);
    assert.ok(Math.abs(w.omega ** 2 - base.gravity * w.k) < 1e-12);
    assert.ok(Math.abs(w.omega / w.k - .3 * Math.cos(theta)) < 1e-12);
    assert.ok(Math.abs(w.groupSpeed - w.omega / w.k / 2) < 1e-12);
    assert.equal(K.dispersion(.6, theta, base.gravity).k, w.k / 4);
  }
});

test('near-hull field has smooth compact support and rotates with the bow', () => {
  const p = K.hull({ ...base, beam: .18, speed: .18 });
  for (const sign of [-1, 1]) {
    const edge = p.bow + sign * p.beam * 4;
    assert.equal(K.hullHeight(p, edge + sign * .00001, .04), 0);
    assert.ok(Math.abs(K.hullHeight(p, edge - sign * .00001, .04)) < 1e-10);
  }
  const rotated = K.hull({ ...base, x: .4, z: -.2, dx: 0, dz: 1, beam: .18, speed: .18 });
  assert.ok(Math.abs(K.hullHeight(p, .3, .04) - K.hullHeight(rotated, .36, .1)) < 1e-12);
});
test('hull displacement includes a restrained waterline ridge and outer trough', () => {
  const p = K.hull({ ...base, beam: .18, speed: .18 });
  // At midships the hull form is widest. The small crest sits immediately
  // outside it and is followed by a weaker trough, on either side equally.
  const sideRidge = K.hullHeight(p, 0, p.beam * .58);
  const outerTrough = K.hullHeight(p, 0, p.beam * 1.40);
  assert.ok(sideRidge > 0);
  assert.ok(outerTrough < 0);
  assert.ok(sideRidge < p.amplitude * .4, 'side wash stays intentionally subtle');
  assert.equal(sideRidge, K.hullHeight(p, 0, -p.beam * .58));
});
test('bow pressure is causal and cannot lift untouched water ahead of the ship', () => {
  const p = K.hull({ ...base, beam: .18, speed: .18 });
  assert.ok(K.hullHeight(p, p.bow - p.beam * .02, p.beam * .18) > 0,
    'the contact ridge remains attached immediately behind the bow');
  assert.equal(K.hullHeight(p, p.bow + p.beam * .06, p.beam * .18), 0,
    'no near-hull pressure exists ahead of the bow contact');
});
test('bow displacement is a pair of narrow shoulders, not a rounded impact ring', () => {
  const p = K.hull({ ...base, beam: .18, speed: .18 });
  const a = p.bow - p.beam * .18;
  const centre = Math.abs(K.hullHeight(p, a, 0));
  const shoulder = K.hullHeight(p, a, p.beam * .23);
  assert.ok(shoulder > centre * 1.8);
  assert.equal(shoulder, K.hullHeight(p, a, -p.beam * .23));
});
test('turning biases the live shoulder and divergent packets toward the outside', () => {
  const p = K.hull({ ...base, beam: .18, speed: .18, turn: .8 });
  const a = p.bow - p.beam * .18;
  assert.ok(K.hullHeight(p, a, p.beam * .23) > K.hullHeight(p, a, -p.beam * .23));
  const packets = K.emit({ ...base, speed: .18, turn: .8 });
  const left = packets.filter(packet => packet.nz > .01).reduce((sum, packet) => sum + Math.abs(packet.amplitude), 0);
  const right = packets.filter(packet => packet.nz < -.01).reduce((sum, packet) => sum + Math.abs(packet.amplitude), 0);
  assert.ok(left > right, 'outer divergent packets carry more energy');
});
test('path curvature and Three.js yaw agree on the geometric outside of either turn', () => {
  for (const sign of [-1, 1]) {
    // Starting along +x, bend towards sign*z. Circle centre (inside) lies
    // on sign*z, so the opposite side must have the stronger shoulder.
    const pathCross = Math.sin(sign * .12);
    const yawRate = -sign * .12;
    const turn = K.turnFromMotion(pathCross, yawRate, 0, .18);
    assert.ok(turn * sign < 0);
    assert.ok(Math.abs(turn) > Math.abs(K.turnFromMotion(0, yawRate, 0, .18)),
      'path and yaw reinforce rather than cancel each other');
    const hull = K.hull({ ...base, speed:.18, beam:.18, turn });
    const a = hull.bow - hull.beam * .18;
    assert.ok(K.hullHeight(hull, a, -sign * hull.beam * .23) >
      K.hullHeight(hull, a, sign * hull.beam * .23));
  }
  assert.equal(K.turnFromMotion(0, 0, 0, .18), 0);
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

test('resolved packets contain alternating crests and troughs, not a single mound', () => {
  const emitted = K.emit({ ...base, speed: .18 })[0];
  const p = { ...K.evolve(emitted, 16, 32), phase: 0 };
  const wavelength = 2 * Math.PI / p.k;
  const center = K.height(p, p.x, p.z);
  assert.ok(center > 0);
  assert.ok(K.height(p, p.x - wavelength / 2, p.z) < -center * .15);
  assert.ok(K.height(p, p.x - wavelength, p.z) > center * .015);
  assert.ok(K.height(p, p.headX + .001, p.headZ) === 0, 'no carrier wave ahead of its source');
});

test('quality changes resolution filtering, not packet dimensions or wavelength', () => {
  const packets = [96, 160, 256].map(segments => K.emit({ ...base,
    speed: .18, minWavelength: 7 / segments * 4 })[0]);
  for (const p of packets) {
    assert.equal(p.width, packets[0].width);
    assert.equal(p.crossWidth, packets[0].crossWidth);
    assert.equal(p.k, packets[0].k);
  }
});

test('time-integrated wake stays stable when source sampling changes', () => {
  const run = dt => {
    const packets = [];
    for (let time = 0; time < 12; time += dt) packets.push(...K.emit({ ...base,
      speed: .18, time, dt, x: .18 * time }).map(p => K.evolve(p, 12, 16)));
    return Array.from({ length: 160 }, (_, i) => {
      const x = .3 + (i % 40) * .04, z = Math.floor(i / 40) * .08;
      return packets.reduce((sum, p) => sum + K.height(p, x, z), 0);
    });
  };
  const a = run(.25), b = run(.125);
  const energy = b.reduce((sum, h) => sum + h * h, 0);
  const error = a.reduce((sum, h, i) => sum + (h - b[i]) ** 2, 0);
  assert.ok(Math.sqrt(error / energy) < .08);
  assert.ok(Math.max(...a.map(Math.abs)) < base.draft, 'no accumulated water wall');
});

test('dry hulls and invalid gravity do not generate navigation waves', () => {
  for (const override of [{ draft: 0 }, { draft: -1 }, { gravity: -1 }, { strength: Infinity },
    { bowStrength: NaN }, { sternStrength: Infinity }]) {
    assert.deepEqual(K.emit({ ...base, ...override }), []);
  }
});
