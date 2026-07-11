precision highp float;
precision highp int;

uniform sampler2D foamTexture;
uniform sampler2D waterTexture;
uniform sampler2D wakeSourceTexture;
uniform vec2 delta;
uniform vec2 waterDelta;
uniform vec2 waterSize;
uniform float timeStep;
uniform float time;
uniform float foamDecay;
uniform float farWakeLifetime;
uniform float foamAdvectionSpeed;
uniform float foamGenerationThreshold;
uniform float turbulenceIntensity;
uniform float diffusion;
varying vec2 coord;

float hash12(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 sampleFlow(vec2 uv) {
  return texture2D(foamTexture, clamp(uv, 0.0, 1.0)).ba;
}

void main() {
  vec4 previous = texture2D(foamTexture, coord);
  vec4 source = texture2D(wakeSourceTexture, coord);
  vec4 water = texture2D(waterTexture, coord);

  float leftHeight = texture2D(waterTexture, coord - vec2(waterDelta.x, 0.0)).r;
  float rightHeight = texture2D(waterTexture, coord + vec2(waterDelta.x, 0.0)).r;
  float backHeight = texture2D(waterTexture, coord - vec2(0.0, waterDelta.y)).r;
  float frontHeight = texture2D(waterTexture, coord + vec2(0.0, waterDelta.y)).r;
  vec2 worldTexel = waterSize * waterDelta;
  vec2 heightGradient = vec2(
    (rightHeight - leftHeight) / max(worldTexel.x * 2.0, 0.0001),
    (frontHeight - backHeight) / max(worldTexel.y * 2.0, 0.0001)
  );

  vec2 sourceDirection = source.gb * 2.0 - 1.0;
  float sourceDirectionLength = length(sourceDirection);
  sourceDirection = sourceDirectionLength > 0.1
    ? sourceDirection / sourceDirectionLength
    : vec2(0.0);

  vec2 surfaceFlow = clamp(
    -heightGradient * foamAdvectionSpeed * 0.42,
    vec2(-0.28),
    vec2(0.28)
  );
  float flowResponse = 1.0 - exp(-timeStep * 3.2);
  vec2 predictedFlow = mix(previous.ba, surfaceFlow, flowResponse);
  float sourceFlowSpeed = 0.08 + source.a * 0.24 * turbulenceIntensity;
  predictedFlow = mix(
    predictedFlow,
    sourceDirection * sourceFlowSpeed,
    clamp(source.r * (0.52 + source.a * 0.30), 0.0, 0.92)
  );

  vec2 backtracedUv = clamp(coord - predictedFlow * timeStep / waterSize, 0.0, 1.0);
  vec4 advected = texture2D(foamTexture, backtracedUv);
  vec4 neighborAverage = (
    texture2D(foamTexture, backtracedUv - vec2(delta.x, 0.0)) +
    texture2D(foamTexture, backtracedUv + vec2(delta.x, 0.0)) +
    texture2D(foamTexture, backtracedUv - vec2(0.0, delta.y)) +
    texture2D(foamTexture, backtracedUv + vec2(0.0, delta.y))
  ) * 0.25;
  float diffusionAmount = clamp(diffusion * timeStep * 12.0, 0.0, 0.28);
  float density = mix(advected.r, neighborAverage.r, diffusionAmount);
  float aeration = mix(advected.g, neighborAverage.g, diffusionAmount * 0.7);

  vec2 leftFlow = sampleFlow(coord - vec2(delta.x, 0.0));
  vec2 rightFlow = sampleFlow(coord + vec2(delta.x, 0.0));
  vec2 backFlow = sampleFlow(coord - vec2(0.0, delta.y));
  vec2 frontFlow = sampleFlow(coord + vec2(0.0, delta.y));
  float divergence = (rightFlow.x - leftFlow.x) + (frontFlow.y - backFlow.y);
  float vorticity = (rightFlow.y - leftFlow.y) - (frontFlow.x - backFlow.x);
  float compression = max(0.0, -divergence);

  float curvature = abs((leftHeight + rightHeight + backHeight + frontHeight) * 0.25 - water.r);
  float wakeEnergy = abs(water.g) * 1.65 + curvature * 11.0 + length(heightGradient) * 0.018;
  float breaking = smoothstep(
    foamGenerationThreshold,
    foamGenerationThreshold * 3.4,
    wakeEnergy + compression * 0.35
  );
  breaking *= smoothstep(-0.012, 0.018, water.r + curvature * 0.7);

  float cellNoise = hash12(
    floor(coord / delta) + floor(time * 2.4) * vec2(13.0, 7.0)
  );
  float decayVariation = mix(0.70, 1.32, cellNoise);
  float lifetimeScale = 8.0 / max(farWakeLifetime, 1.0);
  density *= exp(-foamDecay * lifetimeScale * decayVariation * timeStep);
  aeration *= exp(-foamDecay * lifetimeScale * 1.38 * timeStep);

  float crestGeneration = breaking * timeStep * (0.72 + turbulenceIntensity * 0.42);
  density += (1.0 - density) * crestGeneration;
  aeration += (1.0 - aeration) * breaking * timeStep * 0.55;

  float sourceDensity = source.r * (0.72 + source.a * 0.28);
  float sourceResponse = 1.0 - exp(-timeStep * 8.5);
  density += (1.0 - density) * sourceDensity * sourceResponse;
  aeration += (1.0 - aeration) * source.r * source.a * turbulenceIntensity * sourceResponse * 0.82;

  vec2 transportedFlow = mix(advected.ba, predictedFlow, flowResponse + source.r * 0.35);
  vec2 curlDirection = vec2(-transportedFlow.y, transportedFlow.x);
  transportedFlow += curlDirection * clamp(vorticity, -0.12, 0.12) * timeStep * 0.65;
  transportedFlow *= exp(-timeStep * (0.52 + diffusion * 0.8));
  transportedFlow = clamp(transportedFlow, vec2(-0.35), vec2(0.35));

  float edgeFade =
    smoothstep(0.0, 0.025, coord.x) *
    smoothstep(0.0, 0.025, coord.y) *
    smoothstep(0.0, 0.025, 1.0 - coord.x) *
    smoothstep(0.0, 0.025, 1.0 - coord.y);

  gl_FragColor = vec4(
    clamp(density * edgeFade, 0.0, 1.0),
    clamp(aeration * edgeFade, 0.0, 1.0),
    transportedFlow
  );
}
