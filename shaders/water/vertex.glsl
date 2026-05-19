uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D water;
uniform float time;
uniform float oceanWaveStrength;
uniform float wakeWaveStrength;

attribute vec3 position;

varying vec3 eye;
varying vec3 pos;

float wave(vec2 point, vec2 direction, float frequency, float speed, float amplitude) {
  return sin(dot(point, normalize(direction)) * frequency + time * speed) * amplitude;
}

float oceanHeight(vec2 point) {
  float height = 0.0;
  height += wave(point, vec2(1.0, 0.35), 7.0, 1.3, 0.52);
  height += wave(point, vec2(-0.65, 1.0), 11.0, 1.9, 0.24);
  height += wave(point, vec2(0.2, 1.0), 17.0, 2.7, 0.12);
  height += wave(point, vec2(-1.0, 0.1), 23.0, 3.4, 0.06);
  return height * oceanWaveStrength;
}


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);
  pos = position.xzy;
  pos.y += oceanHeight(pos.xz) + info.r * wakeWaveStrength;

  vec3 axis_x = vec3(modelViewMatrix[0].x, modelViewMatrix[0].y, modelViewMatrix[0].z);
  vec3 axis_y = vec3(modelViewMatrix[1].x, modelViewMatrix[1].y, modelViewMatrix[1].z);
  vec3 axis_z = vec3(modelViewMatrix[2].x, modelViewMatrix[2].y, modelViewMatrix[2].z);
  vec3 offset = vec3(modelViewMatrix[3].x, modelViewMatrix[3].y, modelViewMatrix[3].z);

  eye = vec3(dot(-offset, axis_x), dot(-offset, axis_y), dot(-offset, axis_z));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
