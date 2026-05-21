uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D water;
uniform mat4 reflectionTextureMatrix;
uniform float time;
uniform float oceanWaveStrength;
uniform float oceanWaveFrequency;
uniform float oceanWaveSpeed;
uniform float oceanWaveSharpness;
uniform float fftWavesEnabled;
uniform float wakeWaveStrength;
uniform float waterTextureEnabled;
uniform float waterExtent;

attribute vec3 position;

varying vec3 eye;
varying vec3 pos;
varying vec4 reflectionCoord;
varying vec2 waterUv;

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

vec3 gerstnerWave(vec2 point, OceanWave wave) {
  vec2 direction = normalize(wave.direction);
  float phase = dot(point, direction) * wave.frequency * oceanWaveFrequency + time * wave.speed * oceanWaveSpeed;
  float crest = sin(phase);
  float storm = stormAmount();
  float shapedCrest = sharpenCrest(crest, storm);
  float horizontal = cos(phase) * wave.steepness * wave.amplitude * oceanWaveSharpness * (1.0 + storm * 0.55);

  return vec3(
    direction.x * horizontal,
    shapedCrest * wave.amplitude,
    direction.y * horizontal
  );
}

vec3 gerstnerOceanDisplacement(vec2 point) {
  vec3 displacement = vec3(0.0);

  displacement += gerstnerWave(point, OceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62));
  displacement += gerstnerWave(point, OceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48));
  displacement += gerstnerWave(point, OceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34));
  displacement += gerstnerWave(point, OceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22));
  displacement += gerstnerWave(point, OceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18));

  return displacement * oceanWaveStrength;
}

vec3 spectralWave(vec2 point, vec2 direction, float frequency, float speed, float amplitude, float phase) {
  vec2 waveDirection = normalize(direction);
  float angle = dot(point, waveDirection) * frequency * oceanWaveFrequency + time * speed * oceanWaveSpeed + phase;
  float crest = sin(angle);
  float slope = cos(angle);
  float chop = amplitude * oceanWaveSharpness * 0.18;

  return vec3(
    waveDirection.x * slope * chop,
    crest * amplitude,
    waveDirection.y * slope * chop
  );
}

vec3 spectralOceanDisplacement(vec2 point) {
  vec3 displacement = vec3(0.0);

  displacement += spectralWave(point, vec2(1.00, 0.18), 2.60, 0.56, 0.42, 0.30);
  displacement += spectralWave(point, vec2(0.92, 0.38), 3.70, 0.72, 0.32, 2.10);
  displacement += spectralWave(point, vec2(0.72, 0.70), 5.20, 0.96, 0.24, 4.50);
  displacement += spectralWave(point, vec2(0.36, 0.94), 6.80, 1.15, 0.18, 1.40);
  displacement += spectralWave(point, vec2(-0.10, 1.00), 8.60, 1.42, 0.14, 5.30);
  displacement += spectralWave(point, vec2(-0.42, 0.91), 10.80, 1.68, 0.105, 0.80);
  displacement += spectralWave(point, vec2(0.58, -0.82), 12.60, 1.94, 0.080, 3.70);
  displacement += spectralWave(point, vec2(-0.74, 0.66), 15.20, 2.22, 0.060, 2.80);
  displacement += spectralWave(point, vec2(0.98, -0.22), 18.50, 2.55, 0.045, 5.90);
  displacement += spectralWave(point, vec2(-0.88, -0.48), 21.00, 2.88, 0.034, 1.90);
  displacement += spectralWave(point, vec2(0.18, 0.98), 24.80, 3.25, 0.026, 4.10);
  displacement += spectralWave(point, vec2(-0.26, 0.96), 29.50, 3.68, 0.020, 0.55);
  displacement += spectralWave(point, vec2(0.64, 0.77), 34.00, 4.05, 0.016, 3.20);
  displacement += spectralWave(point, vec2(-0.56, 0.83), 40.00, 4.52, 0.012, 5.05);
  displacement += spectralWave(point, vec2(0.86, 0.50), 48.00, 5.10, 0.009, 2.45);
  displacement += spectralWave(point, vec2(-0.98, 0.18), 56.00, 5.75, 0.007, 4.85);

  return displacement * oceanWaveStrength;
}

vec3 oceanDisplacement(vec2 point) {
  return mix(gerstnerOceanDisplacement(point), spectralOceanDisplacement(point), fftWavesEnabled);
}


void main() {
  waterUv = position.xy / (waterExtent * 2.0) + 0.5;
  vec4 info = texture2D(water, waterUv);
  pos = position.xzy;
  vec3 ocean = oceanDisplacement(pos.xz);
  pos.xz += ocean.xz;
  pos.y += ocean.y + info.r * wakeWaveStrength * waterTextureEnabled;
  reflectionCoord = reflectionTextureMatrix * vec4(pos, 1.0);

  vec3 axis_x = vec3(modelViewMatrix[0].x, modelViewMatrix[0].y, modelViewMatrix[0].z);
  vec3 axis_y = vec3(modelViewMatrix[1].x, modelViewMatrix[1].y, modelViewMatrix[1].z);
  vec3 axis_z = vec3(modelViewMatrix[2].x, modelViewMatrix[2].y, modelViewMatrix[2].z);
  vec3 offset = vec3(modelViewMatrix[3].x, modelViewMatrix[3].y, modelViewMatrix[3].z);

  eye = vec3(dot(-offset, axis_x), dot(-offset, axis_y), dot(-offset, axis_z));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
