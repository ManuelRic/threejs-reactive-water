/* CPU counterpart of the ocean vertex displacement, sampled in world space. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OceanSurface = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const spectral = [
    [1,.18,2.6,.56,.42,.3], [.92,.38,3.7,.72,.32,2.1], [.72,.7,5.2,.96,.24,4.5],
    [.36,.94,6.8,1.15,.18,1.4], [-.1,1,8.6,1.42,.14,5.3], [-.42,.91,10.8,1.68,.105,.8],
    [.58,-.82,12.6,1.94,.08,3.7], [-.74,.66,15.2,2.22,.06,2.8], [.98,-.22,18.5,2.55,.045,5.9],
    [-.88,-.48,21,2.88,.034,1.9], [.18,.98,24.8,3.25,.026,4.1], [-.26,.96,29.5,3.68,.02,.55],
    [.64,.77,34,4.05,.016,3.2], [-.56,.83,40,4.52,.012,5.05], [.86,.5,48,5.1,.009,2.45],
    [-.98,.18,56,5.75,.007,4.85],
  ];
  const gerstner = [[1,.24,4.2,.85,.55,.62], [.82,.55,6.8,1.22,.32,.48],
    [-.35,1,10.5,1.85,.18,.34], [.2,1,17,2.65,.08,.22], [-1,.15,24,3.4,.045,.18]];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  function sampler({ spectral: useSpectral, strength, frequency, speed, sharpness, choppiness,
    windDirection, windSpeed, spacing, time }) {
    const wx = Math.cos(windDirection), wz = Math.sin(windDirection);
    const scale = strength * clamp(windSpeed / 9, .35, 1.85);
    const storm = smooth(.08, .12, strength);
    const waves = (useSpectral ? spectral : gerstner).map(([x,z,k,omega,a,extra]) => {
      const norm = Math.hypot(x,z), lod = 1-smooth(1.5,3,k*frequency*spacing);
      return { dx: (x*wx-z*wz)/norm, dz: (x*wz+z*wx)/norm, k: k*frequency,
        phase: time*omega*speed+(useSpectral ? extra : 0), amplitude: a*scale*lod,
        chop: sharpness*choppiness*(useSpectral ? .18 : extra*(1+storm*.55)) };
    });
    function displacement(x, z) {
      let hx = 0, height = 0, hz = 0;
      for (const w of waves) {
        const phase = (x*w.dx+z*w.dz)*w.k+w.phase, crest = Math.sin(phase);
        const y = useSpectral ? crest : crest + Math.pow(Math.max(crest,0),3)*storm*.85*sharpness -
          Math.pow(Math.max(-crest,0),2)*storm*.16*sharpness;
        const horizontal = Math.cos(phase)*w.amplitude*w.chop;
        hx += horizontal*w.dx; hz += horizontal*w.dz; height += y*w.amplitude;
      }
      return { x: hx, y: height, z: hz };
    }
    function height(x, z) {
      // Invert Gerstner horizontal displacement before asking for height at a
      // world coordinate. Using the unshifted phase made hulls miss steep crests.
      let px = x, pz = z;
      for (let i = 0; i < 3; i++) {
        const d = displacement(px,pz); px = x-d.x; pz = z-d.z;
      }
      return displacement(px,pz).y;
    }
    return { height, displacement };
  }
  return { sampler };
});
