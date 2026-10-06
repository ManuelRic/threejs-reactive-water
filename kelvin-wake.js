/* Finite-band, linear deep-water ship wakes. No radial ship impulses. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KelvinWake = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const angles = [0, -.3, .3, -.6, .6, -.9, .9, -1.2, 1.2];
  const KELVIN_HALF_ANGLE = Math.asin(1 / 3);
  function dispersion(speed, theta, gravity) {
    const phaseSpeed = speed * Math.cos(theta);
    const k = gravity / (phaseSpeed * phaseSpeed);
    return { k, omega: Math.sqrt(gravity * k), groupSpeed: phaseSpeed * .5 };
  }
  function emit(options) {
    const { x, z, dx, dz, speed, length, beam, draft, time, dt } = options;
    if (!options.isShip || speed <= (options.minSpeed ?? .006) || !(length > 0) || !(beam > 0)) return [];
    if (![x, z, dx, dz, speed, length, beam, draft, time, dt].every(Number.isFinite) || dt <= 0) return [];
    const gravity = options.gravity || 9.81;
    const minWavelength = options.minWavelength || .01;
    const norm = Math.hypot(dx, dz);
    if (!norm || !Number.isFinite(speed)) return [];
    const fx = dx / norm, fz = dz / norm;
    const packets = [];
    for (const theta of angles) {
      const wave = dispersion(speed, theta, gravity);
      const wavelength = 2 * Math.PI / wave.k;
      // Suppress unresolved waves, never invent a speed-independent wavelength.
      const resolved = Math.max(0, Math.min(1, wavelength / minWavelength - 1));
      const hullFilter = Math.exp(-Math.pow(wave.k * beam * Math.sin(theta) * .45, 2) - wave.k * draft * .25);
      const amplitude = Math.min(.035, speed * speed / gravity * .045) * hullFilter * resolved * (options.strength ?? 1);
      if (amplitude < .00001) continue;
      const nx = fx * Math.cos(theta) - fz * Math.sin(theta);
      const nz = fz * Math.cos(theta) + fx * Math.sin(theta);
      // Bow elevation + stern depression interfere, with separation set by the
      // wet hull rather than the mesh's superstructure or triangle density.
      for (const end of [1, -1]) {
        const offset = length * .45 * end;
        packets.push({ x: x + fx * offset, z: z + fz * offset,
          nx, nz, k: wave.k, omega: wave.omega,
          vx: nx * wave.groupSpeed, vz: nz * wave.groupSpeed,
          width: Math.max(beam * .6, minWavelength * .6, Math.min(length * .4, wavelength * .1)),
          amplitude: amplitude * end * (end > 0 ? (options.bowStrength ?? 1) : .72 * (options.sternStrength ?? 1)) * dt * 6 / angles.length,
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
    const width = packet.width + Math.hypot(packet.vx, packet.vz) * age * .045;
    return { x: packet.x + packet.vx * age, z: packet.z + packet.vz * age,
      nx: packet.nx, nz: packet.nz, width,
      k: packet.k, phase: (packet.k * Math.hypot(packet.vx, packet.vz) - packet.omega) * age,
      amplitude: packet.amplitude * fade * packet.width / width };
  }
  function height(packet, x, z) {
    const rx = x - packet.x, rz = z - packet.z;
    const r2 = (rx * rx + rz * rz) / (packet.width * packet.width);
    if (r2 >= 9) return 0;
    const edge = Math.max(0, Math.min(1, 9 - r2));
    return packet.amplitude * Math.exp(-r2) * edge * Math.cos(packet.k * (rx * packet.nx + rz * packet.nz) + packet.phase);
  }
  return { emit, evolve, height, dispersion, KELVIN_HALF_ANGLE };
});
