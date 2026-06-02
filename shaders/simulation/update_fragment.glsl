precision highp float;
precision highp int;

uniform sampler2D texture;
uniform vec2 delta;
uniform float rippleDistance;
uniform float wakeHeightRecovery;
uniform float maxWakeHeight;
uniform vec2 waterSize;
uniform float waterBounceCount;
uniform vec4 waterBounceRects[16];
uniform float waterHullMaskCount;
uniform vec4 waterHullMaskValues[8];
uniform vec4 waterHullMaskSizes[8];
uniform sampler2D objectPressureTexture;
varying vec2 coord;

const float MAX_WAKE_VELOCITY = 0.085;

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

  vec2 worldPoint = (point - 0.5) * waterSize;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= waterHullMaskCount) {
      break;
    }

    vec4 hull = waterHullMaskValues[i];
    vec4 size = waterHullMaskSizes[i];
    vec2 forward = normalize(hull.zw);
    vec2 sideAxis = vec2(-forward.y, forward.x);
    vec2 deltaPoint = worldPoint - hull.xy;
    float along = dot(deltaPoint, forward);
    float side = abs(dot(deltaPoint, sideAxis));
    float bow = max(size.x, 0.001);
    float stern = max(size.y, 0.001);
    float halfBeam = max(size.z, 0.001);
    float softness = max(size.w, 0.001);
    float t = clamp((along + stern) / (bow + stern), 0.0, 1.0);
    float sternRound = smoothstep(0.0, 0.12, t);
    float bowTaper = 1.0 - smoothstep(0.38, 1.0, t) * 0.985;
    float beamProfile = sternRound * bowTaper;
    float localHalfBeam = halfBeam * beamProfile;
    float alongMask = smoothstep(-stern - softness, -stern + softness, along) *
      (1.0 - smoothstep(bow - softness, bow + softness, along));
    float sideMask = 1.0 - smoothstep(localHalfBeam - softness, localHalfBeam + softness, side);

    blocked = max(blocked, alongMask * sideMask);
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
  info.g += clamp((average - info.r) * 2.0, -MAX_WAKE_VELOCITY, MAX_WAKE_VELOCITY);

  /* attenuate the velocity a little so waves do not last forever */
  info.g *= rippleDistance;

  /* move the vertex along the velocity */
  info.g = clamp(info.g, -MAX_WAKE_VELOCITY, MAX_WAKE_VELOCITY);
  info.r += info.g;

  vec4 objectPressure = texture2D(objectPressureTexture, coord);
  if (objectPressure.a > 0.000001) {
    float targetHeight = clamp(objectPressure.r, -maxWakeHeight, maxWakeHeight);
    float impulse = clamp(objectPressure.g, -MAX_WAKE_VELOCITY, MAX_WAKE_VELOCITY);
    float turbulence = objectPressure.b;
    float correction = clamp(targetHeight - info.r, -maxWakeHeight, maxWakeHeight);

    info.g += correction * objectPressure.a * 0.38;
    info.g += impulse * objectPressure.a * 1.04;
    info.r += correction * objectPressure.a * 0.065;
    info.g *= mix(1.0, 0.952, clamp(turbulence * objectPressure.a, 0.0, 1.0));
    info.g = clamp(info.g, -MAX_WAKE_VELOCITY, MAX_WAKE_VELOCITY);
  }

  info.r *= wakeHeightRecovery;
  info.r = clamp(info.r, -maxWakeHeight, maxWakeHeight);
  info.g = clamp(info.g, -MAX_WAKE_VELOCITY, MAX_WAKE_VELOCITY);

  gl_FragColor = info;
}
