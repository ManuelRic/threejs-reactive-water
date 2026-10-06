const { test } = require('node:test');
const assert = require('node:assert/strict');
const lods = require('../models/cargo_03.reflection-indices.json');
const path = require('node:path');

test('reflection-only indices fit the original vertices and reduce reflected triangles', async () => {
  const { NodeIO } = await import('@gltf-transform/core');
  const document = await new NodeIO().read(path.join(__dirname, '../models/cargo_03.optimized.glb'));
  let sourceCount = 0, lodCount = 0, meshes = 0;
  for (const node of document.getRoot().listNodes()) {
    if (!node.getMesh()) continue;
    const primitive = node.getMesh().listPrimitives()[0];
    const lod = lods[node.getName()];
    assert.ok(lod, node.getName());
    assert.equal(lod.vertices, primitive.getAttribute('POSITION').getCount());
    assert.equal(lod.originalIndices, primitive.getIndices().getCount());
    assert.equal(lod.indices.length % 3, 0);
    assert.ok(lod.indices.length > 0);
    assert.ok(lod.indices.every(i => Number.isInteger(i) && i >= 0 && i < lod.vertices));
    sourceCount += lod.originalIndices;
    lodCount += lod.indices.length;
    meshes++;
  }
  assert.equal(meshes, Object.keys(lods).length);
  assert.ok(lodCount < sourceCount * .12);
});
