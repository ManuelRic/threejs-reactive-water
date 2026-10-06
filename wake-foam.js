/* Local foam emitters. The persistent GPU field, not these sources, is the trail. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WakeFoam = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function sources({ isShip, speedAmount, strength = 1, bow, stern, beam, length,
    dx, dz, nearWakeLength = .9, turbulence = 1, propellerWash = 1, propellers = [] }) {
    if (!isShip || !(speedAmount > .12) || !(beam > 0) || !(length > 0)) return [];
    if (![speedAmount, strength, beam, length, dx, dz, nearWakeLength, turbulence,
      propellerWash, bow?.x, bow?.z, stern?.x, stern?.z].every(Number.isFinite)) return [];
    const norm = Math.hypot(dx, dz);
    if (!(norm > 0)) return [];
    const t = Math.max(0, Math.min(1, (speedAmount - .12) / .6));
    const intensity = t * t * (3 - 2 * t) * strength;
    if (!(intensity > .001)) return [];
    const tx = -dx / norm, tz = -dz / norm, sx = -dz / norm, sz = dx / norm;
    const sourceLength = Math.max(.025, Math.min(length * .14, beam * .8)) *
      Math.max(.5, Math.min(1.5, nearWakeLength / .9));
    const result = [{ x: stern.x, z: stern.z, axisX: tx, axisZ: tz,
      length: sourceLength, startWidth: beam * .44, endWidth: beam * .72,
      intensity: intensity * .72, churn: Math.min(1, turbulence * .85) }];
    for (const propeller of propellers) {
      if (![propeller?.x, propeller?.z].every(Number.isFinite)) continue;
      result.push({ x: propeller.x, z: propeller.z, axisX: tx, axisZ: tz,
        length: sourceLength * .85, startWidth: beam * .18, endWidth: beam * .4,
        intensity: intensity * Math.max(0, propellerWash), churn: Math.min(1, turbulence) });
    }
    // A little local bow breaking is distinct from the distant gravity waves.
    // No continuously white V-arms or hull-length foam rails.
    for (const side of [-1, 1]) result.push({
      x: bow.x + sx * beam * .12 * side, z: bow.z + sz * beam * .12 * side,
      axisX: tx + sx * .45 * side, axisZ: tz + sz * .45 * side,
      length: sourceLength * .55, startWidth: beam * .10, endWidth: beam * .22,
      intensity: intensity * .24, churn: Math.min(1, turbulence * .35),
    });
    return result;
  }
  return { sources };
});
