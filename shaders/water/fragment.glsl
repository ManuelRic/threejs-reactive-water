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

float wave(vec2 point, vec2 direction, float frequency, float speed, float amplitude) {
  return sin(dot(point, normalize(direction)) * frequency + time * speed) * amplitude;
}

float oceanHeight(vec2 point) {
  float height = 0.0;
  height += wave(point, vec2(1.0, 0.35), 7.0, 1.3, 0.52);
  height += wave(point, vec2(-0.65, 1.0), 11.0, 1.9, 0.24);
  height += wave(point, vec2(0.2, 1.0), 17.0, 2.7, 0.12);
  height += wave(point, vec2(-1.0, 0.1), 23.0, 3.4, 0.06);
  return height * oceanWaveStrength;
}

vec3 oceanNormal(vec2 point) {
  float offset = 0.015;
  float left = oceanHeight(point - vec2(offset, 0.0));
  float right = oceanHeight(point + vec2(offset, 0.0));
  float back = oceanHeight(point - vec2(0.0, offset));
  float front = oceanHeight(point + vec2(0.0, offset));

  return normalize(vec3(left - right, offset * 2.0, back - front));
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
  float foamMask = heightFoam;
  float foamPattern = foamTexture(foamCoord + time * 0.015, info.ba + vec2(heightSlope));
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
