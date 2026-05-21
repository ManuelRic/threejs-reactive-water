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
uniform float waterExtent;
uniform float waterOpacity;
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


vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  vec3 color;

  if (ray.y < 0.0) {
    vec2 t = intersectCube(origin, ray, vec3(-poolHalfSize, -poolHeight, -poolHalfSize), vec3(poolHalfSize, 2.0, poolHalfSize));
    color = getWallColor(origin + ray * t.y);
  } else {
    vec2 t = intersectCube(origin, ray, vec3(-poolHalfSize, -poolHeight, -poolHalfSize), vec3(poolHalfSize, 2.0, poolHalfSize));
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

float foamTexture(vec2 coord, vec2 direction) {
  vec2 stretchedCoord = coord + direction * 0.035;
  float broad = noise(stretchedCoord * vec2(32.0, 18.0));
  float fine = noise(stretchedCoord * vec2(95.0, 70.0));
  float specks = noise(stretchedCoord * 180.0);

  float cells = smoothstep(0.58, 0.64, broad + fine * 0.45);
  float flecks = smoothstep(0.82, 0.88, specks);

  return clamp(cells + flecks * 0.45, 0.0, 1.0);
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
  return mix(gerstnerOceanHeight(point), spectralOceanHeight(point), fftWavesEnabled);
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


void main() {
  vec2 coord = pos.xz / (waterExtent * 2.0) + 0.5;
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

  float texel = 1.0 / 256.0;
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
  float slopeBreak = smoothstep(0.00055, 0.0065, heightSlope);
  float directionalBreak = clamp(max(leadingFace * crestBias, slopeBreak * leadingFace * 0.75), 0.0, 1.0);
  float rippleEnergy = abs(wakeHeight) + heightSlope * 1.35;
  float breakingFoam = smoothstep(
    foamHeightThreshold * 0.8,
    foamHeightThreshold + foamHeightSoftness,
    excessHeight + heightSlope * 0.65 * directionalBreak
  );

  float heightFoam = clamp(max(crestFoam, breakingFoam) * foamFromHeightStrength * directionalBreak, 0.0, 1.0);
  float rippleFoam = smoothstep(0.00055, 0.010, rippleEnergy) * directionalBreak;
  float sharpRippleFoam = smoothstep(0.00045, 0.0065, heightSlope) * smoothstep(0.00035, 0.009, abs(wakeHeight)) * directionalBreak;
  float extraRippleFoam = max(rippleFoam * 0.92, sharpRippleFoam);
  float wakeDisturbance = abs(wakeHeight) + heightSlope * 2.4 + abs(wakeVelocity) * 1.8;
  float wakeCrestEnergy = max(excessHeight, abs(wakeHeight) * 0.65) + heightSlope * 1.2;
  float objectWakeFoam = smoothstep(0.0015, 0.014, wakeDisturbance) * smoothstep(0.001, 0.02, wakeCrestEnergy);
  float objectFoam = clamp(
    max(heightFoam, objectWakeFoam) + extraRippleFoam * extraFoamRippleBoost * extraFoamEnabled,
    0.0,
    1.0
  ) * objectFoamEnabled;
  float oceanFoamOffset = 0.018;
  float oceanLeft = oceanHeight(pos.xz - vec2(oceanFoamOffset, 0.0));
  float oceanRight = oceanHeight(pos.xz + vec2(oceanFoamOffset, 0.0));
  float oceanBack = oceanHeight(pos.xz - vec2(0.0, oceanFoamOffset));
  float oceanFront = oceanHeight(pos.xz + vec2(0.0, oceanFoamOffset));
  float oceanSlope = length(vec2(oceanRight - oceanLeft, oceanFront - oceanBack));
  float directionalOceanFoam = oceanForwardFoam(pos.xz);
  float waveFoamMask = clamp(directionalOceanFoam * waveFoamEnabled, 0.0, 1.0);

  float wakeFoamMask = clamp(max(objectFoam, objectWakeFoam * objectFoamEnabled), 0.0, 1.0);
  float foamMask = clamp(max(wakeFoamMask, waveFoamMask), 0.0, 1.0);
  float foamPattern = foamTexture(foamCoord + time * 0.015, info.ba * waterTextureEnabled + vec2(heightSlope + oceanSlope));
  float textureMask = mix(1.0, mix(0.82, 1.0, foamPattern), foamMottleEnabled);
  float foam = clamp(foamMask * textureMask * 1.12, 0.0, 1.0);

  vec3 normal = normalize(oceanNormal(pos.xz) + vec3(info.b, 0.0, info.a) * wakeTextureStrength * 1.4);
  float waterPattern = foamTexture(coord + vec2(time * 0.006, -time * 0.004), info.ba + vec2(oceanSlope, heightSlope));
  float waterFinePattern = noise(coord * 140.0 + vec2(-time * 0.018, time * 0.012));
  vec2 mottleNormal = vec2(waterPattern - 0.5, waterFinePattern - 0.5) * 0.11 * waterMottleEnabled;
  normal = normalize(normal + vec3(mottleNormal.x, 0.0, mottleNormal.y));
  float waterMottle = mix(1.0, mix(0.88, 1.08, waterPattern), waterMottleEnabled);
  float waterImageScale = 2.7;
  vec2 waterImageCoord = waterUv * waterImageScale + waterTextureScroll(waterImageScale) + waterTextureFlow(pos.xz);
  waterImageCoord += info.ba * 0.48 * waterTextureEnabled;
  waterImageCoord += vec2(heightSlope + oceanSlope, oceanSlope - heightSlope) * 0.18;
  vec3 waterImageColor = texture2D(waterImageTexture, waterImageCoord).rgb;
  vec3 waterTextureColor = mix(vec3(0.02, 0.22, 0.34), waterImageColor * vec3(0.7, 1.05, 1.25), 0.75);
  float waterImageBlend = waterImageTextureEnabled * (1.0 - foam * 0.45);
  vec3 incomingRay = normalize(pos - eye);

  if (underwater == 1.) {
    normal = -normal;
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_WATER / IOR_AIR);
    float fresnel = mix(0.5, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, underwaterColor);
    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, vec3(1.0)) * vec3(0.8, 1.0, 1.1);
    vec3 finalColor = mix(reflectedColor, refractedColor, (1.0 - fresnel) * length(refractedRay));
    finalColor *= waterMottle;
    finalColor = mix(finalColor, finalColor * waterTextureColor * 2.35, waterImageBlend * 0.32);
    finalColor = mix(finalColor, vec3(0.82, 0.92, 0.96), foam * 0.32);

    gl_FragColor = vec4(finalColor, waterOpacity);
  } else {
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
    float fresnel = mix(0.25, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, abovewaterColor);
    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, abovewaterColor);
    vec3 opaqueWaterColor = vec3(0.015, 0.16, 0.28);
    vec3 visibleWaterColor = mix(refractedColor, opaqueWaterColor, waterOpacity);
    vec3 finalColor = mix(visibleWaterColor, reflectedColor, fresnel);
    finalColor *= waterMottle;
    finalColor = mix(finalColor, waterTextureColor, waterImageBlend * 0.34);
    vec2 reflectionDistortion = normal.xz * 0.045 + info.ba * 0.055 * waterTextureEnabled;
    vec4 planarReflection = getPlanarReflection(reflectionCoord, reflectionDistortion);
    float objectReflection = planarReflection.a * fresnel * reflectionStrength * (1.0 - foam * 0.65);
    finalColor = mix(finalColor, planarReflection.rgb, objectReflection);
    finalColor = mix(finalColor, vec3(0.86, 0.94, 0.96), foam * 0.62);

    gl_FragColor = vec4(finalColor, waterOpacity);
  }
}
