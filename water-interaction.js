/* Geometry and motion rules shared by the browser simulation and Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WaterInteraction = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function smoothstep(min, max, value) {
    const t = clamp((value - min) / (max - min), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function radicalInverse(value, base) {
    let result = 0;
    let fraction = 1 / base;
    while (value > 0) {
      result += (value % base) * fraction;
      value = Math.floor(value / base);
      fraction /= base;
    }
    return result;
  }

  // Sample triangle interiors by WORLD area, across the entire hierarchy. A
  // six-face box gets contact samples even though its corners miss the waterline.
  function sampleSurface(root, budget, THREE, options = {}) {
    budget = Math.max(0, Math.floor(budget));
    if (!budget) return [];
    root.updateWorldMatrix(true, true);
    const meshes = [];
    let totalArea = 0;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const edgeB = new THREE.Vector3();
    const edgeC = new THREE.Vector3();
    const inverseReference = new THREE.Matrix4();
    if (options.referenceObject) {
      options.referenceObject.updateWorldMatrix(true, true);
      inverseReference.getInverse(options.referenceObject.matrixWorld);
    }
    const localPoint = new THREE.Vector3();
    root.traverse((mesh) => {
      // Rigid collision proxies are required for skinned/morphing visual meshes.
      if (!mesh.isMesh || mesh.userData.ignoreWaterReaction || mesh.isSkinnedMesh) return;
      const position = mesh.geometry && mesh.geometry.attributes.position;
      if (!position) return;
      const index = mesh.geometry.index;
      const count = index ? index.count : position.count;
      const range = mesh.geometry.drawRange;
      const start = range ? range.start : 0;
      const end = Math.min(count, range ? start + range.count : count);
      const triangleCount = Math.floor((end - start) / 3);
      const cumulativeAreas = new Float64Array(triangleCount);
      let meshArea = 0;
      for (let triangle = 0; triangle < triangleCount; triangle++) {
        const i = start + triangle * 3;
        a.fromBufferAttribute(position, index ? index.getX(i) : i).applyMatrix4(mesh.matrixWorld);
        b.fromBufferAttribute(position, index ? index.getX(i + 1) : i + 1).applyMatrix4(mesh.matrixWorld);
        c.fromBufferAttribute(position, index ? index.getX(i + 2) : i + 2).applyMatrix4(mesh.matrixWorld);
        let area = edgeB.subVectors(b, a).cross(edgeC.subVectors(c, a)).length() * 0.5;
        if (Number.isFinite(options.maxLocalY)) {
          const minY = Math.min(localPoint.copy(a).applyMatrix4(inverseReference).y,
            localPoint.copy(b).applyMatrix4(inverseReference).y, localPoint.copy(c).applyMatrix4(inverseReference).y);
          if (minY > options.maxLocalY) area = 0;
        }
        if (Number.isFinite(area) && area > 1e-12) meshArea += area;
        cumulativeAreas[triangle] = meshArea;
      }
      if (meshArea > 0) {
        totalArea += meshArea;
        meshes.push({ mesh, start, cumulativeAreas, area: meshArea, cumulativeArea: totalArea });
      }
    });
    if (!meshes.length) return [];

    const samples = [];
    let meshIndex = 0;
    for (let i = 0; i < budget; i++) {
      const area = totalArea * (i + 0.5) / budget;
      while (meshes[meshIndex].cumulativeArea < area) meshIndex++;
      const record = meshes[meshIndex];
      const mesh = record.mesh;
      const meshArea = area - (record.cumulativeArea - record.area);
      let low = 0;
      let high = record.cumulativeAreas.length - 1;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (record.cumulativeAreas[middle] < meshArea) low = middle + 1;
        else high = middle;
      }
      const vertex = record.start + low * 3;
      const position = mesh.geometry.attributes.position;
      const index = mesh.geometry.index;
      a.fromBufferAttribute(position, index ? index.getX(vertex) : vertex);
      b.fromBufferAttribute(position, index ? index.getX(vertex + 1) : vertex + 1);
      c.fromBufferAttribute(position, index ? index.getX(vertex + 2) : vertex + 2);
      const u = Math.sqrt(radicalInverse(i + 1, 2));
      const v = radicalInverse(i + 1, 3);
      const local = a.clone().multiplyScalar(1 - u)
        .addScaledVector(b, u * (1 - v)).addScaledVector(c, u * v);
      const normal = edgeB.subVectors(b, a).cross(edgeC.subVectors(c, a)).normalize().clone();
      samples.push({
        mesh,
        position: local,
        normal,
        area: totalArea / budget,
        previousWorld: local.clone().applyMatrix4(mesh.matrixWorld),
        previousDepth: null,
      });
    }
    return samples;
  }

  // Directional vessel wakes are driven by measured translation, not heave,
  // yaw, a remembered velocity, a motor flag, or ocean animation time.
  function advanceMotion(state, measuredX, measuredZ, dt, options = {}) {
    const threshold = options.threshold === undefined ? 0.006 : options.threshold;
    const fullSpeed = options.fullSpeed === undefined ? 0.32 : options.fullSpeed;
    const rawSpeed = Math.hypot(measuredX, measuredZ);
    const response = 1 - Math.exp(-dt * 18);
    const oldX = state.velocityX || 0;
    const oldZ = state.velocityZ || 0;
    const stationary = rawSpeed <= threshold;
    state.velocityX = stationary ? 0 : oldX + (measuredX - oldX) * response;
    state.velocityZ = stationary ? 0 : oldZ + (measuredZ - oldZ) * response;
    const speed = Math.hypot(state.velocityX, state.velocityZ);
    return {
      rawSpeed,
      speed,
      moving: !stationary,
      shipWakeActive: options.isShip === true && !stationary,
      speedAmount: stationary ? 0 : smoothstep(threshold, fullSpeed, speed),
      directionX: speed > 1e-8 ? state.velocityX / speed : 0,
      directionZ: speed > 1e-8 ? state.velocityZ / speed : 1,
      accelerationX: (state.velocityX - oldX) / dt,
      accelerationZ: (state.velocityZ - oldZ) / dt,
    };
  }

  // Contact remains active at rest, but has no stern/propeller trail. Relative
  // water-level changes produce small geometry-local diffraction/contact waves.
  function contactResponse(normal, velocity, depth, previousDepth, dt, draft, gain = 1) {
    const contactBand = Math.max(0.008, Math.min(0.025, draft * 0.3));
    const maxDepth = Math.max(0.04, draft * 2.5);
    const wet = smoothstep(-contactBand, contactBand, depth);
    if (wet === 0 || depth > maxDepth) return null;
    const depthFade = 1 - smoothstep(draft, maxDepth, depth);
    const levelSpeed = previousDepth === null ? 0 : clamp((depth - previousDepth) / dt, -0.35, 0.35);
    const normalSpeed = velocity.x * normal.x + velocity.z * normal.z - levelSpeed * normal.y;
    const pressure = normalSpeed * Math.abs(normalSpeed) * 0.045;
    const contact = levelSpeed * 0.007 * (0.25 + Math.abs(normal.y));
    const impulse = clamp((pressure + contact) * wet * depthFade * gain, -0.018, 0.018);
    if (Math.abs(impulse) < 1e-6) return null;
    return { impulse, target: impulse * 0.45, turbulence: clamp(Math.abs(normalSpeed) * 0.2, 0, 0.25) };
  }

  return { sampleSurface, advanceMotion, contactResponse };
});
