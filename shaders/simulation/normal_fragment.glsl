precision highp float;
precision highp int;

uniform sampler2D texture;
uniform vec2 delta;
uniform vec2 waterTexelSize;
uniform vec2 waterSize;
uniform float waterBounceCount;
uniform vec4 waterBounceRects[16];
uniform float waterHullMaskCount;
uniform vec4 waterHullMaskValues[8];
uniform vec4 waterHullMaskSizes[8];
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
    info.ba = vec2(0.0);
    gl_FragColor = info;
    return;
  }

  /* update the normal */
  float left = sampleHeight(vec2(coord.x - delta.x, coord.y), info.r);
  float right = sampleHeight(vec2(coord.x + delta.x, coord.y), info.r);
  float back = sampleHeight(vec2(coord.x, coord.y - delta.y), info.r);
  float front = sampleHeight(vec2(coord.x, coord.y + delta.y), info.r);
  float backLeft = sampleHeight(coord - delta, info.r);
  float frontRight = sampleHeight(coord + delta, info.r);
  float frontLeft = sampleHeight(coord + vec2(-delta.x, delta.y), info.r);
  float backRight = sampleHeight(coord + vec2(delta.x, -delta.y), info.r);
  vec2 slope = vec2(
    (left - right) * 0.72 + (backLeft + frontLeft - backRight - frontRight) * 0.14,
    (back - front) * 0.72 + (backLeft + backRight - frontLeft - frontRight) * 0.14
  );

  info.ba = normalize(vec3(slope.x, max(waterTexelSize.x, waterTexelSize.y) * 2.0, slope.y)).xz;

  gl_FragColor = info;
}
