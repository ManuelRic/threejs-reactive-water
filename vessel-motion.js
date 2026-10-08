/* Hull-scale water-plane fitting and stable damped heave/pitch/roll. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VesselMotion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function waterPlane({ x, z, dx, dz, bow, stern, beam }, heightAt) {
    // Symmetric samples in the waterplane, narrower at the bow/stern. Fitting
    // a rigid plane averages short chop while retaining hull-scale wave slopes.
    const length = bow + stern, middle = (bow - stern) * .5;
    let weight = 0, h = 0, hhAlong = 0, hhAcross = 0, aa = 0, bb = 0;
    for (const station of [-.42, -.21, 0, .21, .42]) {
      const a = length * station;
      const width = beam * (Math.abs(station) > .4 ? .22 : .4);
      for (const side of [-1, 0, 1]) {
        const b = width * side, w = side === 0 ? 2 : 1;
        const height = heightAt(x + dx * (middle + a) - dz * b,
          z + dz * (middle + a) + dx * b);
        weight += w; h += height * w;
        hhAlong += height * a * w; hhAcross += height * b * w;
        aa += a * a * w; bb += b * b * w;
      }
    }
    const along = hhAlong / Math.max(aa, 1e-9), across = hhAcross / Math.max(bb, 1e-9);
    return { height: h / weight - along * middle,
      pitch: Math.atan(along), roll: Math.atan(across) };
  }

  function spring(position, velocity, target, omega, dt) {
    // Exact critically damped solution for a fixed target over this time step.
    const offset = position - target, c = velocity + omega * offset;
    const decay = Math.exp(-omega * dt);
    return [target + (offset + c * dt) * decay, (velocity - omega * c * dt) * decay];
  }

  function advance(state, plane, dt, { length, beam, draft, gravity, buoyancy = 1, reset = false,
    maxAirGap = Math.max(.0015, draft * .25) }) {
    const target = { height: plane.height - draft,
      pitch: clamp(plane.pitch, -.38, .38), roll: clamp(plane.roll, -.32, .32) };
    const response = .3 + .7 * clamp(buoyancy, 0, 2);
    const frequencies = {
      height: clamp(Math.sqrt(gravity / Math.max(draft, .004)) * 1.4, 3, 10),
      pitch: clamp(Math.sqrt(gravity / Math.max(length, .02)) * 5, 1.5, 6),
      roll: clamp(Math.sqrt(gravity / Math.max(beam, .01)) * 2, 1.5, 6),
    };
    for (const axis of ['height', 'pitch', 'roll']) {
      const velocity = axis + 'Velocity';
      if (reset || !Number.isFinite(state[axis])) {
        state[axis] = target[axis]; state[velocity] = 0;
      } else {
        [state[axis], state[velocity]] = spring(state[axis], state[velocity] || 0,
          target[axis], frequencies[axis] * response, Math.max(0, Math.min(dt, .1)));
      }
    }
    // A purely damped heave spring can keep a lightweight visual hull at its
    // old elevation after the sampled wave has fallen. Limit that separation:
    // it is a contact correction, not an artificial rocking motion. The small
    // allowance retains a natural response while keeping the keel in water.
    const highestContact = target.height + Math.max(0, maxAirGap);
    if (state.height > highestContact) {
      state.height = highestContact;
      state.heightVelocity = Math.min(0, state.heightVelocity || 0);
    }
    return state;
  }
  return { waterPlane, advance };
});
