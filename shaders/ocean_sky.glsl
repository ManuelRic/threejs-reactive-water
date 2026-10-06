// Shared radiance for the visible sky and the reflection environment.
float skyHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float skyNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(skyHash(i), skyHash(i + vec2(1, 0)), f.x),
    mix(skyHash(i + vec2(0, 1)), skyHash(i + 1.0), f.x), f.y);
}
vec3 oceanSkyColor(vec3 direction, vec3 sunDirection) {
  vec3 ray = normalize(direction);
  float elevation = max(ray.y, 0.0);
  vec3 color = mix(vec3(0.52, 0.68, 0.80), vec3(0.055, 0.22, 0.48), pow(elevation, 0.38));
  float alignment = max(dot(ray, normalize(sunDirection)), 0.0);
  color += vec3(1.0, 0.74, 0.42) * pow(alignment, 12.0) * 0.28;
  vec2 p = ray.xz / (max(ray.y, 0.035) + 0.12) * 2.4 + vec2(12.7, 3.1);
  float cloud = skyNoise(p) * 0.55 + skyNoise(p * 2.03) * 0.28 + skyNoise(p * 4.09) * 0.17;
  float coverage = smoothstep(0.56, 0.77, cloud) * smoothstep(0.015, 0.18, elevation) * 0.72;
  color = mix(color, vec3(0.83, 0.85, 0.84) + pow(alignment, 6.0) * 0.25, coverage);
  color += vec3(1.0, 0.86, 0.64) * pow(alignment, 180.0) * 0.25;
  color += vec3(1.0, 0.92, 0.78) * smoothstep(0.99987, 0.99996, alignment) * 6.0;
  return color;
}
