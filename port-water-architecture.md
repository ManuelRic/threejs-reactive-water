# Port Water Architecture

This prototype is moving from a pool-style water demo toward a scalable harbor water system.

## Core Rule

Water render geometry is only a view of the water field. Waves, wakes, foam, masks, and depth must be sampled in world space:

```glsl
vec2 uv = worldPosition.xz / waterWorldSize + 0.5;
```

That keeps tiled water, camera-centered grids, and local high-detail patches visually continuous.

## Current Stage

Stage 1 is partially prepared in the prototype:

- The water shader samples displacement, foam, hull masks, and visual wakes in world space.
- Caustics keep a separate lower-cost mesh and are no longer tied to the water render mesh density.
- The visible water is currently a single continuous, full-grid render mesh because FFT waves are vertex-displaced and need vertices across the whole surface.

The current prototype intentionally avoids tiled/sparse far-water LOD because the FFT waves are vertex-displaced. Tiled or far LOD should only be reintroduced together with a normal-map or texture-only far-water path, or with seam-safe projected-grid rendering.

## Target Modules

- `WaterSystem`: owns the full update/render pipeline.
- `FFTWaveField`: global height/slope/normal textures sampled in world space.
- `WaterTileManager`: tiled, camera-centered, or projected-grid render geometry.
- `WaterInteractionManager`: tracks proxies, priority, sleeping, and update tiers.
- `WaterProxy`: box, sphere, capsule, hull, custom footprint, or rasterized mesh.
- `VesselProxy`: vessel dimensions, heading, draft, velocity, throttle, and wake profile.
- `WakeSystem`: pressure, Kelvin wakes, stern wash, prop wash, wake history, and decals.
- `FoamSystem`: crest, hull contact, prop wash, wake, shoreline, and obstacle foam.
- `ReflectionSystem`: adaptive planar/SSR/environment reflections.
- `CausticsSystem`: optional, local, shallow/near-camera only.
- `ArbitraryObjectInteractionSystem`: top-down masks or precomputed waterline footprints for unknown GLBs.

## Next Stages

1. Add GPU disturbance render targets for pressure, velocity, foam, and wake history.
2. Replace CPU `DataTexture` wake uploads with additive emitter rendering.
3. Introduce `WaterProxy` and `VesselProxy` registration APIs.
4. Move the cargo ship to a `containerShip` wake profile.
5. Add quality tiers, sleeping, and update budgets for many objects.
6. Add depth, obstacle, shoreline, and dock masks for port realism.
