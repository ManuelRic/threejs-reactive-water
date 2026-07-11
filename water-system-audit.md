# Water And Wake System Audit

## Scope

This project remains a directly loaded Three.js r113 application. The implementation
therefore stays in `index.js` and standalone GLSL files rather than introducing a
module bundler. One scene unit is treated as one meter. The included cargo model is
demonstration scale (roughly 0.6 m long); a full-size ship must be imported at its
real dimensions and run in a correspondingly larger world-space wake domain.

The goal of this pass is coherent motion: hull-generated height displacement,
world-space propagation, continuous curved history, and transported foam. It does
not claim to be a full three-dimensional CFD solver.

## Technical Audit

### Renderer and GPU features

- Three.js: r113, loaded as a browser global.
- Renderer: `THREE.WebGLRenderer`; this is WebGL, not WebGPU.
- Preferred path: WebGL2. WebGL1 remains a best-effort fallback.
- Runtime probes: float color buffers, float linear filtering, timer queries,
  maximum texture size, and vertex texture units.
- Color pipeline: sRGB output encoding, ACES filmic tone mapping, and explicit
  exposure.
- Dynamic height target: RGBA floating point, ping-ponged at 256, 384, or 512.
- Dynamic foam target: RGBA floating point, ping-ponged at 192, 256, or 384.
- Pressure source: 256 x 256 RGBA floating-point `DataTexture`.
- Current hull/foam source: 384 x 384 RGBA8 `DataTexture`.
- Reflection and caustics targets: 384, 640, or 1024 depending on quality.

`window.waterLab.capabilities` exposes the detected path. GPU timing is shown when
`EXT_disjoint_timer_query_webgl2` or its WebGL1 equivalent is available.

### Original ocean

The old control called `FFT waves` selected a deterministic 16-band sum of sine
waves. It was not an FFT or Tessendorf ocean. It already had useful world-space
stability, so that structure was retained and made wind-oriented. Large and medium
displacement is now shared by the vertex shader, fragment shader, caustics pass,
and CPU buoyancy model. Procedural capillary normals add only fine shading detail.

The water shader now combines:

- wind-oriented multi-band displacement and horizontal choppiness;
- heightfield wake displacement in the actual water vertices;
- normals reconstructed from both ocean and wake slopes;
- Schlick Fresnel with water F0 of approximately 0.0204;
- planar and cubemap reflection;
- Beer-Lambert-style absorption and deep-water body color;
- slope, foam, and aeration-dependent roughness;
- sun sparkle, forward scattering, and micro-normal ripples.

The repeated photo texture and pool-floor caustics are disabled by default because
they dominated the open-ocean look. Both remain optional controls.

### Original wake and foam

The original wake was visually tied to the current vessel frame and relied on
periodic trail painting. It could not preserve the path through a turn. The useful
part was a damped heightfield with this layout:

- `R`: water height displacement;
- `G`: vertical velocity;
- `B/A`: X/Z surface slope after the normal pass.

That heightfield is retained, but it now advances at a fixed simulation timestep.
The ship only supplies short-lived world-space source impulses. Once emitted, the
height and velocity remain in the ping-pong targets, propagate through neighboring
cells, and decay independently of the ship.

The persistent CPU foam field was replaced. Its GPU field stores:

- `R`: foam density;
- `G`: aeration/turbulence;
- `B/A`: horizontal X/Z transport velocity.

The direct source is deliberately short and local to the bow shoulders, stern,
and propellers. Long foam history comes from semi-Lagrangian advection, crest
generation, diffusion, and decay rather than a long source ribbon.

### Hull interaction

Objects are not point emitters. Registered collision meshes are sampled in world
space, tested against local ocean height, projected onto forward/side axes, and
grouped into hull cross-sections. The source model tracks:

- previous/current position and linear velocity;
- smoothed acceleration and angular velocity;
- heading alignment, lateral velocity, and turn direction;
- geometry-derived length and beam;
- configured draft and displaced volume;
- bow, shoulder, stern, and propeller locations.

Only an object with a ship profile or `ship` tag gets directional bow pressure,
Kelvin-guided divergent arms, stern suction, centerline turbulence, and propeller
wash. Sphere and cube profiles retain rounded and edge-driven generic displacement.

The nominal Kelvin half-angle starts at 19.5 degrees and narrows at high Froude
number. Turning scales the outer source up and broadens it while compressing the
inner source.

## Mathematical Model

For the wake height `h` and vertical velocity `v`, each fixed step approximates a
damped wave equation using axial and diagonal neighbors:

```text
v(t + dt) = damping * (v(t) + c^2 * (neighborAverage - h) * dt)
h(t + dt) = recovery * (h(t) + v(t + dt) * dt)
```

Hull pressure adds a bounded target-height correction and velocity impulse. The
solver is a single-valued shallow-water-like heightfield, so it can propagate and
reflect waves but cannot overturn them.

Foam uses backward semi-Lagrangian transport:

```text
previousUv = currentUv - horizontalFlow * dt / worldSize
foam = sample(previousFoam, previousUv)
```

Flow relaxes toward the negative wake-height gradient and hull source direction.
Foam generation uses vertical wake velocity, height gradient, curvature,
compression, and vorticity. Exponential decay is varied per cell to avoid uniform
dissolution. Noise only modulates breakup; it does not move the wake.

## Coordinate Spaces

All persistent fields use one canonical mapping:

```glsl
vec2 waterUv = worldPosition.xz / waterWorldSize + 0.5;
```

The water mesh, pressure texture, foam texture, hull masks, debug views, and GPU
buoyancy probes share this mapping. Propeller points are authored in hull-local
space and transformed with the object's world matrix.

## Render Pipeline

```text
object transforms + fixed-step clock
                 |
                 v
distributed hull samples and cross-sections (CPU)
                 |
        +--------+---------+
        |                  |
pressure/impulse map   local foam/flow source
        |                  |
        v                  v
height + velocity       foam + aeration + flow
GPU ping-pong           GPU ping-pong/advection
        |                  |
        +--------+---------+
                 v
        wake normal reconstruction
                 |
                 v
wind ocean + wake displacement + physical water shading
                 |
       reflection / environment / optional caustics
```

The entire 7 m x 7 m test area is persistent, so the full-domain GPU textures are
also the far-wake store. There is no moving local-grid boundary in this demo.

## Reusable Interactor API

```js
const handle = registerWaterInteractor({
  object,
  collisionMesh: object,
  objectType: 'containerShip',
  tags: ['ship'],
  draft: 0.08,
  displacedVolume: 0.026,
  sampleCount: 1200,
  headingYawOffset: Math.PI / 2,
  propellerPoints: [{ x: -0.28, y: 0.01, z: 0 }],
  turbulenceStrength: 1.0,
  wakeStrength: 1.0,
});

// Re-sample after replacing the collision geometry, or unregister on removal.
handle.rebuildSamples();
handle.dispose();
```

Supported profiles are `sphere`, `cube`, `displacementShip`, `containerShip`, and
`planingBoat`. Unknown objects receive a geometry-derived passive profile. A
stationary object does not continuously emit a directional wake.

Useful runtime API:

```js
waterLab.setQuality('medium');
waterLab.setDebugView('foam');
waterLab.clearWake();
waterLab.getDiagnostics();
```

## Quality Presets

| Setting | Low | Medium | Ultra |
| --- | ---: | ---: | ---: |
| Heightfield | 256 | 384 | 512 |
| Foam field | 192 | 256 | 384 |
| Ship samples | 420 | 900 | 1600 |
| Base max substeps | 2 | 3 | 4 |
| Reflection target | 384 | 640 | 1024 |
| Caustics target | 384 | 640 | 1024 |
| Reflection cadence | 4 frames | 2 frames | every frame |
| Caustics cadence | 4 frames | 2 frames | every frame |
| Pixel-ratio cap | 1.0 | 1.5 | 2.0 |
| Base ocean | 5-band Gerstner | 16-band spectral sum | 16-band spectral sum |
| Foam transport | 58% | 84% | 100% |
| Far-wake lifetime | 55% | 80% | 100% |

The substep cap is raised automatically when a selected 30/60/120 Hz fixed update
requires it for a 30 FPS render frame.

## Files

- `index.js`: capabilities, interactors, hull sources, fixed-step orchestration,
  GPU managers, buoyancy probes, presets, diagnostics, and validation modes.
- `index.html`, `styles.css`: tuning UI, debug selector, and diagnostics.
- `shaders/simulation/update_fragment.glsl`: dynamic height/velocity solver.
- `shaders/simulation/normal_fragment.glsl`: wake slope reconstruction.
- `shaders/simulation/foam_update_fragment.glsl`: foam, aeration, and flow solver.
- `shaders/simulation/probe_fragment.glsl`: batched GPU buoyancy sampling.
- `shaders/water/vertex.glsl`: ocean plus wake vertex displacement.
- `shaders/water/fragment.glsl`: water optics, foam, and fine detail.
- `shaders/caustics/vertex.glsl`: matching wind-oriented ocean displacement.
- `shaders/debug/fragment.glsl`: height, velocity, foam, flow, and source views.

## Validation Controls

- `Straight`: resets the field and accelerates from rest along a straight path.
- `Circle`: resets the field and produces a constant curved history.
- `S-turn`: resets the field and preserves both bends in world space.
- `Stopped`: stops source emission without clearing existing waves or foam.
- `Geometry`: moves sphere, cube, and ship in parallel at equal speed.
- `Fixed update`: compares 30, 60, and 120 Hz solver stepping.
- `Render cap`: runs the same fixed solver under 30, 60, or 120 FPS rendering
  (subject to the display refresh ceiling).
- `Low / Medium / Ultra`: changes target resolution and pass cadence.
- `Field view`: isolates height, velocity, foam/aeration, flow, or source impulses.

Expected checks:

1. A straight run grows bow and stern energy gradually as speed increases.
2. Circle and S-turn histories stay curved; old sections do not rotate with ship.
3. Stopped mode emits no new directional source while old fields keep evolving.
4. Geometry mode produces distinct rounded, square-edged, and ship wakes.
5. Fixed-step propagation and lifetime remain similar at different render rates.
6. Sources fade near the test-domain edge with no hard rectangular cutoff.

## Performance

The original six synchronous one-pixel buoyancy readbacks are now one 8 x 1 GPU
probe pass and one batched readback. Remaining costs are:

1. A synchronous batched readback can still stall the GPU.
2. Dense hull samples require CPU matrix transforms and ocean evaluations.
3. CPU source rasterization uploads complete source textures after updates.
4. The 16-band ocean is evaluated in several render stages.
5. Ultra reflections, caustics, and water shading are fill-rate heavy.

The next major optimization would rasterize hull sources with additive GPU draws
and consume delayed buoyancy samples asynchronously.

## Practical Limits

- This is a wind-oriented multi-band procedural ocean, not a true FFT spectrum.
- The heightfield cannot model overturning breakers, spray sheets, entrained 3D
  bubbles, hull slamming, or viscous boundary layers.
- Foam flow is a two-dimensional visual approximation of surface transport.
- The full-domain history is appropriate for this test tank. A harbor or open
  world needs cascaded clipmaps, a sparse atlas, or a near/far wake hierarchy.
- WebGL fallback may lose float filtering and GPU timing.
- A cinematic full-size container ship also needs a real-scale hull collision mesh,
  a much larger domain, atmospheric lighting, spray particles, and higher-quality
  environment capture.

Within those limits, the wake is no longer a ship-attached decal: it is actual
water displacement plus a persistent, advected GPU foam field.
