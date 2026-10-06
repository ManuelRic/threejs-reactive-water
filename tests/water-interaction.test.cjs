const test = require('node:test');
const assert = require('node:assert/strict');
const THREE = require('three');
const { sampleSurface, advanceMotion, contactResponse } = require('../water-interaction.js');

test('coarse box faces have waterline samples, not just corners', () => {
  const box = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  const samples = sampleSurface(box, 600, THREE);
  assert.equal(samples.length, 600);
  assert.ok(samples.filter(p => Math.abs(p.position.y) < 0.04 && Math.abs(p.normal.y) < 0.1).length > 15);
  assert.ok(samples.every(p => Math.abs(p.normal.length() - 1) < 1e-6));
  assert.ok(Math.abs(samples.reduce((sum, p) => sum + p.area, 0) - 6) < 1e-8);
});

test('one budget covers all meshes, weighted by transformed surface area', () => {
  const group = new THREE.Group();
  const small = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  const large = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  large.scale.setScalar(3);
  group.add(small, large);
  const samples = sampleSurface(group, 1000, THREE);
  assert.equal(samples.length, 1000);
  assert.equal(samples.filter(p => p.mesh === small).length, 100);
  assert.equal(samples.filter(p => p.mesh === large).length, 900);
});

test('indexed and non-indexed geometry give the same samples', () => {
  const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 1, 3));
  const flat = new THREE.Mesh(mesh.geometry.toNonIndexed());
  const a = sampleSurface(mesh, 120, THREE);
  const b = sampleSurface(flat, 120, THREE);
  for (let i = 0; i < a.length; i++) {
    assert.ok(a[i].position.distanceTo(b[i].position) < 1e-8);
    assert.equal(a[i].area, b[i].area);
  }
});

test('sampling includes transforms inherited from parents', () => {
  const parent = new THREE.Group();
  parent.position.set(8, 4, -2);
  parent.rotation.y = Math.PI / 3;
  parent.scale.set(2, 1, 0.5);
  const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  parent.add(mesh);
  for (const sample of sampleSurface(mesh, 200, THREE)) {
    assert.ok(sample.previousWorld.distanceTo(sample.position.clone().applyMatrix4(mesh.matrixWorld)) < 1e-8);
  }
});

test('ignored and degenerate geometry creates no contact samples', () => {
  const group = new THREE.Group();
  const ignored = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  ignored.userData.ignoreWaterReaction = true;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(Array(9).fill(0), 3));
  group.add(ignored, new THREE.Mesh(geometry));
  assert.deepEqual(sampleSurface(group, 500, THREE), []);
});

test('hull sampling excludes high superstructure in object-local space', () => {
  const model = new THREE.Group();
  model.position.y = 7;
  const hull = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  const deck = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  deck.position.y = 2;
  model.add(hull, deck);
  const samples = sampleSurface(model, 100, THREE, { referenceObject: model, maxLocalY: 0.5 });
  assert.equal(samples.length, 100);
  assert.ok(samples.every(sample => sample.mesh === hull));
});

test('a moving ship stops emitting immediately, despite residual velocity', () => {
  const state = {};
  for (let i = 0; i < 60; i++) advanceMotion(state, 0.25, 0, 1 / 60, { isShip: true });
  const stopped = advanceMotion(state, 0, 0, 1 / 60, { isShip: true });
  assert.equal(stopped.shipWakeActive, false);
  assert.equal(stopped.speedAmount, 0);
  assert.equal(state.velocityX, 0);
});

test('yaw/heave and numerical jitter cannot trigger a navigation wake', () => {
  const state = { velocityX: 0.1, velocityZ: 0.1, angularVelocity: 4, verticalVelocity: 2 };
  assert.equal(advanceMotion(state, 0.0002, -0.0003, 1 / 60, { isShip: true }).shipWakeActive, false);
});

test('generic objects move/displace water without getting a ship wake', () => {
  const motion = advanceMotion({}, 0.4, 0, 1 / 60, { isShip: false });
  assert.equal(motion.moving, true);
  assert.equal(motion.shipWakeActive, false);
  assert.ok(motion.speedAmount > 0);
});

test('velocity converges to measured speed independently of update rate', () => {
  const results = [30, 60, 120].map(rate => {
    const state = {};
    for (let i = 0; i < rate; i++) advanceMotion(state, 0.3, 0.1, 1 / rate, { isShip: true });
    return state.velocityX;
  });
  assert.ok(Math.abs(results[0] - results[2]) < 1e-10);
  assert.ok(Math.abs(results[0] - 0.3) < 1e-6);
});

test('surface orientation changes response to the same velocity', () => {
  const facing = contactResponse({ x: 1, y: 0, z: 0 }, { x: 0.5, z: 0 }, 0.02, 0.02, 1 / 60, 0.05);
  const parallel = contactResponse({ x: 0, y: 0, z: 1 }, { x: 0.5, z: 0 }, 0.02, 0.02, 1 / 60, 0.05);
  assert.ok(facing.impulse > 0);
  assert.equal(parallel, null);
});

test('stationary contact reacts locally to waves but not to flat calm water', () => {
  const normal = { x: 0, y: -1, z: 0 };
  assert.ok(contactResponse(normal, { x: 0, z: 0 }, 0.02, 0.019, 1 / 60, 0.05).impulse > 0);
  assert.equal(contactResponse(normal, { x: 0, z: 0 }, 0.02, 0.02, 1 / 60, 0.05), null);
});

test('dry/deeply submerged surfaces do not inject surface pressure', () => {
  const normal = { x: 1, y: 0, z: 0 };
  assert.equal(contactResponse(normal, { x: 1, z: 0 }, -0.1, -0.1, 1 / 60, 0.05), null);
  assert.equal(contactResponse(normal, { x: 1, z: 0 }, 0.5, 0.5, 1 / 60, 0.05), null);
});
