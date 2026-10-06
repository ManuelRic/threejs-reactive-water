/* Continuous ocean: a dense interaction patch with stitched, expanding rings. */
(function (root) {
  function createOceanGeometry(THREE, size, segments, extended) {
    const positions = [], spacing = [], indices = [];
    const half = size * 0.5, step = size / segments;
    for (let y = 0; y <= segments; y++) {
      for (let x = 0; x <= segments; x++) {
        positions.push(-half + x * step, -half + y * step, 0);
        spacing.push(step);
      }
    }
    for (let y = 0; y < segments; y++) {
      for (let x = 0; x < segments; x++) {
        const a = y * (segments + 1) + x, b = a + segments + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    let inner = [];
    for (let i = 0; i < segments; i++) inner.push(i);
    for (let i = 0; i < segments; i++) inner.push(i * (segments + 1) + segments);
    for (let i = 0; i < segments; i++) inner.push(segments * (segments + 1) + segments - i);
    for (let i = 0; i < segments; i++) inner.push((segments - i) * (segments + 1));
    let radius = half;
    if (extended) for (let ring = 0; ring < 28; ring++) {
      const outer = [], nextRadius = radius + step * Math.pow(1.38, ring);
      const cell = Math.max(nextRadius - radius, 2 * nextRadius / segments);
      for (let side = 0; side < 4; side++) for (let i = 0; i < segments; i++) {
        const t = -nextRadius + 2 * nextRadius * i / segments;
        const point = [[t, -nextRadius], [nextRadius, t], [-t, nextRadius], [-nextRadius, -t]][side];
        outer.push(positions.length / 3);
        positions.push(point[0], point[1], 0);
        spacing.push(cell);
      }
      for (let i = 0; i < inner.length; i++) {
        const j = (i + 1) % inner.length;
        indices.push(inner[i], outer[i], inner[j], inner[j], outer[i], outer[j]);
      }
      inner = outer;
      radius = nextRadius;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('oceanSpacing', new THREE.Float32BufferAttribute(spacing, 1));
    geometry.setIndex(indices);
    return geometry;
  }
  root.createOceanGeometry = createOceanGeometry;
  if (typeof module !== 'undefined') module.exports = createOceanGeometry;
})(typeof window !== 'undefined' ? window : globalThis);
