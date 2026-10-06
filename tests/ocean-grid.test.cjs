const { test } = require('node:test');
const assert = require('node:assert/strict');
const THREE = require('three');
const createOceanGeometry = require('../ocean-grid.js');

for (const segments of [96, 160, 256]) {
  test(`ocean mesh ${segments}: stitched, consistently wound and horizon-sized`, () => {
    const geometry = createOceanGeometry(THREE, 7, segments, true);
    const positions = geometry.attributes.position.array;
    const index = geometry.index.array;
    const edges = new Map();
    for (let i = 0; i < index.length; i += 3) {
      const [a, b, c] = [index[i], index[i+1], index[i+2]];
      const abx = positions[b*3]-positions[a*3], aby = positions[b*3+1]-positions[a*3+1];
      const acx = positions[c*3]-positions[a*3], acy = positions[c*3+1]-positions[a*3+1];
      assert.ok(abx * acy - aby * acx > 0, 'No inverted or degenerate faces');
      for (const [u, v] of [[a,b], [b,c], [c,a]]) {
        const key = Math.min(u,v) + ':' + Math.max(u,v);
        edges.set(key, (edges.get(key) || 0) + 1);
      }
    }
    assert.equal([...edges.values()].filter(count => count === 1).length, segments*4,
      'Only the outer perimeter is open; the simulation-patch seam is closed');
    assert.ok([...edges.values()].every(count => count <= 2));
    geometry.computeBoundingBox();
    assert.ok(geometry.boundingBox.max.x > 500);
    assert.ok([...geometry.attributes.oceanSpacing.array].every(value => value > 0 && Number.isFinite(value)));
    geometry.dispose();
  });
}
test('pool mode retains only the original interaction patch', () => {
  const geometry = createOceanGeometry(THREE, 7, 96, false);
  geometry.computeBoundingBox();
  assert.equal(geometry.index.count / 3, 96*96*2);
  assert.equal(geometry.boundingBox.max.x, 3.5);
  geometry.dispose();
});
