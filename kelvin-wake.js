/* Finite-band, linear deep-water ship wakes. No radial ship impulses. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KelvinWake = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const angles = [0, -.2, .2, -.4, .4, -.6, .6, -.8, .8, -1, 1, -1.2, 1.2];
  const KELVIN_HALF_ANGLE = Math.asin(1 / 3);
  const KELVIN_SLOPE = Math.tan(KELVIN_HALF_ANGLE);
  const smooth = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  function dispersion(speed, theta, gravity) {
    const phaseSpeed = speed * Math.cos(theta);
    const k = gravity / (phaseSpeed * phaseSpeed);
    return { k, omega: Math.sqrt(gravity * k), groupSpeed: phaseSpeed * .5 };
  }
  // A restrained rendering response, not a resistance/CFD model. Scale by
  // hull-relative speed so harbour manoeuvres cannot look like fast running.
  // Keep a nonzero low-speed response; the U^2 pressure still tends to zero.
  function waveMakingResponse(speed, length, gravity) {
    return smooth(.12, .50, speed / Math.sqrt(gravity * length));
  }
  function turnFromMotion(pathTurn, yawRate, lateralSpeed, speed) {
    if (![pathTurn, yawRate, lateralSpeed, speed].every(Number.isFinite)) return 0;
    const clamp = value => Math.max(-1, Math.min(1, value));
    // Positive turn means the outside lies on (-dz, dx). A positive path
    // cross-product points INSIDE the turn; Three.js yaw has the opposite sign.
    return clamp(-pathTurn * .55 + clamp(yawRate * 2.4) * .34 +
      clamp(lateralSpeed / Math.max(speed, .001)) * .22);
  }
  function emit(options) {
    const { x, z, dx, dz, speed, length, beam, draft, time, dt } = options;
    if (!options.isShip || speed <= (options.minSpeed ?? .006) || !(length > 0) || !(beam > 0)) return [];
    if (![x, z, dx, dz, speed, length, beam, draft, time, dt].every(Number.isFinite) || dt <= 0) return [];
    const gravity = options.gravity ?? 9.81;
    const minWavelength = options.minWavelength ?? .01;
    const bow = options.bow ?? length * .5;
    const stern = length - bow;
    const turn = Math.max(-1, Math.min(1, options.turn ?? 0));
    if (!(gravity > 0) || !(minWavelength > 0) || !(draft > 0) ||
      !(bow >= 0) || !(stern >= 0)) return [];
    if (![gravity, minWavelength, options.strength ?? 1, options.bowStrength ?? 1,
      options.sternStrength ?? 1, turn].every(Number.isFinite)) return [];
    const norm = Math.hypot(dx, dz);
    if (!norm || !Number.isFinite(speed)) return [];
    const fx = dx / norm, fz = dz / norm;
    const wakeGain = .20 + .55 * waveMakingResponse(speed, length, gravity);
    const packets = [];
    for (const theta of angles) {
      const wave = dispersion(speed, theta, gravity);
      const wavelength = 2 * Math.PI / wave.k;
      // Suppress unresolved waves, never invent a speed-independent wavelength.
      const resolved = smooth(1, 2, wavelength / minWavelength);
      // A finite hull does not efficiently excite wavelengths many hull lengths
      // long. Beam and draft also suppress the short, oblique wave components.
      const hullFilter = (1 - Math.exp(-Math.pow(wave.k * length * .5, 2))) *
        Math.exp(-Math.pow(wave.k * beam * Math.sin(theta) * .45, 2) - wave.k * draft * .25);
      const amplitude = Math.min(draft * .65, beam * .055, .12 / wave.k,
        speed * speed / gravity * .028) * hullFilter * resolved * wakeGain * (options.strength ?? 1);
      if (!Number.isFinite(amplitude) || amplitude < .00001) continue;
      const nx = fx * Math.cos(theta) - fz * Math.sin(theta);
      const nz = fz * Math.cos(theta) + fx * Math.sin(theta);
      // Keep several alternating crests/troughs inside the envelope. The old
      // wavelength * .1 circular kernel was mostly a single positive mound.
      // Quality filters amplitude only; it must not change the physical shape.
      const width = Math.max(beam * .6, wavelength * .65);
      const crossWidth = Math.max(beam * .65, wavelength * .22);
      // Normalize temporal overlap: changing emission rate or envelope size
      // cannot pump more height into the same section of the wake.
      const overlapRate = Math.hypot((speed * Math.cos(theta) - wave.groupSpeed) / width,
        speed * Math.sin(theta) / crossWidth);
      // The track itself bends from one emission to the next. Bias only the
      // divergent components: the outside of a turn sheds a broader, stronger
      // shoulder while the inside is compressed. Centreline waves stay neutral.
      const divergentAmount = Math.abs(Math.sin(theta));
      const turnWeight = 1 + turn * Math.sign(Math.sin(theta)) * divergentAmount * .28;
      // Bow elevation + stern depression interfere, with separation set by the
      // wet hull rather than the mesh's superstructure or triangle density.
      for (const end of [1, -1]) {
        // Both sources live just inside the physical waterline.  Placing the
        // bow source at a generic forward hull offset can put it ahead of a
        // pointed or asymmetric model, which reads as water moving before the
        // ship reaches it.
        const inset = Math.min(beam * .05, (end > 0 ? bow : stern) * .08);
        const offset = end > 0 ? bow - inset : -stern + inset;
        packets.push({ x: x + fx * offset, z: z + fz * offset,
          nx, nz, k: wave.k, omega: wave.omega,
          vx: nx * wave.groupSpeed, vz: nz * wave.groupSpeed,
          width, crossWidth, fx, fz, speed, beam,
          frontSoftness: Math.max(beam * .3, wavelength * .12),
          amplitude: amplitude * turnWeight * end * (end > 0 ? (options.bowStrength ?? 1) : .72 * (options.sternStrength ?? 1)) *
            dt * overlapRate * 4 / (Math.sqrt(Math.PI) * angles.length),
          time, owner: options.owner });
      }
    }
    return packets;
  }
  function evolve(packet, time, lifetime = 8) {
    const age = time - packet.time;
    if (age < 0 || age >= lifetime) return null;
    const fade = Math.max(0, Math.min(1, (lifetime - age) / (lifetime * .25)));
    // Finite-band dispersive spreading; energy falls as the footprint widens.
    const spread = Math.hypot(packet.vx, packet.vz) * age * .025;
    const width = packet.width + spread;
    const crossWidth = packet.crossWidth + spread * .5;
    return { x: packet.x + packet.vx * age, z: packet.z + packet.vz * age,
      nx: packet.nx, nz: packet.nz, width, crossWidth,
      fx: packet.fx, fz: packet.fz, beam: packet.beam, frontSoftness: packet.frontSoftness,
      // This virtual source continues on its original heading after a turn or
      // stop. Existing waves never rotate or snap to the vessel's new pose.
      headX: packet.x + packet.fx * packet.speed * age,
      headZ: packet.z + packet.fz * packet.speed * age,
      k: packet.k, phase: (packet.k * Math.hypot(packet.vx, packet.vz) - packet.omega) * age,
      amplitude: packet.amplitude * fade * Math.sqrt(packet.width * packet.crossWidth / (width * crossWidth)) };
  }
  function height(packet, x, z) {
    const rx = x - packet.x, rz = z - packet.z;
    const along = rx * packet.nx + rz * packet.nz;
    const across = -rx * packet.nz + rz * packet.nx;
    const r2 = (along / packet.width) ** 2 + (across / packet.crossWidth) ** 2;
    if (r2 >= 9) return 0;
    const hx = packet.headX - x, hz = packet.headZ - z;
    const behind = hx * packet.fx + hz * packet.fz;
    const lateral = Math.abs(-hx * packet.fz + hz * packet.fx);
    const halfWidth = packet.beam * .5 + Math.max(0, behind) * KELVIN_SLOPE;
    const causal = smooth(0, packet.frontSoftness, behind) *
      (1 - smooth(halfWidth, halfWidth + packet.beam * .35, lateral));
    const edge = 1 - smooth(6.25, 9, r2);
    return packet.amplitude * Math.exp(-r2) * edge * causal * Math.cos(packet.k * along + packet.phase);
  }
  // Resolved near-hull displacement remains visible when the deep-water
  // gravity-wave wavelength falls below the grid at manoeuvring speeds.
  function hull(options) {
    const { x, z, dx, dz, speed, length, beam, draft, gravity, owner } = options;
    const strength = options.strength ?? 1;
    const bow = options.bow ?? length * .5;
    const turn = Math.max(-1, Math.min(1, options.turn ?? 0));
    if (!options.isShip || ![x, z, dx, dz, speed, length, beam, draft, gravity, strength, bow, turn].every(Number.isFinite) ||
      speed <= (options.minSpeed ?? .001) || Math.min(length, beam, draft, gravity, strength) <= 0) return null;
    const norm = Math.hypot(dx, dz);
    if (!norm) return null;
    // The previous .28 head coefficient produced a steep bow ridge even at
    // harbour speed. Keep only a small contact ripple at low Froude numbers,
    // then grow smoothly, with conservative beam/draft limits at higher speed.
    const pressureCoefficient = .035 + .045 * waveMakingResponse(speed, length, gravity);
    return { x, z, dx: dx / norm, dz: dz / norm, length, beam, turn,
      bow, owner,
      amplitude: Math.min(draft * .25, beam * .028,
        speed * speed / (2 * gravity) * pressureCoefficient) * strength };
  }
  function hullHeight(hull, x, z) {
    const rx = x - hull.x, rz = z - hull.z;
    const a = rx * hull.dx + rz * hull.dz, side = (-rx * hull.dz + rz * hull.dx) / hull.beam;
    const b = Math.abs(side) * hull.beam;
    const aft = (hull.bow - a) / hull.beam;
    // A moving hull does have a compressed contact ridge at its bow, but no
    // broad displacement should exist in untouched water ahead of it.  Keep a
    // sub-beam transition for antialiasing and clip everything beyond it.
    if (aft < -.05 || aft >= 4 || b >= hull.beam * 3) return 0;

    // The bow must read as two waterline shoulders, not a rounded bump ahead
    // of the ship. The shoulders begin a fraction of a beam behind the stem
    // and open gradually into the divergent wake.
    const bowEnvelope = smooth(.02, .14, aft) * (1 - smooth(.70, 1.45, aft));
    const turnSide = Math.sign(hull.turn) * Math.sign(side);
    const turnMagnitude = Math.abs(hull.turn);
    const outsideScale = 1 + Math.max(0, turnSide) * turnMagnitude * .44 -
      Math.max(0, -turnSide) * turnMagnitude * .24;
    const shoulder = .20 + Math.min(1.70, Math.max(0, aft - .08)) *
      (.20 + Math.max(0, turnSide) * turnMagnitude * .07);
    const cross = b / hull.beam;
    const crest = Math.exp(-Math.pow((cross - shoulder) / .17, 2));
    const trough = Math.exp(-Math.pow((cross - shoulder - .30) / .27, 2));
    const edge = (1 - smooth(3, 4, Math.abs(aft))) * (1 - smooth(2.5, 3, cross));
    const alongHull = Math.max(0, Math.min(1, (a + hull.length - hull.bow) / hull.length));
    const halfHull = .12 + .38 * Math.pow(Math.sin(Math.PI * alongHull), .65);
    const sideWaterline = halfHull + .08;
    const sideRidge = Math.exp(-Math.pow((cross - sideWaterline) / .17, 2));
    const sideTrough = Math.exp(-Math.pow((cross - sideWaterline - .30) / .25, 2));
    const sideEnvelope = smooth(.04, .20, alongHull) * (1 - smooth(.94, 1, alongHull));
    const bowPressure = bowEnvelope * outsideScale * (crest - .38 * trough);
    const sidePressure = .13 * sideEnvelope * outsideScale * (sideRidge - .48 * sideTrough);
    const frontCausality = 1 - smooth(0, .05, -aft);
    return hull.amplitude * frontCausality * edge * (bowPressure + sidePressure);
  }
  const hullGLSL = `float hullHeight(vec2 p, float len, float beam, float bow, float turn) {
    float aft = (bow - p.x) / beam;
    // Only the tiny bow-contact transition is allowed ahead of the hull.
    if (aft < -.05 || aft >= 4.0 || abs(p.y) >= beam * 3.0) return 0.0;
    // Two narrow shoulders begin just aft of the bow and open gradually.
    // This avoids the visual of a circular bow-impact patch.
    float bowEnvelope = smoothstep(.02, .14, aft) * (1.0 - smoothstep(.70, 1.45, aft));
    float signedSide = p.y / beam;
    float turnSide = sign(turn) * sign(signedSide);
    float turnMagnitude = abs(turn);
    float outsideScale = 1.0 + max(0.0, turnSide) * turnMagnitude * .44 -
      max(0.0, -turnSide) * turnMagnitude * .24;
    float shoulder = .20 + min(1.70, max(0.0, aft - .08)) *
      (.20 + max(0.0, turnSide) * turnMagnitude * .07);
    float cross = abs(p.y) / beam;
    float crest = exp(-pow((cross - shoulder) / .17, 2.0));
    float trough = exp(-pow((cross - shoulder - .30) / .27, 2.0));
    float edge = (1.0 - smoothstep(3.0, 4.0, abs(aft))) * (1.0 - smoothstep(2.5, 3.0, cross));
    float alongHull = clamp((p.x + len - bow) / len, 0.0, 1.0);
    // Guard the endpoint against a tiny negative sin() rounding result before
    // applying the fractional exponent (which would otherwise produce NaN).
    float halfHull = .12 + .38 * pow(max(0.0, sin(3.14159265359 * alongHull)), .65);
    float sideWaterline = halfHull + .08;
    float sideRidge = exp(-pow((cross - sideWaterline) / .17, 2.0));
    float sideTrough = exp(-pow((cross - sideWaterline - .30) / .25, 2.0));
    float sideEnvelope = smoothstep(.04, .20, alongHull) * (1.0 - smoothstep(.94, 1.0, alongHull));
    float bowPressure = bowEnvelope * outsideScale * (crest - .38 * trough);
    float sidePressure = .13 * sideEnvelope * outsideScale * (sideRidge - .48 * sideTrough);
    float frontCausality = 1.0 - smoothstep(0.0, .05, -aft);
    return frontCausality * edge * (bowPressure + sidePressure);
  }`;
  return { emit, evolve, height, dispersion, turnFromMotion, hull, hullHeight, hullGLSL, KELVIN_HALF_ANGLE };
});
