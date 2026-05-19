uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D water;
uniform float time;
uniform float oceanWaveStrength;
uniform float wakeWaveStrength;

attribute vec3 position;

varying vec3 eye;
varying vec3 pos;

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

  return crest + pow(positiveCrest, 3.0) * storm * 0.85 - pow(negativeCrest, 2.0) * storm * 0.16;
}

vec3 gerstnerWave(vec2 point, OceanWave wave) {
  vec2 direction = normalize(wave.direction);
  float phase = dot(point, direction) * wave.frequency + time * wave.speed;
  float crest = sin(phase);
  float storm = stormAmount();
  float shapedCrest = sharpenCrest(crest, storm);
  float horizontal = cos(phase) * wave.steepness * wave.amplitude * (1.0 + storm * 0.55);

  return vec3(
    direction.x * horizontal,
    shapedCrest * wave.amplitude,
    direction.y * horizontal
  );
}

vec3 oceanDisplacement(vec2 point) {
  vec3 displacement = vec3(0.0);

  displacement += gerstnerWave(point, OceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62));
  displacement += gerstnerWave(point, OceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48));
  displacement += gerstnerWave(point, OceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34));
  displacement += gerstnerWave(point, OceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22));
  displacement += gerstnerWave(point, OceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18));

  return displacement * oceanWaveStrength;
}


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);
  pos = position.xzy;
  vec3 ocean = oceanDisplacement(pos.xz);
  pos.xz += ocean.xz;
  pos.y += ocean.y + info.r * wakeWaveStrength;

  vec3 axis_x = vec3(modelViewMatrix[0].x, modelViewMatrix[0].y, modelViewMatrix[0].z);
  vec3 axis_y = vec3(modelViewMatrix[1].x, modelViewMatrix[1].y, modelViewMatrix[1].z);
  vec3 axis_z = vec3(modelViewMatrix[2].x, modelViewMatrix[2].y, modelViewMatrix[2].z);
  vec3 offset = vec3(modelViewMatrix[3].x, modelViewMatrix[3].y, modelViewMatrix[3].z);

  eye = vec3(dot(-offset, axis_x), dot(-offset, axis_y), dot(-offset, axis_z));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
