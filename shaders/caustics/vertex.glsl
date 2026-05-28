precision highp float;
precision highp int;

varying vec3 oldPos;
varying vec3 newPos;
varying vec3 ray;
attribute vec3 position;
uniform float waterExtent;
uniform float time;
uniform float oceanWaveStrength;
uniform float oceanWaveFrequency;
uniform float oceanWaveSpeed;
uniform float oceanWaveSharpness;
uniform float fftWavesEnabled;
uniform float waveCausticsEnabled;
uniform float waterBounceCount;
uniform vec4 waterBounceRects[16];

#include <utils>

struct OceanWave {
  vec2 direction;
  float frequency;
  float speed;
  float amplitude;
  float steepness;
};

float stormAmount() {
  return smoothstep(0.08, 0.12, oceanWaveStrength);
}

float sharpenCrest(float crest, float storm) {
  float positiveCrest = max(crest, 0.0);
  float negativeCrest = max(-crest, 0.0);

  return crest +
    pow(positiveCrest, 3.0) * storm * 0.85 * oceanWaveSharpness -
    pow(negativeCrest, 2.0) * storm * 0.16 * oceanWaveSharpness;
}

float gerstnerHeight(vec2 point, OceanWave wave) {
  vec2 direction = normalize(wave.direction);
  float phase = dot(point, direction) * wave.frequency * oceanWaveFrequency + time * wave.speed * oceanWaveSpeed;
  float crest = sin(phase);

  return sharpenCrest(crest, stormAmount()) * wave.amplitude;
}

float gerstnerOceanHeight(vec2 point) {
  float height = 0.0;

  height += gerstnerHeight(point, OceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62));
  height += gerstnerHeight(point, OceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48));
  height += gerstnerHeight(point, OceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34));
  height += gerstnerHeight(point, OceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22));
  height += gerstnerHeight(point, OceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18));

  return height * oceanWaveStrength;
}

float spectralWaveHeight(vec2 point, vec2 direction, float frequency, float speed, float amplitude, float phase) {
  vec2 waveDirection = normalize(direction);
  float angle = dot(point, waveDirection) * frequency * oceanWaveFrequency + time * speed * oceanWaveSpeed + phase;

  return sin(angle) * amplitude;
}

float spectralOceanHeight(vec2 point) {
  float height = 0.0;

  height += spectralWaveHeight(point, vec2(1.00, 0.18), 2.60, 0.56, 0.42, 0.30);
  height += spectralWaveHeight(point, vec2(0.92, 0.38), 3.70, 0.72, 0.32, 2.10);
  height += spectralWaveHeight(point, vec2(0.72, 0.70), 5.20, 0.96, 0.24, 4.50);
  height += spectralWaveHeight(point, vec2(0.36, 0.94), 6.80, 1.15, 0.18, 1.40);
  height += spectralWaveHeight(point, vec2(-0.10, 1.00), 8.60, 1.42, 0.14, 5.30);
  height += spectralWaveHeight(point, vec2(-0.42, 0.91), 10.80, 1.68, 0.105, 0.80);
  height += spectralWaveHeight(point, vec2(0.58, -0.82), 12.60, 1.94, 0.080, 3.70);
  height += spectralWaveHeight(point, vec2(-0.74, 0.66), 15.20, 2.22, 0.060, 2.80);
  height += spectralWaveHeight(point, vec2(0.98, -0.22), 18.50, 2.55, 0.045, 5.90);
  height += spectralWaveHeight(point, vec2(-0.88, -0.48), 21.00, 2.88, 0.034, 1.90);
  height += spectralWaveHeight(point, vec2(0.18, 0.98), 24.80, 3.25, 0.026, 4.10);
  height += spectralWaveHeight(point, vec2(-0.26, 0.96), 29.50, 3.68, 0.020, 0.55);
  height += spectralWaveHeight(point, vec2(0.64, 0.77), 34.00, 4.05, 0.016, 3.20);
  height += spectralWaveHeight(point, vec2(-0.56, 0.83), 40.00, 4.52, 0.012, 5.05);
  height += spectralWaveHeight(point, vec2(0.86, 0.50), 48.00, 5.10, 0.009, 2.45);
  height += spectralWaveHeight(point, vec2(-0.98, 0.18), 56.00, 5.75, 0.007, 4.85);

  return height * oceanWaveStrength;
}

float oceanHeight(vec2 point) {
  return mix(gerstnerOceanHeight(point), spectralOceanHeight(point), fftWavesEnabled);
}

float isWaterBounce(vec2 point) {
  vec2 uv = point / (waterExtent * 2.0) + 0.5;
  float blocked = 0.0;

  for (int i = 0; i < 16; i++) {
    if (float(i) >= waterBounceCount) {
      break;
    }

    vec4 rect = waterBounceRects[i];
    float inside =
      step(rect.x, uv.x) *
      step(uv.x, rect.z) *
      step(rect.y, uv.y) *
      step(uv.y, rect.w);

    blocked = max(blocked, inside);
  }

  return blocked;
}

vec3 oceanNormal(vec2 point) {
  float offset = 0.012;
  float left = oceanHeight(point - vec2(offset, 0.0));
  float right = oceanHeight(point + vec2(offset, 0.0));
  float back = oceanHeight(point - vec2(0.0, offset));
  float front = oceanHeight(point + vec2(0.0, offset));

  return normalize(vec3(
    left - right,
    offset * 2.0,
    back - front
  ));
}


/* project the ray onto the plane */
vec3 project(vec3 origin, vec3 ray, vec3 refractedLight) {
  vec2 tcube = intersectCube(origin, ray, vec3(-poolHalfSize, -poolHeight, -poolHalfSize), vec3(poolHalfSize, 2.0, poolHalfSize));
  origin += ray * tcube.y;
  float tplane = (-origin.y - 1.0) / refractedLight.y;

  return origin + refractedLight * tplane;
}


void main() {
  vec2 waterPoint = position.xy;
  vec4 info = texture2D(water, waterPoint / (waterExtent * 2.0) + 0.5);
  float waveCausticMask = waveCausticsEnabled * (1.0 - isWaterBounce(waterPoint));
  vec2 wakeSlope = info.ba * 0.5;
  vec3 wakeNormal = vec3(wakeSlope.x, sqrt(max(0.0, 1.0 - dot(wakeSlope, wakeSlope))), wakeSlope.y);
  vec3 waveNormal = mix(vec3(0.0, 1.0, 0.0), oceanNormal(waterPoint), waveCausticMask);
  vec3 normal = normalize(waveNormal + wakeNormal - vec3(0.0, 1.0, 0.0));
  float height = oceanHeight(waterPoint) * waveCausticMask + info.r;

  /* project the vertices along the refracted vertex ray */
  vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
  ray = refract(-light, normal, IOR_AIR / IOR_WATER);
  oldPos = project(position.xzy, refractedLight, refractedLight);
  newPos = project(position.xzy + vec3(0.0, height, 0.0), ray, refractedLight);

  gl_Position = vec4(0.75 * (newPos.xz + refractedLight.xz / refractedLight.y) / poolHalfSize, 0.0, 1.0);
}
