precision highp float;
precision highp int;

uniform sampler2D texture;
uniform vec2 delta;
uniform float rippleDistance;
uniform float wakeHeightRecovery;
uniform float maxWakeHeight;
uniform float waterBounceCount;
uniform vec4 waterBounceRects[16];
uniform sampler2D objectPressureTexture;
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

  vec4 objectPressure = texture2D(objectPressureTexture, coord);
  if (objectPressure.a > 0.000001) {
    float targetHeight = objectPressure.r;
    float impulse = objectPressure.g;
    float turbulence = objectPressure.b;
    float correction = targetHeight - info.r;

    info.g += correction * objectPressure.a * 0.28;
    info.g += impulse * objectPressure.a * 0.78;
    info.r += correction * objectPressure.a * 0.045;
    info.g *= mix(1.0, 0.965, clamp(turbulence * objectPressure.a, 0.0, 1.0));
  }

  info.r *= wakeHeightRecovery;
  info.r = clamp(info.r, -maxWakeHeight, maxWakeHeight);

  gl_FragColor = info;
}
