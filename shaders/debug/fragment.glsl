precision highp float;
precision highp int;

uniform sampler2D texture;
uniform int mode;
varying vec2 coord;

void main() {
  vec4 color = texture2D(texture, coord);

  if (mode == 1) {
    float positive = smoothstep(0.0, 0.10, color.r);
    float negative = smoothstep(0.0, 0.10, -color.r);
    gl_FragColor = vec4(vec3(0.035) + vec3(0.95, 0.22, 0.08) * positive + vec3(0.04, 0.42, 1.0) * negative, 1.0);
    return;
  }

  if (mode == 2) {
    float positive = smoothstep(0.0, 0.065, color.g);
    float negative = smoothstep(0.0, 0.065, -color.g);
    gl_FragColor = vec4(vec3(0.025) + vec3(1.0, 0.48, 0.04) * positive + vec3(0.0, 0.78, 0.88) * negative, 1.0);
    return;
  }

  if (mode == 3) {
    gl_FragColor = vec4(
      vec3(0.01, 0.035, 0.055) +
      vec3(0.86, 0.94, 1.0) * color.r +
      vec3(0.02, 0.46, 0.52) * color.g,
      1.0
    );
    return;
  }

  if (mode == 4) {
    vec2 flow = color.ba;
    float speed = smoothstep(0.0, 0.22, length(flow));
    vec2 direction = normalize(flow + vec2(0.000001));
    gl_FragColor = vec4(
      mix(vec3(0.02), vec3(direction * 0.5 + 0.5, 0.72), speed),
      1.0
    );
    return;
  }

  if (mode == 5) {
    vec2 direction = color.gb * 2.0 - 1.0;
    vec3 sourceColor = vec3(direction * 0.5 + 0.5, color.a);
    gl_FragColor = vec4(mix(vec3(0.015), sourceColor, color.r), 1.0);
    return;
  }

  gl_FragColor = vec4(color.rgb, 1.0);
}
