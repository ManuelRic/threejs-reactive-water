precision highp float;
precision highp int;

uniform sampler2D texture;
uniform vec2 sampleUv[8];
uniform float sampleCount;

void main() {
  float index = floor(gl_FragCoord.x);
  vec2 uv = sampleUv[0];

  if (index > 0.5) uv = sampleUv[1];
  if (index > 1.5) uv = sampleUv[2];
  if (index > 2.5) uv = sampleUv[3];
  if (index > 3.5) uv = sampleUv[4];
  if (index > 4.5) uv = sampleUv[5];
  if (index > 5.5) uv = sampleUv[6];
  if (index > 6.5) uv = sampleUv[7];

  float active = 1.0 - step(sampleCount, index);
  float height = texture2D(texture, clamp(uv, 0.0, 1.0)).r * active;
  gl_FragColor = vec4(height, 0.0, 0.0, 1.0);
}
