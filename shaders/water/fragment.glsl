precision highp float;
precision highp int;

#include <utils>

uniform float underwater;
uniform samplerCube sky;
uniform float time;
uniform float oceanWaveStrength;
uniform float wakeWaveStrength;
uniform float foamHeightThreshold;
uniform float foamHeightSoftness;
uniform float foamFromHeightStrength;
uniform float objectFoamEnabled;
uniform float waveFoamEnabled;
uniform float extraFoamEnabled;
uniform float extraFoamRippleBoost;

varying vec3 eye;
varying vec3 pos;


vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  vec3 color;

  if (ray.y < 0.0) {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
    color = getWallColor(origin + ray * t.y);
  } else {
    vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
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

  float cells = smoothstep(0.34, 0.78, broad + fine * 0.45);
  float flecks = smoothstep(0.62, 0.95, specks);

  return clamp(cells + flecks * 0.45, 0.0, 1.0);
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

  return crest + pow(positiveCrest, 3.0) * storm * 0.85 - pow(negativeCrest, 2.0) * storm * 0.16;
}

float gerstnerHeight(vec2 point, OceanWave wave) {
  vec2 direction = normalize(wave.direction);
  float phase = dot(point, direction) * wave.frequency + time * wave.speed;
  float crest = sin(phase);

  return sharpenCrest(crest, stormAmount()) * wave.amplitude;
}

float oceanHeight(vec2 point) {
  float height = 0.0;

  height += gerstnerHeight(point, OceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62));
  height += gerstnerHeight(point, OceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48));
  height += gerstnerHeight(point, OceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34));
  height += gerstnerHeight(point, OceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22));
  height += gerstnerHeight(point, OceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18));

  return height * oceanWaveStrength;
}

vec3 oceanNormal(vec2 point) {
  float storm = stormAmount();
  float offset = 0.012;
  float left = oceanHeight(point - vec2(offset, 0.0));
  float right = oceanHeight(point + vec2(offset, 0.0));
  float back = oceanHeight(point - vec2(0.0, offset));
  float front = oceanHeight(point + vec2(0.0, offset));
  float fineRipple = noise(point * vec2(62.0, 48.0) + time * vec2(0.05, 0.11)) - 0.5;
  float crossRipple = noise(point * vec2(118.0, 96.0) - time * vec2(0.13, 0.07)) - 0.5;
  float stormChop = noise(point * vec2(175.0, 130.0) + time * vec2(0.28, -0.22)) - 0.5;

  return normalize(vec3(
    left - right + fineRipple * oceanWaveStrength * 0.18 + stormChop * oceanWaveStrength * storm * 0.24,
    offset * 2.0,
    back - front + crossRipple * oceanWaveStrength * 0.14 + stormChop * oceanWaveStrength * storm * 0.18
  ));
}


void main() {
  vec2 coord = pos.xz * 0.5 + 0.5;
  vec2 foamCoord = coord;
  vec4 info = texture2D(water, coord);
  vec4 heightInfo = info;

  /* make water look more "peaked" */
  for (int i = 0; i < 5; i++) {
    coord += info.ba * 0.005;
    info = texture2D(water, coord);
  }

  float wakeHeight = heightInfo.r * wakeWaveStrength;
  float excessHeight = max(0.0, wakeHeight);
  float crestFoam = smoothstep(
    foamHeightThreshold,
    foamHeightThreshold + foamHeightSoftness,
    excessHeight
  );

  float texel = 1.0 / 256.0;
  float leftHeight = texture2D(water, foamCoord - vec2(texel, 0.0)).r * wakeWaveStrength;
  float rightHeight = texture2D(water, foamCoord + vec2(texel, 0.0)).r * wakeWaveStrength;
  float backHeight = texture2D(water, foamCoord - vec2(0.0, texel)).r * wakeWaveStrength;
  float frontHeight = texture2D(water, foamCoord + vec2(0.0, texel)).r * wakeWaveStrength;
  float heightSlope = length(vec2(rightHeight - leftHeight, frontHeight - backHeight));
  float breakingFoam = smoothstep(
    foamHeightThreshold * 0.8,
    foamHeightThreshold + foamHeightSoftness,
    excessHeight + heightSlope * 0.65
  );

  float heightFoam = clamp(max(crestFoam, breakingFoam) * foamFromHeightStrength, 0.0, 1.0);
  float ripplePresence = smoothstep(0.002, 0.018, abs(wakeHeight) + heightSlope * 0.8);
  float extraRippleFoam = ripplePresence * smoothstep(0.0, foamHeightSoftness, excessHeight + heightSlope * 0.9);
  float objectFoam = clamp(
    (heightFoam + extraRippleFoam * extraFoamRippleBoost * extraFoamEnabled) * objectFoamEnabled,
    0.0,
    1.0
  );

  float oceanCenter = oceanHeight(pos.xz);
  float oceanFoamScale = max(0.001, oceanWaveStrength);
  float oceanRange = oceanFoamScale * 0.7;
  float oceanCrest = smoothstep(oceanRange * 0.55, oceanRange * 1.05, oceanCenter);
  float oceanFoamOffset = 0.018;
  float oceanLeft = oceanHeight(pos.xz - vec2(oceanFoamOffset, 0.0));
  float oceanRight = oceanHeight(pos.xz + vec2(oceanFoamOffset, 0.0));
  float oceanBack = oceanHeight(pos.xz - vec2(0.0, oceanFoamOffset));
  float oceanFront = oceanHeight(pos.xz + vec2(0.0, oceanFoamOffset));
  float oceanSlope = length(vec2(oceanRight - oceanLeft, oceanFront - oceanBack));
  float oceanBreaking = smoothstep(oceanFoamScale * 0.05, oceanFoamScale * 0.22, oceanSlope);
  float waveFoamMask = clamp(oceanCrest * oceanBreaking * waveFoamEnabled, 0.0, 1.0);

  float foamMask = clamp(max(objectFoam, waveFoamMask), 0.0, 1.0);
  float foamPattern = foamTexture(foamCoord + time * 0.015, info.ba + vec2(heightSlope + oceanSlope));
  float foam = clamp(foamMask * (0.62 + foamPattern * 0.62), 0.0, 1.0);

  vec3 normal = normalize(oceanNormal(pos.xz) + vec3(info.b, 0.0, info.a) * wakeWaveStrength * 1.4);
  vec3 incomingRay = normalize(pos - eye);

  if (underwater == 1.) {
    normal = -normal;
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_WATER / IOR_AIR);
    float fresnel = mix(0.5, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, underwaterColor);
    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, vec3(1.0)) * vec3(0.8, 1.0, 1.1);
    vec3 finalColor = mix(reflectedColor, refractedColor, (1.0 - fresnel) * length(refractedRay));
    finalColor = mix(finalColor, vec3(0.9, 0.98, 1.0), foam * 0.55);

    gl_FragColor = vec4(finalColor, 0.55);
  } else {
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
    float fresnel = mix(0.25, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));

    vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, abovewaterColor);
    vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, abovewaterColor);
    vec3 finalColor = mix(refractedColor, reflectedColor, fresnel);
    finalColor = mix(finalColor, vec3(1.0), foam * 1.15);

    gl_FragColor = vec4(finalColor, 0.55);
  }
}
