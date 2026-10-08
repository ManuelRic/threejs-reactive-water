/* Local foam emitters. The persistent GPU field, not these sources, is the trail. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WakeFoam = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x-a)/(b-a))); return t*t*(3-2*t); };
  function sources({ isShip, speed, minSpeed = .001, gravity = 9.81 / 40, strength = 1, bow, stern, beam, length,
    dx, dz, nearWakeLength = .9, turbulence = 1, propellerWash = 1, turn = 0, propellers = [] }) {
    if (!isShip || !(speed > minSpeed) || !(beam > 0) || !(length > 0) || !(gravity > 0)) return [];
    if (![speed, gravity, minSpeed, strength, beam, length, dx, dz, nearWakeLength, turbulence,
      propellerWash, turn, bow?.x, bow?.z, stern?.x, stern?.z].every(Number.isFinite)) return [];
    const norm = Math.hypot(dx, dz);
    if (!(norm > 0)) return [];
    const froude = speed / Math.sqrt(gravity * length);
    const moving = smooth(minSpeed, minSpeed + .009, speed);
    const intensity = moving * (.035 + .52 * smooth(.06, .65, froude)) * strength;
    if (!(intensity > .001)) return [];
    const tx = -dx / norm, tz = -dz / norm, sx = -dz / norm, sz = dx / norm;
    const sourceLength = Math.max(.025, Math.min(length * .14, beam * .8)) *
      Math.max(.5, Math.min(1.5, nearWakeLength / .9));
    const result = [{ x: stern.x, z: stern.z, axisX: tx, axisZ: tz,
      length: sourceLength, startWidth: beam * .44, endWidth: beam * .72,
      intensity: intensity * .58, churn: Math.min(1, turbulence * .65) }];
    for (const propeller of propellers) {
      if (![propeller?.x, propeller?.z].every(Number.isFinite)) continue;
      result.push({ x: propeller.x, z: propeller.z, axisX: tx, axisZ: tz,
        length: sourceLength * .85, startWidth: beam * .18, endWidth: beam * .4,
        intensity: (intensity + moving * .035 * strength) * Math.max(0, propellerWash),
        churn: Math.min(1, turbulence) });
    }
    // The stern releases a pair of weak shear layers into the wake. They are
    // deliberately short source patches: the persistent, advected foam field
    // forms the trail, rather than drawing fixed white V-lines on the water.
    const wakeFoam = intensity * (.11 + .20 * smooth(.22, .65, froude));
    const turnAmount = Math.max(-1, Math.min(1, turn));
    if (wakeFoam > .002) for (const side of [-1, 1]) {
      const turnSide = Math.sign(turnAmount) * side;
      const sideScale = 1 + Math.max(0, turnSide) * Math.abs(turnAmount) * .32 -
        Math.max(0, -turnSide) * Math.abs(turnAmount) * .16;
      result.push({
        x: stern.x + sx * beam * .28 * side, z: stern.z + sz * beam * .28 * side,
        axisX: tx + sx * (.13 + Math.max(0, turnSide) * .08) * side,
        axisZ: tz + sz * (.13 + Math.max(0, turnSide) * .08) * side,
        length: sourceLength * 1.12, startWidth: beam * .08, endWidth: beam * .18,
        intensity: wakeFoam * sideScale, churn: Math.min(1, turbulence * .58),
      });
    }
    // Side-wave foam is generated from the evolving Kelvin crests on the GPU.
    // A patch attached to today's heading cannot follow an older turning wake.
    // A displacement hull does not make a white horseshoe at its bow. Leave
    // bow foam to genuinely fast/planing craft; ordinary ships show pressure
    // shoulders there and concentrate visible aeration at stern/propellers.
    const bowBreaking = smooth(.78, .98, froude);
    if (bowBreaking > .001) for (const side of [-1, 1]) result.push({
      x: bow.x + sx * beam * .12 * side, z: bow.z + sz * beam * .12 * side,
      axisX: tx + sx * .32 * side, axisZ: tz + sz * .32 * side,
      length: sourceLength * .42, startWidth: beam * .07, endWidth: beam * .14,
      intensity: intensity * .018 * bowBreaking, churn: Math.min(1, turbulence * .16),
    });
    // Lighter stern/propeller aeration leaves more water visible in the trail.
    for (const source of result) source.intensity *= .45;
    return result;
  }
  return { sources };
});
