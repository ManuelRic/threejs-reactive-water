precision highp float;
precision highp int;

const float PI = 3.141592653589793;
uniform sampler2D texture;
uniform vec2 center;
uniform float radius;
uniform float strength;
uniform vec2 waterSize;
varying vec2 coord;


void main() {
  /* Get vertex info */
  vec4 info = texture2D(texture, coord);

  /* Add the drop to the height */
  vec2 worldDelta = (center * 0.5 + 0.5 - coord) * waterSize;
  float drop = max(0.0, 1.0 - length(worldDelta) / radius);
  drop = 0.5 - cos(drop * PI) * 0.5;
  info.r += drop * strength;

  gl_FragColor = info;
}
