precision highp float;
precision highp int;

uniform sampler2D texture;
uniform vec2 delta;
uniform float waterBounceCount;
uniform vec4 waterBounceRects[16];
varying vec2 coord;

float isWaterBounce(vec2 point) {
  float blocked = 0.0;

  for (int i = 0; i < 16; i++) {
    if (float(i) >= waterBounceCount) {
      break;
    }

    vec4 rect = waterBounceRects[i];
    float inside =
      step(rect.x, point.x) *
      step(point.x, rect.z) *
      step(rect.y, point.y) *
      step(point.y, rect.w);

    blocked = max(blocked, inside);
  }

  return blocked;
}

float sampleHeight(vec2 point, float fallbackHeight) {
  if (isWaterBounce(point) > 0.5) {
    return fallbackHeight;
  }

  return texture2D(texture, point).r;
}

void main() {
  /* get vertex info */
  vec4 info = texture2D(texture, coord);

  if (isWaterBounce(coord) > 0.5) {
    info.ba = vec2(0.0);
    gl_FragColor = info;
    return;
  }

  /* update the normal */
  vec3 dx = vec3(delta.x, sampleHeight(vec2(coord.x + delta.x, coord.y), info.r) - info.r, 0.0);
  vec3 dy = vec3(0.0, sampleHeight(vec2(coord.x, coord.y + delta.y), info.r) - info.r, delta.y);
  info.ba = normalize(cross(dy, dx)).xz;

  gl_FragColor = info;
}
