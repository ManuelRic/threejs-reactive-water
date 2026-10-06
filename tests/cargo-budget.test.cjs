const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
test('optimized cargo preserves bounds/materials while fitting the render budget', async () => {
  const { NodeIO } = await import('@gltf-transform/core');
  const { getBounds } = await import('@gltf-transform/functions');
  const io = new NodeIO();
  const original = await io.read(path.join(__dirname, '../models/cargo_03.glb'));
  const optimized = await io.read(path.join(__dirname, '../models/cargo_03.optimized.glb'));
  const triangles = doc => doc.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((n, p) => n + p.getIndices().getCount() / 3, 0), 0);
  assert.ok(triangles(optimized) < triangles(original) * .15);
  assert.ok(optimized.getRoot().listMeshes().length < original.getRoot().listMeshes().length);
  const a = getBounds(original.getRoot().listScenes()[0]);
  const b = getBounds(optimized.getRoot().listScenes()[0]);
  for (let axis = 0; axis < 3; axis++) {
    const extent = a.max[axis] - a.min[axis];
    assert.ok(Math.abs(a.min[axis] - b.min[axis]) / extent < .015);
    assert.ok(Math.abs(a.max[axis] - b.max[axis]) / extent < .015);
  }
  const appearances = doc => {
    const values = new Set();
    for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) {
      const m = p.getMaterial(), factor = m.getBaseColorFactor(), colors = p.getAttribute('COLOR_0');
      const count = colors ? colors.getCount() : 1;
      for (let vertex = 0; vertex < count; vertex++) {
        const color = colors ? colors.getElement(vertex, []) : [1, 1, 1];
        values.add(JSON.stringify([factor.slice(0, 3).map((c, i) => Number((c * color[i]).toFixed(5))),
          factor[3], m.getMetallicFactor(), m.getRoughnessFactor(), m.getAlphaMode()]));
      }
    }
    return [...values].sort();
  };
  assert.deepEqual(appearances(optimized), appearances(original));
  const textures = doc => [...new Set(doc.getRoot().listTextures().map(texture =>
    createHash('sha256').update(texture.getImage()).digest('hex')))].sort();
  assert.deepEqual(textures(optimized), textures(original));
});
