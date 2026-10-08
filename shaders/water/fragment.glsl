precision highp float;
precision highp int;

#include <utils>

uniform float underwater;
uniform samplerCube sky;
uniform sampler2D waterImageTexture;
uniform sampler2D waterNormalTexture;
uniform sampler2D kelvinTexture;
uniform float kelvinTexel;
uniform sampler2D foamImageTexture;
uniform sampler2D shipWakeFoamTexture;
uniform sampler2D reflectionTexture;
uniform sampler2D reflectionDepthTexture;
uniform float reflectionDepthAvailable;
uniform mat4 reflectionInverseViewProjection;
uniform sampler2D submergedTexture;
uniform sampler2D submergedDepthTexture;
uniform float submergedDepthAvailable;
uniform mat4 submergedInverseViewProjection;
uniform vec2 viewportSize;
uniform float cameraNear;
uniform float cameraFar;
uniform float time;
uniform float oceanWaveStrength;
uniform float oceanWaveFrequency;
uniform float oceanWaveSpeed;
uniform float oceanWaveSharpness;
uniform vec2 oceanWindDirection;
uniform float oceanWindSpeed;
uniform float oceanChoppiness;
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
uniform float deepWater;
uniform vec3 waterBodyColor;
uniform vec3 waterAbsorptionColor;
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
varying vec3 oceanSurfaceNormal;
varying float oceanElevation;

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

  // The approximate 2D hull mask belongs to the reaction solver only. Cutting
  // this displaced surface with it exposed sky-coloured holes beside the hull,
  // which looked like a solid white wake. Opaque hull geometry already occludes
  // water via the depth buffer, including its actual pitch, roll and waterline.

  return blocked;
}

vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  if (deepWater > 0.5) {
    return ray.y >= 0.0 ? textureCube(sky, ray).rgb : waterBodyColor * 0.55;
  }
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


float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
    mix(hash(i + vec2(0, 1)), hash(i + 1.0), f.x), f.y);
}
float foamFilm(vec2 p, float pixelWidth) {
  // The filter below converges to this average for subpixel bubbles. Skip
  // the nine-cell search entirely once no film detail can be resolved.
  if (pixelWidth >= .9) return .46;
  // Irregular bubble films inside larger torn rafts, filtered before they
  // become subpixel. The density field carries their coverage downstream.
  vec2 cell = floor(p), local = fract(p);
  float first = 8.0, second = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 offset = vec2(float(x), float(y));
    vec2 jitter = vec2(hash(cell + offset), hash(cell + offset + 37.2));
    vec2 delta = offset + .15 + jitter * .7 - local;
    float d = dot(delta, delta);
    second = min(second, max(first, d)); first = min(first, d);
  }
  float edge = sqrt(second) - sqrt(first);
  float film = 1.0 - smoothstep(.035, .13 + pixelWidth, edge);
  return mix(film, .46, smoothstep(.25, .9, pixelWidth));
}
vec2 windDirection(vec2 direction) {
  vec2 w = normalize(oceanWindDirection);
  return normalize(vec2(direction.x*w.x-direction.y*w.y, direction.x*w.y+direction.y*w.x));
}
vec2 rippleSlope(vec2 p, vec2 direction, float k, float amplitude, float phase, float footprint) {
  vec2 d = windDirection(direction);
  // Deep-water dispersion at 40 metres per world unit, filtered at pixel Nyquist.
  float omega = sqrt(0.24525 * k);
  float visible = 1.0 - smoothstep(1.0, 3.0, k * footprint);
  return d * cos(dot(p, d) * k - time * omega * oceanWaveSpeed + phase) * amplitude * visible;
}
vec2 detailSlope(vec2 p, float footprint) {
  vec2 slope = vec2(0.0);
  slope += rippleSlope(p, vec2(1.0, .22), 58.0, .042, .3, footprint);
  slope += rippleSlope(p, vec2(.84, -.54), 97.0, .034, 2.1, footprint);
  slope += rippleSlope(p, vec2(.93, .37), 163.0, .029, 4.7, footprint);
  slope += rippleSlope(p, vec2(.67, -.74), 267.0, .023, 1.4, footprint);
  slope += rippleSlope(p, vec2(.96, .28), 431.0, .019, 5.1, footprint);
  slope += rippleSlope(p, vec2(.78, -.62), 697.0, .014, 3.6, footprint);
  // Mipmapped wavelets remove the regular cross-hatching of pure sine bands.
  vec2 w = normalize(oceanWindDirection);
  vec2 q = vec2(dot(p, w), dot(p, vec2(-w.y, w.x)));
  vec2 n0 = texture2D(waterNormalTexture, q * .43 + vec2(-time*.014, time*.004)).rg * 2.0 - 1.0;
  vec2 n1 = texture2D(waterNormalTexture, q * 1.07 + vec2(-time*.022, -time*.008)).rg * 2.0 - 1.0;
  vec2 n2 = texture2D(waterNormalTexture, q * 2.71 + vec2(time*.029, time*.011)).rg * 2.0 - 1.0;
  vec2 detail = n0 * .42 + n1 * .23 + n2 * .12;
  detail = vec2(detail.x*w.x-detail.y*w.y, detail.x*w.y+detail.y*w.x);
  return (detail + slope * .16) * clamp(oceanWindSpeed / 8.0, .12, 1.7) * waterTextureEnabled;
}

vec2 distantSwell(vec2 p) {
  vec2 slope = vec2(0.0);
  vec2 d = windDirection(vec2(1.0, .18));
  slope += d * cos(dot(p,d)*2.6*oceanWaveFrequency + time*.56*oceanWaveSpeed + .3) * 2.6*.42;
  d = windDirection(vec2(.92, .38));
  slope += d * cos(dot(p,d)*3.7*oceanWaveFrequency + time*.72*oceanWaveSpeed + 2.1) * 3.7*.32;
  d = windDirection(vec2(.72, .70));
  slope += d * cos(dot(p,d)*5.2*oceanWaveFrequency + time*.96*oceanWaveSpeed + 4.5) * 5.2*.24;
  d = windDirection(vec2(.36, .94));
  slope += d * cos(dot(p,d)*6.8*oceanWaveFrequency + time*1.15*oceanWaveSpeed + 1.4) * 6.8*.18;
  return slope * oceanWaveStrength * oceanWaveFrequency * clamp(oceanWindSpeed/9.0, .35, 1.85);
}
float sunGlitter(vec3 n, vec3 v, vec3 l, float roughness) {
  vec3 h = normalize(v + l);
  float nl = max(dot(n, l), .001), nv = max(dot(n, v), .001);
  float nh = max(dot(n, h), 0.0), vh = max(dot(v, h), 0.0);
  float a2 = roughness * roughness;
  float denom = nh * nh * (a2 - 1.0) + 1.0;
  float distribution = a2 / (3.14159265 * denom * denom);
  float visibility = .5 / (nl * sqrt(nv*nv*(1.0-a2)+a2) + nv*sqrt(nl*nl*(1.0-a2)+a2));
  float fresnel = .02037 + .97963 * pow(1.0-vh, 5.0);
  return distribution * visibility * fresnel * nl;
}

float viewDistanceFromDepth(float depth) {
  return cameraNear * cameraFar /
    max(cameraFar - depth * (cameraFar - cameraNear), 0.0001);
}

vec3 worldPositionFromDepth(vec2 uv, float depth, mat4 inverseViewProjection) {
  vec4 point = inverseViewProjection * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  return point.xyz / point.w;
}

void main() {
  vec2 point = (waterUv - .5) * waterSize;
  float inDomain = step(0.0, waterUv.x) * step(waterUv.x, 1.0) *
    step(0.0, waterUv.y) * step(waterUv.y, 1.0);
  if (inDomain > .5 && waterBounceMask(waterUv) > .5) discard;

  vec4 info = vec4(0.0), wake = vec4(0.0);
  vec2 reactionSlope = vec2(0.0);
  if (inDomain > .5) {
    info = texture2D(water, waterUv);
    wake = texture2D(shipWakeFoamTexture, waterUv);
    float left = texture2D(kelvinTexture, waterUv - vec2(kelvinTexel, 0)).r;
    float right = texture2D(kelvinTexture, waterUv + vec2(kelvinTexel, 0)).r;
    float back = texture2D(kelvinTexture, waterUv - vec2(0, kelvinTexel)).r;
    float front = texture2D(kelvinTexture, waterUv + vec2(0, kelvinTexel)).r;
    reactionSlope = vec2(left-right, back-front) / (2.0 * kelvinTexel * waterSize);
  }
  float footprint = max(length(dFdx(point)), length(dFdy(point)));
  vec3 macroNormal = normalize(oceanSurfaceNormal);
  // Far rings drop displacement detail, while long-wave reflection detail remains.
  float farBlend = smoothstep(3.0, 8.0, max(abs(point.x), abs(point.y)));
  vec2 farSlope = distantSwell(point);
  macroNormal = normalize(mix(macroNormal, vec3(-farSlope.x, 1.0, -farSlope.y), farBlend));
  vec2 smallSlope = detailSlope(point + macroNormal.xz * .035, footprint);
  vec3 normal = normalize(macroNormal + vec3(-smallSlope.x, 0.0, -smallSlope.y) +
    vec3(info.b, 0.0, info.a) * wakeWaveStrength * waterTextureEnabled * 1.4 +
    vec3(reactionSlope.x, 0.0, reactionSlope.y) * waterTextureEnabled);
  vec3 v = normalize(eye - pos);
  vec3 l = normalize(light);

  // Foam is a dissipating coverage field, with aerated blue-green water below it.
  // World-anchored cells break up the trail without swimming with the camera.
  float density = wake.r * objectFoamEnabled;
  float aeration = wake.g * objectFoamEnabled;
  float foam = 0.0;
  if (density > .004) {
    vec2 q = point - wake.ba * .9;
    vec2 warp = vec2(noise(q * 19.0 + time * .035), noise(q * 17.0 + 31.0 - time * .027));
    q += (warp - .5) * .024;
    float raft = noise(q * 37.0) * .65 + noise(q * 91.0 + 9.0) * .35;
    float coverage = smoothstep(raft - .18, raft + .18, density * 1.1);
    float films = foamFilm(q * 230.0, footprint * 230.0);
    // Preserve translucent microbubbles at low speed; dense texels must not
    // saturate into an opaque white stamp. Finer films dissolve into coverage.
    // Keep sparse crest foam readable: applying density to both the coverage
    // mask and very dark films used to suppress these thin side trails twice.
    float bubbles = (.30 + .70 * coverage) * (.55 + .45 * films);
    foam = clamp(density * 1.6, 0.0, .82) * mix(.7, bubbles, foamMottleEnabled);
  }
  float steepness = length(macroNormal.xz);
  float whitecaps = smoothstep(.19, .36, steepness) *
    smoothstep(.015, .08, oceanElevation) * smoothstep(7.0, 16.0, oceanWindSpeed);
  vec2 wind = normalize(oceanWindDirection);
  vec2 crestCoord = vec2(dot(point, wind) * 110.0, dot(point, vec2(-wind.y, wind.x)) * 34.0);
  float crestLace = noise(crestCoord - time * .12) * noise(point * 157.0);
  whitecaps *= waveFoamEnabled * smoothstep(.28, .58, crestLace) * .48;
  float localFoam = smoothstep(foamHeightThreshold + .002,
    foamHeightThreshold + max(foamHeightSoftness, .006), max(info.r, 0.0)) *
    smoothstep(.001, .014, abs(info.g)) * foamFromHeightStrength * objectFoamEnabled;
  foam = clamp(max(foam, max(whitecaps, localFoam * mix(.2, .4, extraFoamEnabled))), 0.0, 1.0);

  if (underwater > .5) normal = -normal;
  float nv = max(dot(normal, v), 0.0);
  float fresnel = .02037 + .97963 * pow(1.0 - nv, 5.0);
  vec3 reflected = reflect(-v, normal);
  reflected.y = max(reflected.y, .002);
  vec3 reflection = textureCube(sky, reflected).rgb;
  vec3 transmitted;
  if (deepWater > .5) {
    float scatterLight = .34 + .46 * max(dot(l, normal), 0.0);
    transmitted = waterBodyColor * scatterLight * exp(-waterAbsorptionColor * 1.2);
    float crest = smoothstep(-.03, .08, oceanElevation);
    transmitted += vec3(.001, .016, .014) * crest *
      pow(max(dot(v, -l), 0.0), 2.0);
    transmitted = mix(transmitted, vec3(.025, .13, .13), aeration * .48);
  } else {
    vec3 refracted = refract(-v, normal, IOR_AIR / IOR_WATER);
    transmitted = getSurfaceRayColor(pos, refracted, abovewaterColor);
    vec3 absorption = exp(-waterAbsorptionColor / max(abs(refracted.y), .15));
    transmitted = transmitted * absorption + waterBodyColor * (1.0-absorption);
  }

  // The underwater pass contains only geometry below the waterline. Its depth
  // prevents an object behind the surface from showing through nearer water.
  if (deepWater > .5 && underwater < .5 && inDomain > .5) {
    vec2 submergedUv = gl_FragCoord.xy / viewportSize + normal.xz * .004;
    if (submergedUv.x > 0.0 && submergedUv.y > 0.0 &&
        submergedUv.x < 1.0 && submergedUv.y < 1.0) {
      vec4 submerged = texture2D(submergedTexture, submergedUv);
      if (submerged.a > .001) {
        float pathLength = .025;
        float depthGate = 1.0;
        if (submergedDepthAvailable > .5) {
          float objectDepth = texture2D(submergedDepthTexture, submergedUv).r;
          pathLength = viewDistanceFromDepth(objectDepth) -
            viewDistanceFromDepth(gl_FragCoord.z);
          float objectHeight = worldPositionFromDepth(submergedUv, objectDepth,
            submergedInverseViewProjection).y;
          depthGate = smoothstep(0.0, .035, pathLength) *
            (1.0 - smoothstep(-.015, .015, objectHeight - pos.y));
        }
        float visibility = submerged.a * depthGate * exp(-max(pathLength, 0.0) * 4.0);
        vec3 submergedColor = mix(submerged.rgb, waterBodyColor,
          1.0 - exp(-max(pathLength, 0.0) * 2.0));
        transmitted = mix(transmitted, submergedColor, visibility);
      }
    }
  }

  // Projected object reflection is composited in linear light.
  vec2 reflectionUV = reflectionCoord.xy / reflectionCoord.w +
    normal.xz * .018 + info.ba * .03;
  if (inDomain > .5 && reflectionCoord.w > 0.0 &&
      reflectionUV.x > 0.0 && reflectionUV.y > 0.0 &&
      reflectionUV.x < 1.0 && reflectionUV.y < 1.0) {
    vec4 objectReflection = texture2D(reflectionTexture, reflectionUV);
    float reflectionCoverage = objectReflection.a;
    if (reflectionDepthAvailable > .5 && reflectionCoverage > .001) {
      float objectDepth = texture2D(reflectionDepthTexture, reflectionUV).r;
      float objectHeight = worldPositionFromDepth(reflectionUV, objectDepth,
        reflectionInverseViewProjection).y;
      reflectionCoverage *= smoothstep(-.015, .015, objectHeight - pos.y);
    }
    reflection = mix(reflection, objectReflection.rgb,
      clamp(reflectionCoverage * reflectionStrength, 0.0, 1.0));
  }
  vec3 color = mix(transmitted, reflection, fresnel);
  // Unresolved short waves become roughness rather than flickering pixels.
  float roughness = .034 + clamp(oceanWindSpeed, 0.0, 20.0) * .0012 +
    min(footprint * .22, .075) + aeration * .06;
  float glitter = sunGlitter(normal, v, l, roughness) * reflectionStrength;
  color += vec3(1.0, .88, .68) * glitter * 1.6 * (1.0-foam);
  vec3 foamColor = vec3(.65, .76, .78) * (.65 + .35 * max(dot(normal, l), 0.0));
  color = mix(color, foamColor, foam * .9);
  if (waterImageTextureEnabled > .5) {
    color = mix(color, color * texture2D(waterImageTexture, waterWaveUv * waterTextureFrequency).rgb * 2.0,
      waterTextureOpacity * .25);
  }
  if (underwater > .5) color = mix(color, waterBodyColor, .45);
  // Maritime haze closes the horizon; it never hides the local interaction patch.
  float haze = 1.0 - exp(-length(pos.xz-eye.xz) * .0035);
  color = mix(color, textureCube(sky, normalize(vec3(-v.x, .025, -v.z))).rgb, haze * deepWater);
  gl_FragColor = vec4(color, mix(waterOpacity, 1.0, deepWater));
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}
