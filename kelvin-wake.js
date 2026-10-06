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
  function emit(options) {
    const { x, z, dx, dz, speed, length, beam, draft, time, dt } = options;
    if (!options.isShip || speed <= (options.minSpeed ?? .006) || !(length > 0) || !(beam > 0)) return [];
    if (![x, z, dx, dz, speed, length, beam, draft, time, dt].every(Number.isFinite) || dt <= 0) return [];
    const gravity = options.gravity ?? 9.81;
    const minWavelength = options.minWavelength ?? .01;
    if (!(gravity > 0) || !(minWavelength > 0) || !(draft > 0)) return [];
    if (![gravity, minWavelength, options.strength ?? 1, options.bowStrength ?? 1,
      options.sternStrength ?? 1].every(Number.isFinite)) return [];
    const norm = Math.hypot(dx, dz);
    if (!norm || !Number.isFinite(speed)) return [];
    const fx = dx / norm, fz = dz / norm;
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
        speed * speed / gravity * .028) * hullFilter * resolved * (options.strength ?? 1);
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
      // Bow elevation + stern depression interfere, with separation set by the
      // wet hull rather than the mesh's superstructure or triangle density.
      for (const end of [1, -1]) {
        const offset = length * .45 * end;
        packets.push({ x: x + fx * offset, z: z + fz * offset,
          nx, nz, k: wave.k, omega: wave.omega,
          vx: nx * wave.groupSpeed, vz: nz * wave.groupSpeed,
          width, crossWidth, fx, fz, speed, beam,
          frontSoftness: Math.max(beam * .3, wavelength * .12),
          amplitude: amplitude * end * (end > 0 ? (options.bowStrength ?? 1) : .72 * (options.sternStrength ?? 1)) *
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
  return { emit, evolve, height, dispersion, KELVIN_HALF_ANGLE };
});
