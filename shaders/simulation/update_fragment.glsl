precision highp float;
precision highp int;

uniform sampler2D texture;
uniform vec2 delta;
uniform float rippleDistance;
uniform float wakeHeightRecovery;
uniform float maxWakeHeight;
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
    gl_FragColor = vec4(0.0);
    return;
  }

  /* calculate average neighbor height */
  vec2 dx = vec2(delta.x, 0.0);
  vec2 dy = vec2(0.0, delta.y);
  float average = (
    sampleHeight(coord - dx, info.r) +
    sampleHeight(coord - dy, info.r) +
    sampleHeight(coord + dx, info.r) +
    sampleHeight(coord + dy, info.r)
  ) * 0.25;

  /* change the velocity to move toward the average */
  info.g += (average - info.r) * 2.0;

  /* attenuate the velocity a little so waves do not last forever */
  info.g *= rippleDistance;

  /* move the vertex along the velocity */
  info.r += info.g;
  info.r *= wakeHeightRecovery;
  info.r = clamp(info.r, -maxWakeHeight, maxWakeHeight);

  gl_FragColor = info;
}
