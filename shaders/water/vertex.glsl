uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform sampler2D water;
uniform mat4 reflectionTextureMatrix;
uniform vec3 worldCameraPosition;
uniform float time;
uniform float oceanWaveStrength;
uniform float oceanWaveFrequency;
uniform float oceanWaveSpeed;
uniform float oceanWaveSharpness;
uniform float fftWavesEnabled;
uniform float wakeWaveStrength;
uniform float waterTextureEnabled;
uniform vec2 waterSize;
uniform float visualWakeCount;
uniform vec4 visualWakePoint0[48];
uniform vec4 visualWakePoint1[48];
uniform vec4 visualWakeHullSize;

attribute vec3 position;

varying vec3 eye;
varying vec3 pos;
varying vec4 reflectionCoord;
varying vec2 waterUv;
varying vec2 waterWaveUv;
varying float visualWakeFoamAmount;

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

vec3 gerstnerWave(vec2 point, OceanWave wave) {
  vec2 direction = normalize(wave.direction);
  float phase = dot(point, direction) * wave.frequency * oceanWaveFrequency + time * wave.speed * oceanWaveSpeed;
  float crest = sin(phase);
  float storm = stormAmount();
  float shapedCrest = sharpenCrest(crest, storm);
  float horizontal = cos(phase) * wave.steepness * wave.amplitude * oceanWaveSharpness * (1.0 + storm * 0.55);

  return vec3(
    direction.x * horizontal,
    shapedCrest * wave.amplitude,
    direction.y * horizontal
  );
}

vec3 gerstnerOceanDisplacement(vec2 point) {
  vec3 displacement = vec3(0.0);

  displacement += gerstnerWave(point, OceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62));
  displacement += gerstnerWave(point, OceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48));
  displacement += gerstnerWave(point, OceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34));
  displacement += gerstnerWave(point, OceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22));
  displacement += gerstnerWave(point, OceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18));

  return displacement * oceanWaveStrength;
}

vec3 spectralWave(vec2 point, vec2 direction, float frequency, float speed, float amplitude, float phase) {
  vec2 waveDirection = normalize(direction);
  float angle = dot(point, waveDirection) * frequency * oceanWaveFrequency + time * speed * oceanWaveSpeed + phase;
  float crest = sin(angle);
  float slope = cos(angle);
  float chop = amplitude * oceanWaveSharpness * 0.18;

  return vec3(
    waveDirection.x * slope * chop,
    crest * amplitude,
    waveDirection.y * slope * chop
  );
}

vec3 spectralOceanDisplacement(vec2 point) {
  vec3 displacement = vec3(0.0);

  displacement += spectralWave(point, vec2(1.00, 0.18), 2.60, 0.56, 0.42, 0.30);
  displacement += spectralWave(point, vec2(0.92, 0.38), 3.70, 0.72, 0.32, 2.10);
  displacement += spectralWave(point, vec2(0.72, 0.70), 5.20, 0.96, 0.24, 4.50);
  displacement += spectralWave(point, vec2(0.36, 0.94), 6.80, 1.15, 0.18, 1.40);
  displacement += spectralWave(point, vec2(-0.10, 1.00), 8.60, 1.42, 0.14, 5.30);
  displacement += spectralWave(point, vec2(-0.42, 0.91), 10.80, 1.68, 0.105, 0.80);
  displacement += spectralWave(point, vec2(0.58, -0.82), 12.60, 1.94, 0.080, 3.70);
  displacement += spectralWave(point, vec2(-0.74, 0.66), 15.20, 2.22, 0.060, 2.80);
  displacement += spectralWave(point, vec2(0.98, -0.22), 18.50, 2.55, 0.045, 5.90);
  displacement += spectralWave(point, vec2(-0.88, -0.48), 21.00, 2.88, 0.034, 1.90);
  displacement += spectralWave(point, vec2(0.18, 0.98), 24.80, 3.25, 0.026, 4.10);
  displacement += spectralWave(point, vec2(-0.26, 0.96), 29.50, 3.68, 0.020, 0.55);
  displacement += spectralWave(point, vec2(0.64, 0.77), 34.00, 4.05, 0.016, 3.20);
  displacement += spectralWave(point, vec2(-0.56, 0.83), 40.00, 4.52, 0.012, 5.05);
  displacement += spectralWave(point, vec2(0.86, 0.50), 48.00, 5.10, 0.009, 2.45);
  displacement += spectralWave(point, vec2(-0.98, 0.18), 56.00, 5.75, 0.007, 4.85);

  return displacement * oceanWaveStrength;
}

vec3 oceanDisplacement(vec2 point) {
  if (fftWavesEnabled > 0.5) {
    return spectralOceanDisplacement(point);
  }

  return gerstnerOceanDisplacement(point);
}

float visualSegmentWindow(float along, float start, float end, float feather) {
  return smoothstep(start - feather, start + feather, along) *
    (1.0 - smoothstep(end - feather, end + feather, along));
}

float visualRidge(float lateral, float width) {
  float safeWidth = max(width, 0.001);
  float scaled = lateral / safeWidth;

  return exp(-scaled * scaled);
}

vec2 visualWakeArmInfo(
  vec2 point,
  vec2 source,
  vec2 trail,
  vec2 side,
  float sideSign,
  float beam,
  float length,
  float speed,
  float turnAmount,
  float age,
  float fade
) {
  const float kelvinAngle = 0.3403392;
  vec2 armDirection = normalize(trail * cos(kelvinAngle) + side * sideSign * sin(kelvinAngle));
  vec2 armSide = vec2(-armDirection.y, armDirection.x);
  vec2 deltaPoint = point - source;
  float along = dot(deltaPoint, armDirection);
  float lateral = dot(deltaPoint, armSide);
  float armLength = max(length * 0.78, beam * 2.25);
  float spread = 1.0 + age * 0.028;
  float window = visualSegmentWindow(along, -beam * 0.12, armLength, beam * 0.22);
  float ridge = visualRidge(lateral, beam * 0.060 * spread);
  float shoulder = visualRidge(abs(lateral) - beam * 0.12, beam * 0.075 * spread) * 0.38;
  float outsideTurnBoost = 1.0 + max(0.0, sideSign * turnAmount) * 0.45;
  float phase = along * 53.0 - age * 6.2 + sideSign * 0.7;
  float secondary = sin(along * 27.0 + abs(lateral) * 22.0 - age * 4.5);
  float envelope = window * max(ridge, shoulder) * outsideTurnBoost;
  float height = (sin(phase) * 0.0048 + secondary * 0.0022) * speed * fade * envelope;
  float foam = window * max(ridge * 0.78, shoulder) * speed * fade * outsideTurnBoost * 0.72;

  return vec2(height, foam);
}

vec2 visualWakeInfo(vec2 point) {
  float height = 0.0;
  float foam = 0.0;
  float bow = max(visualWakeHullSize.x, 0.001);
  float stern = max(visualWakeHullSize.y, 0.001);
  float beam = max(visualWakeHullSize.z, 0.001);
  float lifetime = max(visualWakeHullSize.w, 0.001);
  float length = bow + stern;

  for (int i = 0; i < 48; i++) {
    if (float(i) >= visualWakeCount) {
      break;
    }

    vec4 point0 = visualWakePoint0[i];
    vec4 point1 = visualWakePoint1[i];
    float age = time - point1.x;

    if (age < 0.0 || age > lifetime) {
      continue;
    }

    vec2 direction = normalize(point0.zw);
    vec2 trail = -direction;
    vec2 side = vec2(-direction.y, direction.x);
    vec2 center = point0.xy;
    vec2 sternPoint = center - direction * stern;
    vec2 bowPoint = center + direction * bow;
    float speed = clamp(point1.y, 0.0, 1.0);
    float turnAmount = clamp(point1.z, -1.0, 1.0);
    float fresh = mix(0.72, 1.0, smoothstep(0.0, 0.22, age));
    float fade = fresh * (1.0 - smoothstep(lifetime * 0.62, lifetime, age));

    vec2 sternDelta = point - sternPoint;
    float sternAlong = dot(sternDelta, trail);
    float sternLateral = dot(sternDelta, side);
    float sternLength = max(length * 0.82, beam * 2.2);
    float sternWindow = visualSegmentWindow(sternAlong, -beam * 0.20, sternLength, beam * 0.24);
    float spread = 1.0 + age * 0.030;
    float centerWash = visualRidge(sternLateral, beam * 0.28 * spread);
    float shoulderWash = visualRidge(abs(sternLateral) - beam * 0.42, beam * 0.105 * spread);
    float propFoam = centerWash * (1.0 - smoothstep(length * 0.42, sternLength, sternAlong));
    float sternFoam = sternWindow * max(propFoam * 0.72, max(centerWash * 0.34, shoulderWash)) * speed * fade;
    float sternPhase = sternAlong * 46.0 + sternLateral * 9.0 - age * 7.0;
    float boilPhase = sternAlong * 24.0 - abs(sternLateral) * 18.0 - age * 4.8;
    float sternLift = sin(sternPhase) * 0.0038 + sin(boilPhase) * 0.0024;
    float sternDepression = -0.0028 * centerWash;

    height += (sternLift * max(centerWash, shoulderWash * 0.72) + sternDepression) *
      speed * fade * sternWindow;
    foam = max(foam, sternFoam);

    vec2 rightArm = visualWakeArmInfo(
      point,
      bowPoint + side * beam * 0.50,
      trail,
      side,
      1.0,
      beam,
      length,
      speed,
      turnAmount,
      age,
      fade
    );
    height += rightArm.x;
    foam = max(foam, rightArm.y);

    vec2 leftArm = visualWakeArmInfo(
      point,
      bowPoint - side * beam * 0.50,
      trail,
      side,
      -1.0,
      beam,
      length,
      speed,
      turnAmount,
      age,
      fade
    );
    height += leftArm.x;
    foam = max(foam, leftArm.y);
  }

  return vec2(clamp(height, -0.065, 0.065), clamp(foam, 0.0, 1.0));
}


void main() {
  vec4 worldPosition = modelMatrix * vec4(position.x, 0.0, position.y, 1.0);
  vec2 worldPoint = worldPosition.xz;

  waterUv = worldPoint / waterSize + 0.5;
  vec4 info = texture2D(water, waterUv);
  pos = worldPosition.xyz;
  vec3 ocean = oceanDisplacement(worldPoint);
  vec2 wakeInfo = visualWakeInfo(worldPoint);
  pos.xz += ocean.xz;
  pos.y += ocean.y + info.r * wakeWaveStrength * waterTextureEnabled;
  pos.y += wakeInfo.x * waterTextureEnabled;
  visualWakeFoamAmount = wakeInfo.y * waterTextureEnabled;
  waterWaveUv = pos.xz / waterSize + 0.5;
  reflectionCoord = reflectionTextureMatrix * vec4(pos, 1.0);
  eye = worldCameraPosition;

  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
