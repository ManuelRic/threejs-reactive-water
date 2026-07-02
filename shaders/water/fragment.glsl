precision highp float;
precision highp int;

#include <utils>

uniform float underwater;
uniform samplerCube sky;
uniform sampler2D waterImageTexture;
uniform sampler2D reflectionTexture;
uniform float time;
uniform float oceanWaveStrength;
uniform float oceanWaveFrequency;
uniform float oceanWaveSpeed;
uniform float oceanWaveSharpness;
uniform float fftWavesEnabled;
uniform float wakeWaveStrength;
uniform float waterTextureEnabled;
uniform float waterImageTextureEnabled;
uniform vec2 waterSize;
uniform float waterTexel;
uniform float waterBounceCount;
uniform vec4 waterBounceRects[16];
uniform float waterHullMaskCount;
uniform vec4 waterHullMaskValues[8];
uniform vec4 waterHullMaskSizes[8];
uniform float waterOpacity;
uniform float waterTextureOpacity;
uniform float waterTextureFrequency;
uniform float foamHeightThreshold;
uniform float foamHeightSoftness;
uniform float foamFromHeightStrength;
uniform float objectFoamEnabled;
uniform float waveFoamEnabled;
uniform float extraFoamEnabled;
uniform float foamMottleEnabled;
uniform float waterMottleEnabled;
uniform float extraFoamRippleBoost;
uniform float reflectionStrength;

varying vec3 eye;
varying vec3 pos;
varying vec4 reflectionCoord;
varying vec2 waterUv;
varying vec2 waterWaveUv;
varying float visualWakeFoamAmount;

float waterBounceMask(vec2 uv) {
  float blocked = 0.0;

  for (int i = 0; i < 16; i++) {
    if (float(i) >= waterBounceCount) {
      break;
    }

    vec4 rect = waterBounceRects[i];
    float inside =
      step(rect.x, uv.x) *
      step(uv.x, rect.z) *
      step(rect.y, uv.y) *
      step(uv.y, rect.w);

    blocked = max(blocked, inside);
  }

  vec2 worldPoint = (uv - 0.5) * waterSize;
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

vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  vec3 color;

  if (ray.y < 0.0) {
    vec2 t = intersectCube(origin, ray, getPoolMinBounds(), getPoolMaxBounds());
    color = getWallColor(origin + ray * t.y);
  } else {
    vec2 t = intersectCube(origin, ray, getPoolMinBounds(), getPoolMaxBounds());
    vec3 hit = origin + ray * t.y;
    if (hit.y < 7.0 / 12.0) {
      color = getWallColor(hit);
    } else {
      color = textureCube(sky, ray).rgb;
      color += 0.01 * vec3(pow(max(0.0, dot(light, ray)), 20.0)) * vec3(10.0, 8.0, 6.0);
    }
  }

  if (ray.y < 0.0) color *= waterColor;

  return color;
}

float random(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 curve = local * local * (3.0 - 2.0 * local);

  float bottomLeft = random(cell);
  float bottomRight = random(cell + vec2(1.0, 0.0));
  float topLeft = random(cell + vec2(0.0, 1.0));
  float topRight = random(cell + vec2(1.0, 1.0));

  return mix(
    mix(bottomLeft, bottomRight, curve.x),
    mix(topLeft, topRight, curve.x),
    curve.y
  );
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(0.80, -0.60, 0.60, 0.80);

  for (int i = 0; i < 4; i++) {
    value += noise(point) * amplitude;
    point = rotate * point * 2.02 + vec2(17.31);
    amplitude *= 0.5;
  }

  return value;
}

float foamTexture(vec2 coord, vec2 direction) {
  vec2 stretchedCoord = coord + direction * 0.055;
  float broad = fbm(stretchedCoord * vec2(38.0, 12.0));
  float fine = noise(stretchedCoord * vec2(190.0, 48.0));
  float streaks = noise(stretchedCoord * vec2(18.0, 230.0));
  float specks = noise(stretchedCoord * 340.0);

  float lanes = smoothstep(0.54, 0.76, broad + fine * 0.32 + streaks * 0.28);
  float holes = smoothstep(0.20, 0.58, fbm(stretchedCoord * vec2(14.0, 6.0) + vec2(9.4)));
  float flecks = smoothstep(0.86, 0.965, specks);

  return clamp(lanes * holes * 1.05 + flecks * 0.24, 0.0, 1.0);
}

vec4 getPlanarReflection(vec4 projectedCoord, vec2 distortion) {
  vec3 projected = projectedCoord.xyz / projectedCoord.w;
  vec2 uv = projected.xy + distortion;
  float visible = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec4 reflectedScene = texture2D(reflectionTexture, clamp(uv, 0.001, 0.999));

  reflectedScene.a *= visible;
  return reflectedScene;
}

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

  return crest +
    pow(positiveCrest, 3.0) * storm * 0.85 * oceanWaveSharpness -
    pow(negativeCrest, 2.0) * storm * 0.16 * oceanWaveSharpness;
}

float gerstnerHeight(vec2 point, OceanWave wave) {
  vec2 direction = normalize(wave.direction);
  float phase = dot(point, direction) * wave.frequency * oceanWaveFrequency + time * wave.speed * oceanWaveSpeed;
  float crest = sin(phase);

  return sharpenCrest(crest, stormAmount()) * wave.amplitude;
}

float gerstnerOceanHeight(vec2 point) {
  float height = 0.0;

  height += gerstnerHeight(point, OceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62));
  height += gerstnerHeight(point, OceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48));
  height += gerstnerHeight(point, OceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34));
  height += gerstnerHeight(point, OceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22));
  height += gerstnerHeight(point, OceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18));

  return height * oceanWaveStrength;
}

float spectralWaveHeight(vec2 point, vec2 direction, float frequency, float speed, float amplitude, float phase) {
  vec2 waveDirection = normalize(direction);
  float angle = dot(point, waveDirection) * frequency * oceanWaveFrequency + time * speed * oceanWaveSpeed + phase;

  return sin(angle) * amplitude;
}

float spectralOceanHeight(vec2 point) {
  float height = 0.0;

  height += spectralWaveHeight(point, vec2(1.00, 0.18), 2.60, 0.56, 0.42, 0.30);
  height += spectralWaveHeight(point, vec2(0.92, 0.38), 3.70, 0.72, 0.32, 2.10);
  height += spectralWaveHeight(point, vec2(0.72, 0.70), 5.20, 0.96, 0.24, 4.50);
  height += spectralWaveHeight(point, vec2(0.36, 0.94), 6.80, 1.15, 0.18, 1.40);
  height += spectralWaveHeight(point, vec2(-0.10, 1.00), 8.60, 1.42, 0.14, 5.30);
  height += spectralWaveHeight(point, vec2(-0.42, 0.91), 10.80, 1.68, 0.105, 0.80);
  height += spectralWaveHeight(point, vec2(0.58, -0.82), 12.60, 1.94, 0.080, 3.70);
  height += spectralWaveHeight(point, vec2(-0.74, 0.66), 15.20, 2.22, 0.060, 2.80);
  height += spectralWaveHeight(point, vec2(0.98, -0.22), 18.50, 2.55, 0.045, 5.90);
  height += spectralWaveHeight(point, vec2(-0.88, -0.48), 21.00, 2.88, 0.034, 1.90);
  height += spectralWaveHeight(point, vec2(0.18, 0.98), 24.80, 3.25, 0.026, 4.10);
  height += spectralWaveHeight(point, vec2(-0.26, 0.96), 29.50, 3.68, 0.020, 0.55);
  height += spectralWaveHeight(point, vec2(0.64, 0.77), 34.00, 4.05, 0.016, 3.20);
  height += spectralWaveHeight(point, vec2(-0.56, 0.83), 40.00, 4.52, 0.012, 5.05);
  height += spectralWaveHeight(point, vec2(0.86, 0.50), 48.00, 5.10, 0.009, 2.45);
  height += spectralWaveHeight(point, vec2(-0.98, 0.18), 56.00, 5.75, 0.007, 4.85);

  return height * oceanWaveStrength;
}

float oceanHeight(vec2 point) {
  if (fftWavesEnabled > 0.5) {
    return spectralOceanHeight(point);
  }

  return gerstnerOceanHeight(point);
}

float oceanForwardFoam(vec2 point) {
  float waveScale = max(0.001, oceanWaveStrength);
  float offset = 0.018;
  float center = oceanHeight(point);
  float left = oceanHeight(point - vec2(offset, 0.0));
  float right = oceanHeight(point + vec2(offset, 0.0));
  float back = oceanHeight(point - vec2(0.0, offset));
  float front = oceanHeight(point + vec2(0.0, offset));
  vec2 gradient = vec2(right - left, front - back);
  float slope = length(gradient);
  float curvature = left + right + back + front - center * 4.0;
  vec2 dominantDirection = normalize(
    vec2(1.0, 0.24) * 0.55 +
    vec2(0.82, 0.55) * 0.32 +
    vec2(-0.35, 1.0) * 0.18
  );
  vec2 side = vec2(-dominantDirection.y, dominantDirection.x);
  float forwardFace = smoothstep(waveScale * 0.012, waveScale * 0.11, dot(gradient, dominantDirection));
  float highCrest = smoothstep(waveScale * 0.34, waveScale * 0.92, center);
  float unusualCrest = smoothstep(waveScale * 0.55, waveScale * 1.25, center + slope * 2.2);
  float breakingCurve = smoothstep(waveScale * 0.01, waveScale * 0.09, -curvature);
  float breakingSlope = smoothstep(waveScale * 0.018, waveScale * 0.14, slope);
  float along = dot(point, dominantDirection);
  float across = dot(point, side);
  float broadPatch = noise(vec2(along * 2.6 - time * 0.035 * oceanWaveSpeed, across * 6.5));
  float streakPatch = noise(vec2(along * 7.0 - time * 0.09 * oceanWaveSpeed, across * 18.0));
  float patchMask = smoothstep(0.48, 0.78, broadPatch) * mix(0.35, 1.0, smoothstep(0.28, 0.82, streakPatch));

  return clamp(highCrest * unusualCrest * forwardFace * max(breakingCurve, breakingSlope * 0.65) * patchMask * 1.45, 0.0, 1.0);
}

vec3 oceanNormal(vec2 point) {
  float offset = 0.012;
  float left = oceanHeight(point - vec2(offset, 0.0));
  float right = oceanHeight(point + vec2(offset, 0.0));
  float back = oceanHeight(point - vec2(0.0, offset));
  float front = oceanHeight(point + vec2(0.0, offset));

  return normalize(vec3(
    left - right,
    offset * 2.0,
    back - front
  ));
}

vec3 capillaryNormal(vec2 point, float wakeAmount, float surfaceSlope) {
  vec2 slow = point * 42.0 + vec2(time * 0.42, -time * 0.18) * oceanWaveSpeed;
  vec2 fast = point * 118.0 + vec2(-time * 0.88, time * 0.61) * oceanWaveSpeed;
  vec2 crossed = point * 176.0 + vec2(time * 1.34, time * 0.27) * oceanWaveSpeed;
  vec2 ripple = vec2(
    fbm(slow) - 0.5,
    fbm(fast) - 0.5
  );

  ripple += vec2(
    noise(crossed) - 0.5,
    noise(crossed.yx + vec2(4.7)) - 0.5
  ) * 0.44;

  float strength = (0.020 + oceanWaveStrength * 0.55 + surfaceSlope * 0.72) * waterTextureEnabled;
  strength += wakeAmount * 0.18;

  return vec3(ripple.x * strength, 0.0, ripple.y * strength);
}

vec2 waterTextureFlow(vec2 point) {
  float strength = oceanWaveStrength * oceanWaveSharpness;
  vec2 flow = vec2(0.0);

  flow += normalize(vec2(1.0, 0.24)) * cos(dot(point, normalize(vec2(1.0, 0.24))) * 4.2 * oceanWaveFrequency + time * 0.85 * oceanWaveSpeed) * 0.018;
  flow += normalize(vec2(0.82, 0.55)) * cos(dot(point, normalize(vec2(0.82, 0.55))) * 6.8 * oceanWaveFrequency + time * 1.22 * oceanWaveSpeed) * 0.012;
  flow += normalize(vec2(-0.35, 1.0)) * cos(dot(point, normalize(vec2(-0.35, 1.0))) * 10.5 * oceanWaveFrequency + time * 1.85 * oceanWaveSpeed) * 0.007;

  return flow * strength;
}

vec2 waterTextureScroll(float textureScale) {
  float frequencyScale = max(0.001, oceanWaveFrequency);
  vec2 scroll = vec2(0.0);

  scroll += normalize(vec2(1.0, 0.24)) * (time * 0.85 * oceanWaveSpeed / (4.2 * frequencyScale)) * 0.55;
  scroll += normalize(vec2(0.82, 0.55)) * (time * 1.22 * oceanWaveSpeed / (6.8 * frequencyScale)) * 0.32;
  scroll += normalize(vec2(-0.35, 1.0)) * (time * 1.85 * oceanWaveSpeed / (10.5 * frequencyScale)) * 0.18;
  scroll += normalize(vec2(0.2, 1.0)) * (time * 2.65 * oceanWaveSpeed / (17.0 * frequencyScale)) * 0.08;
  scroll += normalize(vec2(-1.0, 0.15)) * (time * 3.4 * oceanWaveSpeed / (24.0 * frequencyScale)) * 0.045;

  return scroll * textureScale * 0.5 * oceanWaveStrength;
}

vec2 waveLockedTextureCoord(float textureScale, vec2 wakeSlope, float surfaceSlope) {
  vec2 waveCoord = waterWaveUv * textureScale;
  vec2 waveAdvection = waterTextureScroll(textureScale) + waterTextureFlow(pos.xz) * textureScale;
  vec2 wakeAdvection = wakeSlope * 0.34 * waterTextureEnabled;
  vec2 slopeAdvection = vec2(surfaceSlope, -surfaceSlope) * 0.035 * oceanWaveSharpness;

  return waveCoord + waveAdvection + wakeAdvection + slopeAdvection;
}


void main() {
  vec2 coord = waterUv;
  vec2 stableWaterPoint = (waterUv - 0.5) * waterSize;
  if (waterBounceMask(waterUv) > 0.5) {
    discard;
  }

  vec2 foamCoord = coord;
  vec4 info = texture2D(water, coord);
  vec4 heightInfo = info;

  /* make water look more "peaked" */
  for (int i = 0; i < 5; i++) {
    coord += info.ba * 0.005 * waterTextureEnabled;
    info = texture2D(water, coord);
  }

  float wakeTextureStrength = wakeWaveStrength * waterTextureEnabled;
  float wakeHeight = heightInfo.r * wakeTextureStrength;
  float excessHeight = max(0.0, wakeHeight);
  float crestFoam = smoothstep(
    foamHeightThreshold,
    foamHeightThreshold + foamHeightSoftness,
    excessHeight
  );

  float texel = waterTexel;
  float leftHeight = texture2D(water, foamCoord - vec2(texel, 0.0)).r * wakeTextureStrength;
  float rightHeight = texture2D(water, foamCoord + vec2(texel, 0.0)).r * wakeTextureStrength;
  float backHeight = texture2D(water, foamCoord - vec2(0.0, texel)).r * wakeTextureStrength;
  float frontHeight = texture2D(water, foamCoord + vec2(0.0, texel)).r * wakeTextureStrength;
  float heightSlope = length(vec2(rightHeight - leftHeight, frontHeight - backHeight));
  float wakeVelocity = heightInfo.g * wakeTextureStrength;
  float forwardBreak = smoothstep(0.00018, 0.0045, -wakeVelocity);
  float reverseBreak = smoothstep(0.00018, 0.0045, wakeVelocity) * 0.55;
  float leadingFace = max(forwardBreak, reverseBreak);
  float crestBias = smoothstep(-0.009, 0.009, wakeHeight);
  float slopeBreak = smoothstep(0.0012, 0.0078, heightSlope);
  float directionalBreak = clamp(max(leadingFace * crestBias, slopeBreak * leadingFace * 0.9), 0.0, 1.0);
  float rippleEnergy = abs(wakeHeight) + heightSlope * 1.75;
  float breakingFoam = smoothstep(
    foamHeightThreshold * 0.8,
    foamHeightThreshold + foamHeightSoftness,
    excessHeight + heightSlope * 0.65 * directionalBreak
  );

  float heightFoam = clamp(max(crestFoam, breakingFoam) * foamFromHeightStrength * directionalBreak, 0.0, 1.0);
  float rippleFoam = smoothstep(0.0015, 0.012, rippleEnergy) * directionalBreak;
  float sharpRippleFoam = smoothstep(0.0011, 0.0075, heightSlope) * smoothstep(0.0008, 0.010, abs(wakeHeight)) * directionalBreak;
  float extraRippleFoam = max(rippleFoam * 0.7, sharpRippleFoam);
  float wakeDisturbance = abs(wakeHeight) + heightSlope * 2.85 + abs(wakeVelocity) * 1.55;
  float wakeCrestEnergy = max(excessHeight, abs(wakeHeight) * 0.6) + heightSlope * 1.55;
  float tightWakeCore = smoothstep(0.0022, 0.016, wakeDisturbance) * smoothstep(0.0024, 0.021, wakeCrestEnergy);
  float steepWakeEdge = smoothstep(0.0014, 0.0085, heightSlope);
  float objectWakeFoam = tightWakeCore * mix(0.28, 1.0, steepWakeEdge);
  float objectFoam = clamp(
    max(heightFoam, objectWakeFoam) + extraRippleFoam * extraFoamRippleBoost * extraFoamEnabled,
    0.0,
    1.0
  ) * objectFoamEnabled;
  float oceanFoamOffset = 0.018;
  float oceanLeft = oceanHeight(stableWaterPoint - vec2(oceanFoamOffset, 0.0));
  float oceanRight = oceanHeight(stableWaterPoint + vec2(oceanFoamOffset, 0.0));
  float oceanBack = oceanHeight(stableWaterPoint - vec2(0.0, oceanFoamOffset));
  float oceanFront = oceanHeight(stableWaterPoint + vec2(0.0, oceanFoamOffset));
  float oceanSlope = length(vec2(oceanRight - oceanLeft, oceanFront - oceanBack));
  float waveFoamMask = 0.0;
  if (waveFoamEnabled > 0.001) {
    waveFoamMask = clamp(oceanForwardFoam(stableWaterPoint) * waveFoamEnabled, 0.0, 1.0);
  }

  float wakeFoamMask = clamp(max(objectFoam, objectWakeFoam * objectFoamEnabled), 0.0, 1.0);
  float visualWakeFoamMask = clamp(visualWakeFoamAmount, 0.0, 1.0) * objectFoamEnabled;
  float foamMask = clamp(max(max(wakeFoamMask, visualWakeFoamMask), waveFoamMask), 0.0, 1.0);
  float foamPattern = foamTexture(foamCoord + time * 0.015, info.ba * waterTextureEnabled + vec2(heightSlope + oceanSlope));
  float foamCells = fbm(stableWaterPoint * 46.0 + vec2(time * 0.09, -time * 0.04));
  float foamHoles = smoothstep(0.18, 0.66, foamCells);
  float textureMask = mix(1.0, mix(0.44, 1.0, foamPattern * foamHoles), foamMottleEnabled);
  float foam = clamp(pow(foamMask, 1.18) * textureMask * 1.42, 0.0, 1.0);

  vec3 normal = normalize(oceanNormal(stableWaterPoint) + vec3(info.b, 0.0, info.a) * wakeTextureStrength * 1.4);
  normal = normalize(normal + capillaryNormal(stableWaterPoint, foamMask + abs(wakeHeight) * 6.0, oceanSlope + heightSlope));
  if (visualWakeFoamMask > 0.001) {
    vec2 visualRoughness = vec2(
      noise(stableWaterPoint * 115.0 + vec2(time * 0.8, -time * 0.35)) - 0.5,
      noise(stableWaterPoint * 138.0 + vec2(-time * 0.42, time * 0.7)) - 0.5
    ) * visualWakeFoamMask * 0.48;
    normal = normalize(normal + vec3(visualRoughness.x, 0.0, visualRoughness.y));
  }
  float waterMottle = 1.0;
  if (waterMottleEnabled > 0.001) {
    float waterPattern = foamTexture(coord + vec2(time * 0.006, -time * 0.004), info.ba + vec2(oceanSlope, heightSlope));
    float waterFinePattern = noise(coord * 140.0 + vec2(-time * 0.018, time * 0.012));
    vec2 mottleNormal = vec2(waterPattern - 0.5, waterFinePattern - 0.5) * 0.14;
    normal = normalize(normal + vec3(mottleNormal.x, 0.0, mottleNormal.y));
    waterMottle = mix(0.84, 1.10, waterPattern);
  }
  float waterImageScale = waterTextureFrequency;
  vec2 waterImageCoord = waveLockedTextureCoord(waterImageScale, info.ba, oceanSlope + heightSlope);
  waterImageCoord += info.ba * 0.14 * waterTextureEnabled;
  waterImageCoord += vec2(heightSlope + oceanSlope, oceanSlope - heightSlope) * 0.18;
  vec3 waterImageColor = texture2D(waterImageTexture, waterImageCoord).rgb;
  vec3 waterTextureColor = mix(vec3(0.010, 0.125, 0.205), waterImageColor * vec3(0.56, 0.95, 1.22), 0.72);
  float waterImageBlend = waterImageTextureEnabled * waterTextureOpacity * (1.0 - foam * 0.45);
  vec3 incomingRay = normalize(pos - eye);
  float viewDepthTint = clamp((pos.y + 1.0) * 0.55, 0.0, 1.0);

  if (underwater == 1.) {
    normal = -normal;
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_WATER / IOR_AIR);
    float fresnel = mix(0.5, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, underwaterColor);
    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, vec3(1.0)) * vec3(0.72, 0.95, 1.08);
    vec3 finalColor = mix(reflectedColor, refractedColor, (1.0 - fresnel) * length(refractedRay));
    finalColor *= waterMottle;
    finalColor = mix(finalColor, finalColor * waterTextureColor * 2.35, waterImageBlend);
    finalColor = mix(finalColor, vec3(0.78, 0.91, 0.95), foam * 0.36);

    gl_FragColor = vec4(finalColor, waterOpacity);
  } else {
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
    float fresnel = mix(0.25, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, abovewaterColor);
    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, abovewaterColor);
    vec3 shallowWaterColor = vec3(0.035, 0.24, 0.31);
    vec3 deepWaterColor = vec3(0.004, 0.075, 0.145);
    vec3 opaqueWaterColor = mix(deepWaterColor, shallowWaterColor, viewDepthTint);
    vec3 visibleWaterColor = mix(refractedColor * vec3(0.82, 0.96, 1.02), opaqueWaterColor, waterOpacity);
    vec3 finalColor = mix(visibleWaterColor, reflectedColor, fresnel);
    finalColor *= waterMottle;
    finalColor = mix(finalColor, waterTextureColor, waterImageBlend);
    vec2 reflectionDistortion = normal.xz * 0.060 + info.ba * 0.070 * waterTextureEnabled;
    vec4 planarReflection = getPlanarReflection(reflectionCoord, reflectionDistortion);
    float objectReflection = planarReflection.a * fresnel * reflectionStrength * (1.0 - foam * 0.74);
    finalColor = mix(finalColor, planarReflection.rgb, objectReflection);
    float sparkle = pow(max(0.0, dot(reflect(incomingRay, normal), light)), 280.0) * (1.0 - foam) * reflectionStrength;
    finalColor += vec3(1.0, 0.92, 0.75) * sparkle * 0.055;
    finalColor = mix(finalColor, vec3(0.82, 0.93, 0.96), foam * 0.72);

    gl_FragColor = vec4(finalColor, waterOpacity);
  }
}
