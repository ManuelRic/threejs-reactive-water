const float IOR_AIR = 1.0;
const float IOR_WATER = 1.333;

const vec3 abovewaterColor = vec3(0.25, 1.0, 1.25);
const vec3 underwaterColor = vec3(0.4, 0.9, 1.0);

const float poolHeight = 1.0;
const float poolHalfSize = 2.5;

uniform vec3 light;
uniform sampler2D tiles;
uniform sampler2D causticTex;
uniform sampler2D water;

#ifdef USE_WAVE_CAUSTIC_WATER_LEVEL
uniform float time;
uniform float oceanWaveStrength;
uniform float oceanWaveFrequency;
uniform float oceanWaveSpeed;
uniform float oceanWaveSharpness;
uniform float fftWavesEnabled;
uniform float waveCausticsEnabled;
uniform float waterBounceCount;
uniform vec4 waterBounceRects[16];

struct CausticOceanWave {
  vec2 direction;
  float frequency;
  float speed;
  float amplitude;
  float steepness;
};

float causticStormAmount() {
  return smoothstep(0.08, 0.12, oceanWaveStrength);
}

float causticSharpenCrest(float crest, float storm) {
  float positiveCrest = max(crest, 0.0);
  float negativeCrest = max(-crest, 0.0);

  return crest +
    pow(positiveCrest, 3.0) * storm * 0.85 * oceanWaveSharpness -
    pow(negativeCrest, 2.0) * storm * 0.16 * oceanWaveSharpness;
}

float causticGerstnerHeight(vec2 point, CausticOceanWave wave) {
  vec2 direction = normalize(wave.direction);
  float phase = dot(point, direction) * wave.frequency * oceanWaveFrequency + time * wave.speed * oceanWaveSpeed;
  float crest = sin(phase);

  return causticSharpenCrest(crest, causticStormAmount()) * wave.amplitude;
}

float causticGerstnerOceanHeight(vec2 point) {
  float height = 0.0;

  height += causticGerstnerHeight(point, CausticOceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62));
  height += causticGerstnerHeight(point, CausticOceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48));
  height += causticGerstnerHeight(point, CausticOceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34));
  height += causticGerstnerHeight(point, CausticOceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22));
  height += causticGerstnerHeight(point, CausticOceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18));

  return height * oceanWaveStrength;
}

float causticSpectralWaveHeight(vec2 point, vec2 direction, float frequency, float speed, float amplitude, float phase) {
  vec2 waveDirection = normalize(direction);
  float angle = dot(point, waveDirection) * frequency * oceanWaveFrequency + time * speed * oceanWaveSpeed + phase;

  return sin(angle) * amplitude;
}

float causticSpectralOceanHeight(vec2 point) {
  float height = 0.0;

  height += causticSpectralWaveHeight(point, vec2(1.00, 0.18), 2.60, 0.56, 0.42, 0.30);
  height += causticSpectralWaveHeight(point, vec2(0.92, 0.38), 3.70, 0.72, 0.32, 2.10);
  height += causticSpectralWaveHeight(point, vec2(0.72, 0.70), 5.20, 0.96, 0.24, 4.50);
  height += causticSpectralWaveHeight(point, vec2(0.36, 0.94), 6.80, 1.15, 0.18, 1.40);
  height += causticSpectralWaveHeight(point, vec2(-0.10, 1.00), 8.60, 1.42, 0.14, 5.30);
  height += causticSpectralWaveHeight(point, vec2(-0.42, 0.91), 10.80, 1.68, 0.105, 0.80);
  height += causticSpectralWaveHeight(point, vec2(0.58, -0.82), 12.60, 1.94, 0.080, 3.70);
  height += causticSpectralWaveHeight(point, vec2(-0.74, 0.66), 15.20, 2.22, 0.060, 2.80);
  height += causticSpectralWaveHeight(point, vec2(0.98, -0.22), 18.50, 2.55, 0.045, 5.90);
  height += causticSpectralWaveHeight(point, vec2(-0.88, -0.48), 21.00, 2.88, 0.034, 1.90);
  height += causticSpectralWaveHeight(point, vec2(0.18, 0.98), 24.80, 3.25, 0.026, 4.10);
  height += causticSpectralWaveHeight(point, vec2(-0.26, 0.96), 29.50, 3.68, 0.020, 0.55);
  height += causticSpectralWaveHeight(point, vec2(0.64, 0.77), 34.00, 4.05, 0.016, 3.20);
  height += causticSpectralWaveHeight(point, vec2(-0.56, 0.83), 40.00, 4.52, 0.012, 5.05);
  height += causticSpectralWaveHeight(point, vec2(0.86, 0.50), 48.00, 5.10, 0.009, 2.45);
  height += causticSpectralWaveHeight(point, vec2(-0.98, 0.18), 56.00, 5.75, 0.007, 4.85);

  return height * oceanWaveStrength;
}

float causticOceanHeight(vec2 point) {
  return mix(causticGerstnerOceanHeight(point), causticSpectralOceanHeight(point), fftWavesEnabled);
}

float causticWaterBounceMask(vec2 point) {
  vec2 uv = point / (poolHalfSize * 2.0) + 0.5;
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
#endif

float getCausticWaterLevel(vec2 point) {
  float waterLevel = texture2D(water, point / (poolHalfSize * 2.0) + 0.5).r;

#ifdef USE_WAVE_CAUSTIC_WATER_LEVEL
  waterLevel += causticOceanHeight(point) * waveCausticsEnabled * (1.0 - causticWaterBounceMask(point));
#endif

  return waterLevel;
}

vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin - origin) / ray;
  vec3 tMax = (cubeMax - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}


vec3 getWallColor(vec3 point) {
  float scale = 0.5;

  vec3 wallColor;
  vec3 normal;
  if (abs(point.x) > poolHalfSize - 0.001) {
    wallColor = texture2D(tiles, vec2(point.y * 0.5 + 1.0, point.z / (poolHalfSize * 2.0) + 0.5)).rgb;
    normal = vec3(-point.x, 0.0, 0.0);
  } else if (abs(point.z) > poolHalfSize - 0.001) {
    wallColor = texture2D(tiles, vec2(point.y * 0.5 + 1.0, point.x / (poolHalfSize * 2.0) + 0.5)).rgb;
    normal = vec3(0.0, 0.0, -point.z);
  } else {
    wallColor = texture2D(tiles, point.xz / (poolHalfSize * 2.0) + 0.5).rgb;
    normal = vec3(0.0, 1.0, 0.0);
  }

  scale /= length(point); /* pool ambient occlusion */

  /* caustics */
  vec3 refractedLight = -refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
  float diffuse = max(0.0, dot(refractedLight, normal));
  float waterLevel = getCausticWaterLevel(point.xz);
  if (point.y < waterLevel) {
    vec4 caustic = texture2D(causticTex, 0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) / (poolHalfSize * 2.0) + 0.5);
    scale += diffuse * caustic.r * 2.0 * caustic.g;
  } else {
    /* shadow for the rim of the pool */
    vec2 t = intersectCube(point, refractedLight, vec3(-poolHalfSize, -poolHeight, -poolHalfSize), vec3(poolHalfSize, 2.0, poolHalfSize));
    diffuse *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (point.y + refractedLight.y * t.y - 2.0 / 12.0)));

    scale += diffuse * 0.5;
  }

  return wallColor * scale;
}
