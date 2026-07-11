const canvas = document.getElementById('canvas');
const controlsToggleButton = document.getElementById('controls-toggle');
const controlsCloseButton = document.getElementById('controls-close');
const controlsBackdropButton = document.getElementById('controls-backdrop');
const buoyancySlider = document.getElementById('buoyancy');
const buoyancyValue = document.getElementById('buoyancy-value');
const shipBuoyancySlider = document.getElementById('ship-buoyancy');
const shipBuoyancyValue = document.getElementById('ship-buoyancy-value');
const shipSpeedSlider = document.getElementById('ship-speed');
const shipSpeedValue = document.getElementById('ship-speed-value');
const waveAmplitudeSlider = document.getElementById('wave-amplitude');
const waveAmplitudeValue = document.getElementById('wave-amplitude-value');
const waveFrequencySlider = document.getElementById('wave-frequency');
const waveFrequencyValue = document.getElementById('wave-frequency-value');
const waveSpeedSlider = document.getElementById('wave-speed');
const waveSpeedValue = document.getElementById('wave-speed-value');
const waveSharpnessSlider = document.getElementById('wave-sharpness');
const waveSharpnessValue = document.getElementById('wave-sharpness-value');
const wakeHeightSlider = document.getElementById('wake-height');
const wakeHeightValue = document.getElementById('wake-height-value');
const rippleLengthSlider = document.getElementById('ripple-length');
const rippleLengthValue = document.getElementById('ripple-length-value');
const reflectionStrengthSlider = document.getElementById('reflection-strength');
const reflectionStrengthValue = document.getElementById('reflection-strength-value');
const waterOpacitySlider = document.getElementById('water-opacity');
const waterOpacityValue = document.getElementById('water-opacity-value');
const shadowStrengthSlider = document.getElementById('shadow-strength');
const shadowStrengthValue = document.getElementById('shadow-strength-value');
const waterTextureOpacitySlider = document.getElementById('water-texture-opacity');
const waterTextureOpacityValue = document.getElementById('water-texture-opacity-value');
const waterTextureFrequencySlider = document.getElementById('water-texture-frequency');
const waterTextureFrequencyValue = document.getElementById('water-texture-frequency-value');
const toggleSphereButton = document.getElementById('toggle-sphere');
const toggleShipButton = document.getElementById('toggle-ship');
const toggleSquareButton = document.getElementById('toggle-square');
const shipModeStraightButton = document.getElementById('ship-mode-straight');
const shipModeRandomButton = document.getElementById('ship-mode-random');
const shipModeCircleButton = document.getElementById('ship-mode-circle');
const shipModeSTurnButton = document.getElementById('ship-mode-s-turn');
const shipModeGeometryButton = document.getElementById('ship-mode-geometry');
const shipModeStoppedButton = document.getElementById('ship-mode-stopped');
const qualityLowButton = document.getElementById('quality-low');
const qualityMediumButton = document.getElementById('quality-medium');
const qualityUltraButton = document.getElementById('quality-ultra');
const debugViewSelect = document.getElementById('debug-view');
const fixedStepSelect = document.getElementById('fixed-step');
const renderRateSelect = document.getElementById('render-rate');
const diagnosticFps = document.getElementById('diagnostic-fps');
const diagnosticCpu = document.getElementById('diagnostic-cpu');
const diagnosticGpu = document.getElementById('diagnostic-gpu');
const diagnosticSimulation = document.getElementById('diagnostic-simulation');
const diagnosticRenderer = document.getElementById('diagnostic-renderer');
const toggleFftWavesButton = document.getElementById('toggle-fft-waves');
const toggleWaveGeneratorButton = document.getElementById('toggle-wave-generator');
const toggleWallsButton = document.getElementById('toggle-walls');
const generatorFrequencySlider = document.getElementById('generator-frequency');
const generatorFrequencyValue = document.getElementById('generator-frequency-value');
const generatorStrengthSlider = document.getElementById('generator-strength');
const generatorStrengthValue = document.getElementById('generator-strength-value');
const generatorWidthSlider = document.getElementById('generator-width');
const generatorWidthValue = document.getElementById('generator-width-value');
const generatorRadiusSlider = document.getElementById('generator-radius');
const generatorRadiusValue = document.getElementById('generator-radius-value');
const generatorZSlider = document.getElementById('generator-z');
const generatorZValue = document.getElementById('generator-z-value');
const toggleObjectFoamButton = document.getElementById('toggle-object-foam');
const toggleWaveFoamButton = document.getElementById('toggle-wave-foam');
const toggleExtraFoamButton = document.getElementById('toggle-extra-foam');
const toggleFoamTextureButton = document.getElementById('toggle-foam-texture');
const toggleWaveCausticsButton = document.getElementById('toggle-wave-caustics');
const toggleWaterTextureButton = document.getElementById('toggle-water-texture');
const toggleWireframeButton = document.getElementById('toggle-wireframe');
const windSpeedSlider = document.getElementById('wind-speed');
const windSpeedValue = document.getElementById('wind-speed-value');
const windDirectionSlider = document.getElementById('wind-direction');
const windDirectionValue = document.getElementById('wind-direction-value');
const swellAmplitudeSlider = document.getElementById('swell-amplitude');
const swellAmplitudeValue = document.getElementById('swell-amplitude-value');
const choppinessSlider = document.getElementById('choppiness');
const choppinessValue = document.getElementById('choppiness-value');
const nearWakeLengthSlider = document.getElementById('near-wake-length');
const nearWakeLengthValue = document.getElementById('near-wake-length-value');
const farWakeLifetimeSlider = document.getElementById('far-wake-lifetime');
const farWakeLifetimeValue = document.getElementById('far-wake-lifetime-value');
const propagationSpeedSlider = document.getElementById('propagation-speed');
const propagationSpeedValue = document.getElementById('propagation-speed-value');
const viscositySlider = document.getElementById('viscosity');
const viscosityValue = document.getElementById('viscosity-value');
const foamThresholdSlider = document.getElementById('foam-threshold');
const foamThresholdValue = document.getElementById('foam-threshold-value');
const foamDecaySlider = document.getElementById('foam-decay');
const foamDecayValue = document.getElementById('foam-decay-value');
const foamAdvectionSlider = document.getElementById('foam-advection');
const foamAdvectionValue = document.getElementById('foam-advection-value');
const turbulenceSlider = document.getElementById('turbulence');
const turbulenceValue = document.getElementById('turbulence-value');
const hullImpulseSlider = document.getElementById('hull-impulse');
const hullImpulseValue = document.getElementById('hull-impulse-value');
const bowStrengthSlider = document.getElementById('bow-strength');
const bowStrengthValue = document.getElementById('bow-strength-value');
const sternTurbulenceSlider = document.getElementById('stern-turbulence');
const sternTurbulenceValue = document.getElementById('stern-turbulence-value');
const propellerWashSlider = document.getElementById('propeller-wash');
const propellerWashValue = document.getElementById('propeller-wash-value');
const waterColorInput = document.getElementById('water-color');
const absorptionColorInput = document.getElementById('absorption-color');

// Change these two values to resize the pool plane.
const waterWidth = 7.0;
const waterLength = 7.0;
const waterHalfWidth = waterWidth * 0.5;
const waterHalfLength = waterLength * 0.5;
const waterSize = new THREE.Vector2(waterWidth, waterLength);
const waterHalfSize = new THREE.Vector2(waterHalfWidth, waterHalfLength);
const vesselMovementBounds = Math.min(waterHalfWidth, waterHalfLength) * 0.98;
const maxWaterBounceObjects = 16;
const maxWaterHullMasks = 8;
let waterSimulationResolution = 512;
const waterRenderSegmentsPerUnit = 52;
const waterRenderSegmentsX = Math.max(320, Math.round(waterWidth * waterRenderSegmentsPerUnit));
const waterRenderSegmentsZ = Math.max(320, Math.round(waterLength * waterRenderSegmentsPerUnit));
const waterCausticSegmentsPerUnit = 22;
const waterCausticSegmentsX = Math.max(96, Math.round(waterWidth * waterCausticSegmentsPerUnit));
const waterCausticSegmentsZ = Math.max(96, Math.round(waterLength * waterCausticSegmentsPerUnit));
const objectPressureFieldResolution = 256;
const wakeSourceFieldResolution = 384;

const WATER_QUALITY_PRESETS = {
  low: {
    waterResolution: 256,
    foamResolution: 192,
    hullSamples: 420,
    maxSubsteps: 2,
    reflectionCadence: 4,
    causticsCadence: 4,
    pixelRatio: 1.0,
    reflectionResolution: 384,
    causticsResolution: 384,
    foamAdvectionScale: 0.58,
    farWakeLifetimeScale: 0.55,
    spectralOcean: false,
  },
  medium: {
    waterResolution: 384,
    foamResolution: 256,
    hullSamples: 900,
    maxSubsteps: 3,
    reflectionCadence: 2,
    causticsCadence: 2,
    pixelRatio: 1.5,
    reflectionResolution: 640,
    causticsResolution: 640,
    foamAdvectionScale: 0.84,
    farWakeLifetimeScale: 0.80,
    spectralOcean: true,
  },
  ultra: {
    waterResolution: 512,
    foamResolution: 384,
    hullSamples: 1600,
    maxSubsteps: 4,
    reflectionCadence: 1,
    causticsCadence: 1,
    pixelRatio: 2.0,
    reflectionResolution: 1024,
    causticsResolution: 1024,
    foamAdvectionScale: 1.0,
    farWakeLifetimeScale: 1.0,
    spectralOcean: true,
  },
};

const waterSystemConfig = {
  quality: 'ultra',
  fixedTimeStep: 1 / 60,
  maxSubsteps: WATER_QUALITY_PRESETS.ultra.maxSubsteps,
  wavePropagationSpeed: 1.0,
  viscosity: 0.08,
  foamGenerationThreshold: 0.009,
  foamDecay: 0.34,
  foamAdvectionSpeed: 0.72,
  turbulenceIntensity: 1.0,
  hullImpulseStrength: 1.0,
  bowWaveStrength: 1.0,
  sternTurbulence: 1.0,
  propellerWash: 1.0,
  nearWakeLength: 0.9,
  farWakeLifetime: 8.0,
  windSpeed: 9.0,
  windDirection: 28 * Math.PI / 180,
  swellAmplitude: 1.0,
  choppiness: 1.18,
  waterColor: new THREE.Color(0x06364c),
  absorption: new THREE.Color(0.34, 0.11, 0.055),
  maxInteractors: 16,
};

// Lower values make wake waves fade sooner. Higher values let them travel farther.
let rippleDistance = Number(rippleLengthSlider.value);
let reflectionStrength = Number(reflectionStrengthSlider.value);
let waterOpacity = Number(waterOpacitySlider.value);
let shadowStrength = Number(shadowStrengthSlider.value);
let waterTextureOpacity = Number(waterTextureOpacitySlider.value);
let waterTextureFrequency = Number(waterTextureFrequencySlider.value);
const wakeHeightRecovery = 0.994;
const maxWakeHeight = 0.24;
let oceanWaveStrength = Number(waveAmplitudeSlider.value);
let oceanWaveFrequency = Number(waveFrequencySlider.value);
let oceanWaveSpeed = Number(waveSpeedSlider.value);
let oceanWaveSharpness = Number(waveSharpnessSlider.value);
let objectWakeHeightScale = Number(wakeHeightSlider.value);
const wakeWaveStrength = 0.92;
const normalFoamHeightThreshold = 0;
const normalFoamHeightSoftness = 0.03;
const normalFoamFromHeightStrength = 1.25;
let foamHeightThreshold = normalFoamHeightThreshold;
let foamHeightSoftness = normalFoamHeightSoftness;
let foamFromHeightStrength = normalFoamFromHeightStrength;
let objectFoamEnabled = 1;
let waveFoamEnabled = 1;
let extraFoamEnabled = 1;
let foamMottleEnabled = 1;
let waterMottleEnabled = 1;
let waterImageTextureEnabled = 0;
let waterTextureEnabled = 1;
let waveCausticsEnabled = 0;
let wireframeEnabled = false;
let fftWavesEnabled = 1;
let waveGeneratorEnabled = false;
let wallsEnabled = false;
const extraFoamRippleBoost = 0.72;
let objectWaterSampleLimit = WATER_QUALITY_PRESETS.ultra.hullSamples;
const objectWaterContactPadding = 0.065;
const objectWaterMaxDepth = 0.32;
const objectWaterVelocityResponse = 18.0;
const objectWaterVelocityDecay = 4.0;
const objectWaterMinVelocity = 0.002;
const objectWaterPressureLimit = 0.16;
const objectWaterImpulseLimit = 0.075;
const objectWaterSegmentMaxLength = 1.8;
const objectWaterSegmentMaxWidth = 0.42;
const objectWaterBowPressureStrength = 0.118;
const objectWaterSidePressureStrength = 0.074;
const objectWaterSternSuctionStrength = 0.096;
const objectWaterPropWashStrength = 0.122;
const objectWaterDivergentStrength = 0.108;
const objectWaterKelvinAngle = 19.5 * Math.PI / 180;
const objectWaterFullWakeVelocity = 0.32;
const objectWaterEdgeFadeDistance = 0.24;
const waterInteractionTagShip = 'ship';
const continuousWakeSampleSpacing = 0.010;
const continuousWakeMaxFrameSamples = 18;
const wakeHistoryLifetime = 7.2;
const wakeHistoryMaxPoints = 48;
const wakeHistoryMaxFramePoints = 128;
const wakeHistoryMinSampleDistance = 0.010;
const wakeHistoryFoamStrength = 0.082;
const wakeHistoryKelvinStrength = 0.052;
const wakeHistoryCentralStrength = 0.064;
const wakeTurnSensitivity = 5.4;
const wakeEmitterSternCenter = 'stern-center';
const wakeEmitterBowLeft = 'bow-left';
const wakeEmitterBowRight = 'bow-right';
const waveEmitterTypeLine = 'line';
const waveEmitterTypePoint = 'point';
const waveEmitters = [
  {
    type: waveEmitterTypeLine,
    enabled: true,
    origin: { x: 0, z: -1.65 },
    direction: { x: 0, z: 1 },
    width: 3.2,
    samples: 15,
    frequency: 1.15,
    radius: 0.12,
    strength: 0.026,
    troughStrength: -0.016,
    troughOffset: 0.18,
    nextEmitTime: null,
  },
];
const primaryWaveEmitter = waveEmitters[0];
const shipWakeBowOffset = 0.3;
const shipWakeSternOffset = 0.28;
const shipWakeBeam = 0.18;
const shipModelYawOffset = 2*Math.PI;
const shipMovementYawOffset = Math.PI / 2;
let shipAutopilotSpeed = Number(shipSpeedSlider.value);
const shipAutopilotTurnBiasMax = 0.45;
const shipAutopilotTargetRadius = 0.12;
const shipAutopilotBounds = vesselMovementBounds;
const shipAutopilotTurnChangeMinTime = 1.8;
const shipAutopilotTurnChangeMaxTime = 3.8;
const shipAutopilotTurnSmoothness = 1.6;
const shipAutopilotHeadingSmoothness = 3.0;
const shipMovementModeRandom = 'random';
const shipMovementModeStraight = 'straight';
const shipMovementModeCircle = 'circle';
const shipMovementModeSTurn = 's-turn';
const shipMovementModeGeometry = 'geometry';
const shipMovementModeStopped = 'stopped';
const shipCircleCenter = { x: 0, z: 0 };
const shipCircleRadius = Math.min(1.35, vesselMovementBounds * 0.78);
const shipTestPathMinX = -Math.min(2.45, vesselMovementBounds * 0.86);
const shipTestPathMaxX = Math.min(2.45, vesselMovementBounds * 0.86);
const shipTestSTurnAmplitude = Math.min(0.92, vesselMovementBounds * 0.34);
const shipTestAcceleration = 0.11;
const shipYawSmoothness = 5.2;
const shipWaveTiltStart = 0.055;
const shipWaveTiltFull = 0.11;
const shipWavePitchStrength = 1.35;
const shipWaveRollStrength = 1.1;
const shipWaveTiltSmoothness = 4.5;
const shipWaveMaxPitch = 0.22;
const shipWaveMaxRoll = 0.18;
const shipVerticalFollowMin = 0.35;
const shipVerticalFollowMax = 14.0;
const shipVerticalHeaveMin = 0.08;
const shipVerticalHeaveMax = 1.25;
const maxSimulationDelta = 1 / 30;

// Colors
const black = new THREE.Color('black');
const white = new THREE.Color('white');
const causticObjectShaders = [];
let currentObjectWaterTexture = null;
let currentObjectCausticsTexture = null;

function setControlsOpen(isOpen) {
  document.body.classList.toggle('controls-open', isOpen);
  controlsToggleButton.setAttribute('aria-expanded', String(isOpen));
}

controlsToggleButton.addEventListener('click', () => {
  setControlsOpen(!document.body.classList.contains('controls-open'));
});

controlsCloseButton.addEventListener('click', () => {
  setControlsOpen(false);
});

controlsBackdropButton.addEventListener('click', () => {
  setControlsOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setControlsOpen(false);
  }
});

function loadFile(filename) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
}

// Shader chunks
loadFile('shaders/utils.glsl').then((utils) => {
  THREE.ShaderChunk['utils'] = utils;

  // Create Renderer
  const initialCanvasWidth = Math.max(1, canvas.clientWidth || window.innerWidth);
  const initialCanvasHeight = Math.max(1, canvas.clientHeight || window.innerHeight);
  const camera = new THREE.PerspectiveCamera(45, initialCanvasWidth / initialCanvasHeight, 0.01, 100);
  const cameraTarget = new THREE.Vector3(0, -0.12, 0);
  const cameraOffset = new THREE.Vector3();
  const cameraSpherical = new THREE.Spherical();
  const minCameraDistance = 1.25;
  const maxCameraDistance = 9.0;
  camera.position.set(0, 1.75, -5.25);
  camera.lookAt(cameraTarget);
  cameraSpherical.setFromVector3(camera.position.clone().sub(cameraTarget));

  function updateCameraFromOrbit() {
    cameraSpherical.radius = Math.min(maxCameraDistance, Math.max(minCameraDistance, cameraSpherical.radius));
    cameraOffset.setFromSpherical(cameraSpherical);
    camera.position.copy(cameraTarget).add(cameraOffset);
    camera.lookAt(cameraTarget);
  }

  const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
  let rendererPixelRatioCap = WATER_QUALITY_PRESETS[waterSystemConfig.quality].pixelRatio;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, rendererPixelRatioCap));
  renderer.setSize(initialCanvasWidth, initialCanvasHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false;
  renderer.info.autoReset = false;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const gl = renderer.getContext();
  const isWebGL2 = renderer.capabilities.isWebGL2 === true;
  const runtimeCapabilities = {
    renderer: isWebGL2 ? 'WebGL2' : 'WebGL1',
    webgpu: false,
    floatColorBuffer: isWebGL2
      ? Boolean(gl.getExtension('EXT_color_buffer_float'))
      : Boolean(gl.getExtension('WEBGL_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')),
    floatLinearFiltering: Boolean(
      gl.getExtension('OES_texture_float_linear') ||
      gl.getExtension('OES_texture_half_float_linear') ||
      isWebGL2
    ),
    timerQuery: Boolean(
      gl.getExtension(isWebGL2 ? 'EXT_disjoint_timer_query_webgl2' : 'EXT_disjoint_timer_query')
    ),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
  };

  function resizeRendererToCanvas() {
    const displayWidth = Math.max(1, canvas.clientWidth);
    const displayHeight = Math.max(1, canvas.clientHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, rendererPixelRatioCap);
    const renderWidth = Math.floor(displayWidth * pixelRatio);
    const renderHeight = Math.floor(displayHeight * pixelRatio);

    if (canvas.width === renderWidth && canvas.height === renderHeight) return;

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(displayWidth, displayHeight, false);
    camera.aspect = displayWidth / displayHeight;
    camera.updateProjectionMatrix();
    reflectionCamera.aspect = camera.aspect;
    reflectionCamera.updateProjectionMatrix();
  }

  const reflectionCamera = new THREE.PerspectiveCamera(camera.fov, camera.aspect, camera.near, camera.far);
  const reflectionTarget = new THREE.WebGLRenderTarget(1024, 1024, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
  const reflectionTextureMatrix = new THREE.Matrix4();
  const reflectionViewPosition = new THREE.Vector3();
  const reflectionViewDirection = new THREE.Vector3();
  const reflectionTargetPoint = new THREE.Vector3();
  const reflectionTextureTransform = new THREE.Matrix4().set(
    0.5, 0.0, 0.0, 0.5,
    0.0, 0.5, 0.0, 0.5,
    0.0, 0.0, 0.5, 0.5,
    0.0, 0.0, 0.0, 1.0
  );

  const objectScene = new THREE.Scene();
  const waterBounceBounds = new THREE.Box3();
  const waterBounceRectValues = Array.from({ length: maxWaterBounceObjects }, () => new THREE.Vector4());
  const waterHullMaskValues = Array.from({ length: maxWaterHullMasks }, () => new THREE.Vector4());
  const waterHullMaskSizes = Array.from({ length: maxWaterHullMasks }, () => new THREE.Vector4());
  let waterBounceRectCount = 0;
  let waterHullMaskCount = 0;
  const objectPressureFieldData = new Float32Array(objectPressureFieldResolution * objectPressureFieldResolution * 4);
  const objectPressureTexture = new THREE.DataTexture(
    objectPressureFieldData,
    objectPressureFieldResolution,
    objectPressureFieldResolution,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  objectPressureTexture.minFilter = THREE.NearestFilter;
  objectPressureTexture.magFilter = THREE.NearestFilter;
  objectPressureTexture.needsUpdate = true;
  const wakeSourceFieldData = new Uint8Array(wakeSourceFieldResolution * wakeSourceFieldResolution * 4);
  const wakeSourceTexture = new THREE.DataTexture(
    wakeSourceFieldData,
    wakeSourceFieldResolution,
    wakeSourceFieldResolution,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  wakeSourceTexture.minFilter = THREE.LinearFilter;
  wakeSourceTexture.magFilter = THREE.LinearFilter;
  wakeSourceTexture.generateMipmaps = false;
  wakeSourceTexture.needsUpdate = true;
  const objectWaterInteractions = [];
  const objectWaterVertex = new THREE.Vector3();
  const objectWaterPosition = new THREE.Vector3();
  const objectWaterPreviousPosition = new THREE.Vector3();
  const objectWaterPropellerPosition = new THREE.Vector3();
  const objectWaterSamples = [];
  const waterInteractorBounds = new THREE.Box3();
  const waterInteractorSize = new THREE.Vector3();

  function registerWaterBounceObject(object) {
    object.userData.waterBounce = true;
  }

  function tagWaterObject(object, tag) {
    const tags = Array.isArray(object.userData.tags)
      ? object.userData.tags
      : typeof object.userData.tags === 'string'
        ? object.userData.tags.split(/[\s,]+/).filter(Boolean)
        : [];
    if (!tags.includes(tag)) {
      object.userData.tags = [...tags, tag];
    }
  }

  function hasWaterObjectTag(root, tag) {
    let tagged = false;

    root.traverse((object) => {
      if (tagged) return;
      const tags = object.userData.tags;
      tagged = object.userData.waterInteractionTag === tag ||
        object.userData.tag === tag ||
        (Array.isArray(tags) && tags.includes(tag)) ||
        (typeof tags === 'string' && tags.split(/[\s,]+/).includes(tag));
    });

    return tagged;
  }

  function getWaterInteractionTag(root, options) {
    if (options.tag) return options.tag;
    if (root.userData.waterInteractionTag) return root.userData.waterInteractionTag;
    if (hasWaterObjectTag(root, waterInteractionTagShip)) {
      return waterInteractionTagShip;
    }
    return 'object';
  }

  function registerWaterHullMask(object, options = {}) {
    object.userData.waterHullMask = {
      bow: options.bow || shipWakeBowOffset,
      stern: options.stern || shipWakeSternOffset,
      beam: options.beam || shipWakeBeam,
      headingYawOffset: options.headingYawOffset || 0,
      beamScale: options.beamScale || 0.62,
      padding: options.padding || 0.004,
      softness: options.softness || 0.008,
    };
  }

  function isVisibleInHierarchy(object) {
    let current = object;

    while (current) {
      if (!current.visible) return false;
      current = current.parent;
    }

    return true;
  }

  function rebuildObjectWaterSamples(interaction) {
    interaction.samples.length = 0;
    interaction.collisionMesh.updateMatrixWorld(true);
    interaction.collisionMesh.traverse((mesh) => {
      if (
        !mesh.isMesh ||
        mesh.userData.ignoreWaterReaction ||
        !mesh.geometry ||
        !mesh.geometry.attributes ||
        !mesh.geometry.attributes.position
      ) {
        return;
      }

      const position = mesh.geometry.attributes.position;
      const stride = Math.max(1, Math.floor(position.count / interaction.sampleLimit));

      for (let i = 0; i < position.count; i += stride) {
        interaction.samples.push({
          mesh,
          position: new THREE.Vector3().fromBufferAttribute(position, i),
        });
      }
    });
  }

  function registerObjectWaterInteraction(root, options = {}) {
    if (objectWaterInteractions.length >= waterSystemConfig.maxInteractors) {
      console.warn('Maximum active water interactors reached.');
      return null;
    }

    root.getWorldPosition(objectWaterPosition);
    const tag = getWaterInteractionTag(root, options);
    const isShip = tag === waterInteractionTagShip;
    if (isShip && !root.userData.waterHullMask) {
      const hullLength = options.maxWakeLength || shipWakeBowOffset + shipWakeSternOffset;
      registerWaterHullMask(root, {
        bow: options.bow || hullLength * 0.52,
        stern: options.stern || hullLength * 0.48,
        beam: options.maxWakeBeam || shipWakeBeam,
        headingYawOffset: options.headingYawOffset || 0,
      });
    }
    const interaction = {
      root,
      collisionMesh: options.collisionMesh || root,
      tag,
      isShip,
      objectType: options.objectType || (isShip ? 'displacementShip' : 'object'),
      previousPosition: objectWaterPosition.clone(),
      velocityX: 0,
      velocityZ: 0,
      previousVelocityX: 0,
      previousVelocityZ: 0,
      accelerationX: 0,
      accelerationZ: 0,
      angularVelocity: 0,
      previousYaw: root.rotation.y,
      lateralVelocity: 0,
      requestedSampleLimit: options.sampleLimit || WATER_QUALITY_PRESETS.ultra.hullSamples,
      sampleLimit: Math.min(
        options.sampleLimit || WATER_QUALITY_PRESETS.ultra.hullSamples,
        objectWaterSampleLimit
      ),
      strengthScale: options.strengthScale === undefined ? 1 : options.strengthScale,
      radiusScale: options.radiusScale === undefined ? 1 : options.radiusScale,
      maxWakeLength: options.maxWakeLength || null,
      maxWakeBeam: options.maxWakeBeam || null,
      headingYawOffset: options.headingYawOffset || 0,
      draft: options.draft || 0.02,
      displacedVolume: options.displacedVolume || 0.001,
      propellerPoints: options.propellerPoints || [],
      turbulenceStrength: options.turbulenceStrength === undefined ? 1 : options.turbulenceStrength,
      wakeStrength: options.wakeStrength === undefined ? 1 : options.wakeStrength,
      wakeShape: options.wakeShape || (isShip ? 'ship' : 'blunt'),
      motorWake: isShip && options.motorWake !== false,
      hasWakeDirection: false,
      wakeDirectionX: 0,
      wakeDirectionZ: 1,
      wakeTurnAmount: 0,
      wakeHistory: [],
      lastWakeHistoryByType: {},
      samples: [],
    };

    rebuildObjectWaterSamples(interaction);
    objectWaterInteractions.push(interaction);
    interaction.dispose = () => unregisterWaterInteractor(interaction);
    interaction.rebuildSamples = () => rebuildObjectWaterSamples(interaction);
    return interaction;
  }

  function unregisterWaterInteractor(target) {
    const index = objectWaterInteractions.findIndex((interaction) =>
      interaction === target || interaction.root === target
    );
    if (index === -1) return false;

    const [interaction] = objectWaterInteractions.splice(index, 1);
    interaction.wakeHistory.length = 0;
    interaction.lastWakeHistoryByType = {};
    return true;
  }

  function registerWaterInteractor(config) {
    if (!config || !config.object) {
      throw new Error('registerWaterInteractor requires an object.');
    }

    const object = config.object;
    const collisionMesh = config.collisionMesh || object;
    const tags = Array.isArray(config.tags) ? config.tags : [];
    tags.forEach((tag) => tagWaterObject(object, tag));

    collisionMesh.updateMatrixWorld(true);
    waterInteractorBounds.setFromObject(collisionMesh);
    waterInteractorBounds.getSize(waterInteractorSize);
    const derivedLength = Math.max(0.01, waterInteractorSize.x, waterInteractorSize.z);
    const derivedBeam = Math.max(0.01, Math.min(waterInteractorSize.x, waterInteractorSize.z));
    const draft = config.draft === undefined
      ? Math.max(0.006, waterInteractorSize.y * 0.32)
      : config.draft;
    const objectType = config.objectType || (hasWaterObjectTag(object, waterInteractionTagShip) ? 'displacementShip' : 'object');
    const isShipProfile = objectType === 'containerShip' ||
      objectType === 'displacementShip' ||
      objectType === 'planingBoat';

    if (isShipProfile) tagWaterObject(object, waterInteractionTagShip);

    return registerObjectWaterInteraction(object, {
      collisionMesh,
      objectType,
      tag: isShipProfile ? waterInteractionTagShip : config.tag,
      sampleLimit: config.sampleCount || objectWaterSampleLimit,
      radiusScale: config.radiusScale,
      strengthScale: config.wakeStrength,
      maxWakeLength: config.maxWakeLength || derivedLength,
      maxWakeBeam: config.maxWakeBeam || derivedBeam,
      headingYawOffset: config.headingYawOffset || 0,
      draft,
      displacedVolume: config.displacedVolume || derivedLength * derivedBeam * draft * (isShipProfile ? 0.58 : 0.72),
      propellerPoints: config.propellerPoints || [],
      turbulenceStrength: config.turbulenceStrength,
      wakeStrength: config.wakeStrength,
      wakeShape: isShipProfile ? 'ship' : config.wakeShape || 'passive',
      motorWake: isShipProfile && config.motorWake !== false,
      bow: config.bow,
      stern: config.stern,
    });
  }

  window.registerWaterInteractor = registerWaterInteractor;
  window.waterLab = {
    capabilities: runtimeCapabilities,
    config: waterSystemConfig,
    qualityPresets: WATER_QUALITY_PRESETS,
    worldSizeMeters: { x: waterWidth, z: waterLength },
    registerWaterInteractor,
    unregisterWaterInteractor,
  };

  function worldXToWaterUv(value) {
    return value / waterWidth + 0.5;
  }

  function worldZToWaterUv(value) {
    return value / waterLength + 0.5;
  }

  function getWaterEdgeFade(x, z) {
    const edgeDistance = Math.min(waterHalfWidth - Math.abs(x), waterHalfLength - Math.abs(z));
    return smoothStep(0.0, objectWaterEdgeFadeDistance, edgeDistance);
  }

  function updateWaterBounceRects() {
    let count = 0;
    let hullCount = 0;

    objectScene.traverse((object) => {
      if (object.userData.waterHullMask && isVisibleInHierarchy(object) && hullCount < maxWaterHullMasks) {
        const mask = object.userData.waterHullMask;
        object.getWorldPosition(objectWaterPosition);

        const heading = object.rotation.y - mask.headingYawOffset;
        const directionX = Math.sin(heading);
        const directionZ = Math.cos(heading);
        const bow = Math.max(0.001, mask.bow + mask.padding);
        const stern = Math.max(0.001, mask.stern + mask.padding);
        const halfBeam = Math.max(0.001, mask.beam * 0.5 * mask.beamScale + mask.padding);

        waterHullMaskValues[hullCount].set(
          objectWaterPosition.x,
          objectWaterPosition.z,
          directionX,
          directionZ
        );
        waterHullMaskSizes[hullCount].set(
          bow,
          stern,
          halfBeam,
          Math.max(0.001, mask.softness)
        );
        hullCount++;
      }

      if (!object.userData.waterBounce || !isVisibleInHierarchy(object) || count >= maxWaterBounceObjects) return;

      waterBounceBounds.setFromObject(object);
      const minX = Math.max(-waterHalfWidth, waterBounceBounds.min.x);
      const maxX = Math.min(waterHalfWidth, waterBounceBounds.max.x);
      const minZ = Math.max(-waterHalfLength, waterBounceBounds.min.z);
      const maxZ = Math.min(waterHalfLength, waterBounceBounds.max.z);

      if (minX >= maxX || minZ >= maxZ) return;

      waterBounceRectValues[count].set(
        worldXToWaterUv(minX),
        worldZToWaterUv(minZ),
        worldXToWaterUv(maxX),
        worldZToWaterUv(maxZ)
      );
      count++;
    });

    waterBounceRectCount = count;
    waterHullMaskCount = hullCount;

    if (waterSimulation && waterSimulation._updateMesh) {
      waterSimulation._updateMesh.material.uniforms['waterBounceCount'].value = count;
      waterSimulation._updateMesh.material.uniforms['waterBounceRects'].value = waterBounceRectValues;
      waterSimulation._updateMesh.material.uniforms['waterHullMaskCount'].value = hullCount;
      waterSimulation._updateMesh.material.uniforms['waterHullMaskValues'].value = waterHullMaskValues;
      waterSimulation._updateMesh.material.uniforms['waterHullMaskSizes'].value = waterHullMaskSizes;
    }

    if (waterSimulation && waterSimulation._normalMesh) {
      waterSimulation._normalMesh.material.uniforms['waterBounceCount'].value = count;
      waterSimulation._normalMesh.material.uniforms['waterBounceRects'].value = waterBounceRectValues;
      waterSimulation._normalMesh.material.uniforms['waterHullMaskCount'].value = hullCount;
      waterSimulation._normalMesh.material.uniforms['waterHullMaskValues'].value = waterHullMaskValues;
      waterSimulation._normalMesh.material.uniforms['waterHullMaskSizes'].value = waterHullMaskSizes;
    }
  }

  // Light direction
  const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

  const objectAmbient = new THREE.AmbientLight(0xffffff, 0.3);
  const objectLight = new THREE.DirectionalLight(0xffffff, 0.6);
  objectLight.position.set(light[0], light[1], light[2]);
  objectLight.castShadow = true;
  objectLight.shadow.mapSize.set(1024, 1024);
  objectLight.shadow.camera.left = -waterHalfWidth;
  objectLight.shadow.camera.right = waterHalfWidth;
  objectLight.shadow.camera.top = waterHalfLength;
  objectLight.shadow.camera.bottom = -waterHalfLength;
  objectLight.shadow.camera.near = 0.1;
  objectLight.shadow.camera.far = 6;
  objectLight.shadow.bias = -0.0004;
  objectScene.add(objectAmbient);
  objectScene.add(objectLight);

  function addUnderwaterCaustics(material, options = {}) {
    if (!material) return;

    if (Array.isArray(material)) {
      material.forEach((item) => addUnderwaterCaustics(item, options));
      return;
    }

    if (material.userData.hasUnderwaterCaustics) return;

    const previousBeforeCompile = material.onBeforeCompile;
    material.userData.hasUnderwaterCaustics = true;
    material.onBeforeCompile = (shader) => {
      if (previousBeforeCompile) {
        previousBeforeCompile(shader);
      }

      shader.uniforms.objectWaterTexture = { value: currentObjectWaterTexture };
      shader.uniforms.objectCausticsTexture = { value: currentObjectCausticsTexture };
      shader.uniforms.objectWaterSize = { value: waterSize };
      shader.uniforms.objectCausticLight = { value: new THREE.Vector3(light[0], light[1], light[2]) };
      shader.uniforms.objectCausticTime = { value: 0 };
      shader.uniforms.objectOceanWaveStrength = { value: oceanWaveStrength * waterSystemConfig.swellAmplitude };
      shader.uniforms.objectOceanWaveFrequency = { value: oceanWaveFrequency };
      shader.uniforms.objectOceanWaveSpeed = { value: oceanWaveSpeed };
      shader.uniforms.objectOceanWaveSharpness = { value: oceanWaveSharpness };
      shader.uniforms.objectOceanWindDirection = { value: new THREE.Vector2(
        Math.cos(waterSystemConfig.windDirection),
        Math.sin(waterSystemConfig.windDirection)
      ) };
      shader.uniforms.objectOceanWindSpeed = { value: waterSystemConfig.windSpeed };
      shader.uniforms.objectFftWavesEnabled = { value: fftWavesEnabled };
      shader.uniforms.objectWaveCausticsEnabled = { value: waveCausticsEnabled };
      shader.uniforms.objectWaterBounceCount = { value: waterBounceRectCount };
      shader.uniforms.objectWaterBounceRects = { value: waterBounceRectValues };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vObjectWorldPosition;'
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvec4 objectWorldPosition = modelMatrix * vec4(transformed, 1.0);\nvObjectWorldPosition = objectWorldPosition.xyz;'
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        [
          '#include <common>',
          'uniform sampler2D objectWaterTexture;',
          'uniform sampler2D objectCausticsTexture;',
          'uniform vec2 objectWaterSize;',
          'uniform vec3 objectCausticLight;',
          'uniform float objectCausticTime;',
          'uniform float objectOceanWaveStrength;',
          'uniform float objectOceanWaveFrequency;',
          'uniform float objectOceanWaveSpeed;',
          'uniform float objectOceanWaveSharpness;',
          'uniform vec2 objectOceanWindDirection;',
          'uniform float objectOceanWindSpeed;',
          'uniform float objectFftWavesEnabled;',
          'uniform float objectWaveCausticsEnabled;',
          'uniform float objectWaterBounceCount;',
          'uniform vec4 objectWaterBounceRects[16];',
          'varying vec3 vObjectWorldPosition;',
          'struct ObjectCausticOceanWave { vec2 direction; float frequency; float speed; float amplitude; float steepness; };',
          'vec2 objectCausticOrientToWind(vec2 direction) { vec2 wind = normalize(objectOceanWindDirection); return normalize(vec2(direction.x * wind.x - direction.y * wind.y, direction.x * wind.y + direction.y * wind.x)); }',
          'float objectCausticWindEnergy() { return clamp(objectOceanWindSpeed / 9.0, 0.35, 1.85); }',
          'float objectCausticStormAmount() { return smoothstep(0.08, 0.12, objectOceanWaveStrength); }',
          'float objectCausticSharpenCrest(float crest, float storm) { float positiveCrest = max(crest, 0.0); float negativeCrest = max(-crest, 0.0); return crest + pow(positiveCrest, 3.0) * storm * 0.85 * objectOceanWaveSharpness - pow(negativeCrest, 2.0) * storm * 0.16 * objectOceanWaveSharpness; }',
          'float objectCausticGerstnerHeight(vec2 point, ObjectCausticOceanWave wave) { vec2 direction = objectCausticOrientToWind(wave.direction); float phase = dot(point, direction) * wave.frequency * objectOceanWaveFrequency + objectCausticTime * wave.speed * objectOceanWaveSpeed; return objectCausticSharpenCrest(sin(phase), objectCausticStormAmount()) * wave.amplitude; }',
          'float objectCausticGerstnerOceanHeight(vec2 point) { float height = 0.0; height += objectCausticGerstnerHeight(point, ObjectCausticOceanWave(vec2(1.0, 0.24), 4.2, 0.85, 0.55, 0.62)); height += objectCausticGerstnerHeight(point, ObjectCausticOceanWave(vec2(0.82, 0.55), 6.8, 1.22, 0.32, 0.48)); height += objectCausticGerstnerHeight(point, ObjectCausticOceanWave(vec2(-0.35, 1.0), 10.5, 1.85, 0.18, 0.34)); height += objectCausticGerstnerHeight(point, ObjectCausticOceanWave(vec2(0.2, 1.0), 17.0, 2.65, 0.08, 0.22)); height += objectCausticGerstnerHeight(point, ObjectCausticOceanWave(vec2(-1.0, 0.15), 24.0, 3.4, 0.045, 0.18)); return height * objectOceanWaveStrength * objectCausticWindEnergy(); }',
          'float objectCausticSpectralWaveHeight(vec2 point, vec2 direction, float frequency, float speed, float amplitude, float phase) { vec2 waveDirection = objectCausticOrientToWind(direction); float angle = dot(point, waveDirection) * frequency * objectOceanWaveFrequency + objectCausticTime * speed * objectOceanWaveSpeed + phase; return sin(angle) * amplitude; }',
          'float objectCausticSpectralOceanHeight(vec2 point) { float height = 0.0; height += objectCausticSpectralWaveHeight(point, vec2(1.00, 0.18), 2.60, 0.56, 0.42, 0.30); height += objectCausticSpectralWaveHeight(point, vec2(0.92, 0.38), 3.70, 0.72, 0.32, 2.10); height += objectCausticSpectralWaveHeight(point, vec2(0.72, 0.70), 5.20, 0.96, 0.24, 4.50); height += objectCausticSpectralWaveHeight(point, vec2(0.36, 0.94), 6.80, 1.15, 0.18, 1.40); height += objectCausticSpectralWaveHeight(point, vec2(-0.10, 1.00), 8.60, 1.42, 0.14, 5.30); height += objectCausticSpectralWaveHeight(point, vec2(-0.42, 0.91), 10.80, 1.68, 0.105, 0.80); height += objectCausticSpectralWaveHeight(point, vec2(0.58, -0.82), 12.60, 1.94, 0.080, 3.70); height += objectCausticSpectralWaveHeight(point, vec2(-0.74, 0.66), 15.20, 2.22, 0.060, 2.80); height += objectCausticSpectralWaveHeight(point, vec2(0.98, -0.22), 18.50, 2.55, 0.045, 5.90); height += objectCausticSpectralWaveHeight(point, vec2(-0.88, -0.48), 21.00, 2.88, 0.034, 1.90); height += objectCausticSpectralWaveHeight(point, vec2(0.18, 0.98), 24.80, 3.25, 0.026, 4.10); height += objectCausticSpectralWaveHeight(point, vec2(-0.26, 0.96), 29.50, 3.68, 0.020, 0.55); height += objectCausticSpectralWaveHeight(point, vec2(0.64, 0.77), 34.00, 4.05, 0.016, 3.20); height += objectCausticSpectralWaveHeight(point, vec2(-0.56, 0.83), 40.00, 4.52, 0.012, 5.05); height += objectCausticSpectralWaveHeight(point, vec2(0.86, 0.50), 48.00, 5.10, 0.009, 2.45); height += objectCausticSpectralWaveHeight(point, vec2(-0.98, 0.18), 56.00, 5.75, 0.007, 4.85); return height * objectOceanWaveStrength * objectCausticWindEnergy(); }',
          'float objectCausticOceanHeight(vec2 point) { return mix(objectCausticGerstnerOceanHeight(point), objectCausticSpectralOceanHeight(point), objectFftWavesEnabled); }',
          'float objectCausticWaterBounceMask(vec2 point) { vec2 uv = point / objectWaterSize + 0.5; float blocked = 0.0; for (int i = 0; i < 16; i++) { if (float(i) >= objectWaterBounceCount) { break; } vec4 rect = objectWaterBounceRects[i]; float inside = step(rect.x, uv.x) * step(uv.x, rect.z) * step(rect.y, uv.y) * step(uv.y, rect.w); blocked = max(blocked, inside); } return blocked; }',
        ].join('\n')
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        [
          '#include <color_fragment>',
          'vec2 objectWaterUv = vObjectWorldPosition.xz / objectWaterSize + 0.5;',
          'float objectWaterLevel = texture2D(objectWaterTexture, objectWaterUv).r + objectCausticOceanHeight(vObjectWorldPosition.xz) * objectWaveCausticsEnabled * (1.0 - objectCausticWaterBounceMask(vObjectWorldPosition.xz));',
          'float objectUnderwater = smoothstep(objectWaterLevel + 0.02, objectWaterLevel - 0.02, vObjectWorldPosition.y);',
          'vec3 objectRefractedLight = -refract(-normalize(objectCausticLight), vec3(0.0, 1.0, 0.0), 1.0 / 1.333);',
          'vec2 objectCausticsUv = 0.75 * (vObjectWorldPosition.xz - vObjectWorldPosition.y * objectRefractedLight.xz / objectRefractedLight.y) / objectWaterSize + 0.5;',
          'vec4 objectCaustic = texture2D(objectCausticsTexture, objectCausticsUv);',
          'float objectCausticStrength = objectCaustic.r * objectCaustic.g;',
          'diffuseColor.rgb *= 1.0 + objectUnderwater * objectCausticStrength * 1.15;',
          options.tintSubmerged
            ? 'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.03, 0.42, 0.62), objectUnderwater * 0.35);'
            : '',
        ].filter(Boolean).join('\n')
      );

      causticObjectShaders.push(shader);
    };
    material.needsUpdate = true;
  }

  function updateObjectCausticUniforms(waterTexture, causticsTexture, time) {
    currentObjectWaterTexture = waterTexture;
    currentObjectCausticsTexture = causticsTexture;

    causticObjectShaders.forEach((shader) => {
      shader.uniforms.objectWaterTexture.value = waterTexture;
      shader.uniforms.objectCausticsTexture.value = causticsTexture;
      shader.uniforms.objectCausticTime.value = time;
      shader.uniforms.objectOceanWaveStrength.value = oceanWaveStrength * waterSystemConfig.swellAmplitude;
      shader.uniforms.objectOceanWaveFrequency.value = oceanWaveFrequency;
      shader.uniforms.objectOceanWaveSpeed.value = oceanWaveSpeed;
      shader.uniforms.objectOceanWaveSharpness.value = oceanWaveSharpness;
      shader.uniforms.objectOceanWindDirection.value.set(
        Math.cos(waterSystemConfig.windDirection),
        Math.sin(waterSystemConfig.windDirection)
      );
      shader.uniforms.objectOceanWindSpeed.value = waterSystemConfig.windSpeed;
      shader.uniforms.objectFftWavesEnabled.value = fftWavesEnabled;
      shader.uniforms.objectWaveCausticsEnabled.value = waveCausticsEnabled;
      shader.uniforms.objectWaterBounceCount.value = waterBounceRectCount;
      shader.uniforms.objectWaterBounceRects.value = waterBounceRectValues;
    });
  }

  // Ray caster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let draggedVessel = null;
  let draggedVesselOffset = { x: 0, z: 0 };
  let isRotatingPool = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  const targetgeometry = new THREE.PlaneGeometry(waterWidth, waterLength);
  for (let vertex of targetgeometry.vertices) {
    vertex.z = - vertex.y;
    vertex.y = 0.;
  }
  const targetmesh = new THREE.Mesh(targetgeometry);

  function updateMouse(event) {
    const rect = canvas.getBoundingClientRect();

    mouse.x = (event.clientX - rect.left) * 2 / rect.width - 1;
    mouse.y = - (event.clientY - rect.top) * 2 / rect.height + 1;
  }

  function getPointerWaterPoint(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(targetmesh);
    return intersects.length > 0 ? intersects[0].point : null;
  }

  // Textures
  const cubetextureloader = new THREE.CubeTextureLoader();

  const textureCube = cubetextureloader.load([
    'old_img/xpos.jpg', 'old_img/xneg.jpg',
    'old_img/ypos.jpg', 'old_img/ypos.jpg',
    'old_img/zpos.jpg', 'old_img/zneg.jpg',
  ]);

  const textureloader = new THREE.TextureLoader();

  const tiles = textureloader.load('tiles.jpg');
  const waterImageTexture = textureloader.load('images/textures/water.jpg');
  waterImageTexture.wrapS = THREE.RepeatWrapping;
  waterImageTexture.wrapT = THREE.RepeatWrapping;
  waterImageTexture.minFilter = THREE.LinearFilter;
  waterImageTexture.magFilter = THREE.LinearFilter;
  const foamImageTexture = textureloader.load('images/textures/foam.jpg');
  foamImageTexture.wrapS = THREE.ClampToEdgeWrapping;
  foamImageTexture.wrapT = THREE.ClampToEdgeWrapping;
  foamImageTexture.minFilter = THREE.LinearFilter;
  foamImageTexture.magFilter = THREE.LinearFilter;
  foamImageTexture.generateMipmaps = false;

  class WaterSimulation {

    constructor(resolution = waterSimulationResolution) {
      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

      this._geometry = new THREE.PlaneBufferGeometry(2, 2);
      this.resolution = resolution;
      this._createTargets();

      const shadersPromises = [
        loadFile('shaders/simulation/vertex.glsl'),
        loadFile('shaders/simulation/normal_fragment.glsl'),
        loadFile('shaders/simulation/update_fragment.glsl'),
      ];

      this.loaded = Promise.all(shadersPromises)
          .then(([vertexShader, normalFragmentShader, updateFragmentShader]) => {
        const normalMaterial = new THREE.RawShaderMaterial({
          uniforms: {
              delta: { value: [1 / this.resolution, 1 / this.resolution] },
              waterTexelSize: { value: [waterWidth / this.resolution, waterLength / this.resolution] },
              waterSize: { value: waterSize },
              waterBounceCount: { value: 0 },
              waterBounceRects: { value: waterBounceRectValues },
              waterHullMaskCount: { value: 0 },
              waterHullMaskValues: { value: waterHullMaskValues },
              waterHullMaskSizes: { value: waterHullMaskSizes },
              texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: normalFragmentShader,
        });

        const updateMaterial = new THREE.RawShaderMaterial({
          uniforms: {
              delta: { value: [1 / this.resolution, 1 / this.resolution] },
              rippleDistance: { value: rippleDistance },
              wakeHeightRecovery: { value: wakeHeightRecovery },
              maxWakeHeight: { value: maxWakeHeight },
              timeStep: { value: waterSystemConfig.fixedTimeStep },
              wavePropagationSpeed: { value: waterSystemConfig.wavePropagationSpeed },
              viscosity: { value: waterSystemConfig.viscosity },
              waterSize: { value: waterSize },
              waterBounceCount: { value: 0 },
              waterBounceRects: { value: waterBounceRectValues },
              waterHullMaskCount: { value: 0 },
              waterHullMaskValues: { value: waterHullMaskValues },
              waterHullMaskSizes: { value: waterHullMaskSizes },
              objectPressureTexture: { value: objectPressureTexture },
              texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: updateFragmentShader,
        });

        this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
        this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
      });
    }

    _createTarget() {
      const linearFilter = runtimeCapabilities.floatLinearFiltering ? THREE.LinearFilter : THREE.NearestFilter;
      return new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        minFilter: linearFilter,
        magFilter: linearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      });
    }

    _createTargets() {
      this._textureA = this._createTarget();
      this._textureB = this._createTarget();
      this.texture = this._textureA;
    }

    setResolution(renderer, resolution) {
      if (resolution === this.resolution) return;

      this._textureA.dispose();
      this._textureB.dispose();
      this.resolution = resolution;
      waterSimulationResolution = resolution;
      this._createTargets();

      if (this._normalMesh) {
        this._normalMesh.material.uniforms['delta'].value = [1 / resolution, 1 / resolution];
        this._normalMesh.material.uniforms['waterTexelSize'].value = [
          waterWidth / resolution,
          waterLength / resolution,
        ];
        this._updateMesh.material.uniforms['delta'].value = [1 / resolution, 1 / resolution];
      }

      this.clear(renderer);
    }

    clear(renderer) {
      const previousTarget = renderer.getRenderTarget();
      const previousColor = renderer.getClearColor(new THREE.Color()).clone();
      const previousAlpha = renderer.getClearAlpha();
      renderer.setClearColor(black, 0);

      renderer.setRenderTarget(this._textureA);
      renderer.clear();
      renderer.setRenderTarget(this._textureB);
      renderer.clear();

      renderer.setRenderTarget(previousTarget);
      renderer.setClearColor(previousColor, previousAlpha);
      this.texture = this._textureA;
    }

    stepSimulation(renderer, timeStep = waterSystemConfig.fixedTimeStep) {
      this._updateMesh.material.uniforms['rippleDistance'].value = rippleDistance;
      this._updateMesh.material.uniforms['timeStep'].value = timeStep;
      this._updateMesh.material.uniforms['wavePropagationSpeed'].value = waterSystemConfig.wavePropagationSpeed;
      this._updateMesh.material.uniforms['viscosity'].value = waterSystemConfig.viscosity;
      this._render(renderer, this._updateMesh);
    }

    updateNormals(renderer) {
      this._render(renderer, this._normalMesh);
    }

    _render(renderer, mesh) {
      // Swap textures
      const oldTexture = this.texture;
      const newTexture = this.texture === this._textureA ? this._textureB : this._textureA;

      mesh.material.uniforms['texture'].value = oldTexture.texture;

      renderer.setRenderTarget(newTexture);

      // TODO Camera is useless here, what should be done?
      renderer.render(mesh, this._camera);

      this.texture = newTexture;
    }

  }


  class FoamSimulation {

    constructor(resolution = WATER_QUALITY_PRESETS[waterSystemConfig.quality].foamResolution) {
      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);
      this._geometry = new THREE.PlaneBufferGeometry(2, 2);
      this.resolution = resolution;
      this._createTargets();

      const shadersPromises = [
        loadFile('shaders/simulation/vertex.glsl'),
        loadFile('shaders/simulation/foam_update_fragment.glsl'),
      ];

      this.loaded = Promise.all(shadersPromises).then(([vertexShader, fragmentShader]) => {
        this._material = new THREE.RawShaderMaterial({
          uniforms: {
            foamTexture: { value: null },
            waterTexture: { value: null },
            wakeSourceTexture: { value: wakeSourceTexture },
            delta: { value: [1 / this.resolution, 1 / this.resolution] },
            waterDelta: { value: [1 / waterSimulationResolution, 1 / waterSimulationResolution] },
            waterSize: { value: waterSize },
            timeStep: { value: waterSystemConfig.fixedTimeStep },
            time: { value: 0 },
            foamDecay: { value: waterSystemConfig.foamDecay },
            farWakeLifetime: { value: waterSystemConfig.farWakeLifetime },
            foamAdvectionSpeed: { value: waterSystemConfig.foamAdvectionSpeed },
            foamGenerationThreshold: { value: waterSystemConfig.foamGenerationThreshold },
            turbulenceIntensity: { value: waterSystemConfig.turbulenceIntensity },
            diffusion: { value: waterSystemConfig.viscosity },
          },
          vertexShader,
          fragmentShader,
        });
        this._mesh = new THREE.Mesh(this._geometry, this._material);
      });
    }

    _createTarget() {
      const linearFilter = runtimeCapabilities.floatLinearFiltering ? THREE.LinearFilter : THREE.NearestFilter;
      return new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        minFilter: linearFilter,
        magFilter: linearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      });
    }

    _createTargets() {
      this._textureA = this._createTarget();
      this._textureB = this._createTarget();
      this.texture = this._textureA;
    }

    setResolution(renderer, resolution) {
      if (resolution === this.resolution) return;
      this._textureA.dispose();
      this._textureB.dispose();
      this.resolution = resolution;
      this._createTargets();

      if (this._material) {
        this._material.uniforms['delta'].value = [1 / resolution, 1 / resolution];
      }
      this.clear(renderer);
    }

    clear(renderer) {
      const previousTarget = renderer.getRenderTarget();
      const previousColor = renderer.getClearColor(new THREE.Color()).clone();
      const previousAlpha = renderer.getClearAlpha();
      renderer.setClearColor(black, 0);

      renderer.setRenderTarget(this._textureA);
      renderer.clear();
      renderer.setRenderTarget(this._textureB);
      renderer.clear();

      renderer.setRenderTarget(previousTarget);
      renderer.setClearColor(previousColor, previousAlpha);
      this.texture = this._textureA;
    }

    step(renderer, waterTexture, sourceTexture, time, timeStep) {
      if (!this._material) return;

      this._material.uniforms['waterTexture'].value = waterTexture;
      this._material.uniforms['wakeSourceTexture'].value = sourceTexture;
      this._material.uniforms['waterDelta'].value = [1 / waterSimulationResolution, 1 / waterSimulationResolution];
      this._material.uniforms['timeStep'].value = timeStep;
      this._material.uniforms['time'].value = time;
      this._material.uniforms['foamDecay'].value = waterSystemConfig.foamDecay;
      const qualityPreset = WATER_QUALITY_PRESETS[waterSystemConfig.quality];
      this._material.uniforms['farWakeLifetime'].value =
        waterSystemConfig.farWakeLifetime * qualityPreset.farWakeLifetimeScale;
      this._material.uniforms['foamAdvectionSpeed'].value =
        waterSystemConfig.foamAdvectionSpeed * qualityPreset.foamAdvectionScale;
      this._material.uniforms['foamGenerationThreshold'].value = waterSystemConfig.foamGenerationThreshold;
      this._material.uniforms['turbulenceIntensity'].value = waterSystemConfig.turbulenceIntensity;
      this._material.uniforms['diffusion'].value = waterSystemConfig.viscosity;
      this._render(renderer);
    }

    _render(renderer) {
      const oldTexture = this.texture;
      const newTexture = oldTexture === this._textureA ? this._textureB : this._textureA;
      this._material.uniforms['foamTexture'].value = oldTexture.texture;
      renderer.setRenderTarget(newTexture);
      renderer.render(this._mesh, this._camera);
      this.texture = newTexture;
    }

  }


  class WaterHeightProbe {

    constructor() {
      this.maxSamples = 8;
      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);
      this._geometry = new THREE.PlaneBufferGeometry(2, 2);
      this._sampleUvs = Array.from({ length: this.maxSamples }, () => new THREE.Vector2(0.5, 0.5));
      this._pixels = new Float32Array(this.maxSamples * 4);
      this._target = new THREE.WebGLRenderTarget(this.maxSamples, 1, {
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
      });

      this.loaded = Promise.all([
        loadFile('shaders/simulation/vertex.glsl'),
        loadFile('shaders/simulation/probe_fragment.glsl'),
      ]).then(([vertexShader, fragmentShader]) => {
        this._material = new THREE.RawShaderMaterial({
          uniforms: {
            texture: { value: null },
            sampleUv: { value: this._sampleUvs },
            sampleCount: { value: 0 },
          },
          vertexShader,
          fragmentShader,
        });
        this._mesh = new THREE.Mesh(this._geometry, this._material);
      });
    }

    sample(renderer, waterTexture, points) {
      const sampleCount = Math.min(points.length, this.maxSamples);
      for (let i = 0; i < sampleCount; i++) {
        this._sampleUvs[i].set(
          worldXToWaterUv(points[i].x),
          worldZToWaterUv(points[i].z)
        );
      }

      this._material.uniforms['texture'].value = waterTexture;
      this._material.uniforms['sampleCount'].value = sampleCount;
      const previousTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(this._target);
      renderer.render(this._mesh, this._camera);

      try {
        renderer.readRenderTargetPixels(this._target, 0, 0, this.maxSamples, 1, this._pixels);
      } catch (error) {
        this._pixels.fill(0);
      }
      renderer.setRenderTarget(previousTarget);

      const heights = [];
      for (let i = 0; i < sampleCount; i++) {
        heights.push(this._pixels[i * 4]);
      }
      return heights;
    }

  }


  class Caustics {

    constructor(lightFrontGeometry) {
      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

      this._geometry = lightFrontGeometry;

      this.texture = new THREE.WebGLRenderTarget(1024, 1024, {type: THREE.UNSIGNED_BYTE});

      const shadersPromises = [
        loadFile('shaders/caustics/vertex.glsl'),
        loadFile('shaders/caustics/fragment.glsl')
      ];

      this.loaded = Promise.all(shadersPromises)
          .then(([vertexShader, fragmentShader]) => {
        const material = new THREE.RawShaderMaterial({
          uniforms: {
              light: { value: light },
              water: { value: null },
              waterSize: { value: waterSize },
              poolHalfSize: { value: waterHalfSize },
              time: { value: 0 },
              oceanWaveStrength: { value: oceanWaveStrength * waterSystemConfig.swellAmplitude },
              oceanWaveFrequency: { value: oceanWaveFrequency },
              oceanWaveSpeed: { value: oceanWaveSpeed },
              oceanWaveSharpness: { value: oceanWaveSharpness },
              oceanWindDirection: { value: new THREE.Vector2(
                Math.cos(waterSystemConfig.windDirection),
                Math.sin(waterSystemConfig.windDirection)
              ) },
              oceanWindSpeed: { value: waterSystemConfig.windSpeed },
              oceanChoppiness: { value: waterSystemConfig.choppiness },
              fftWavesEnabled: { value: fftWavesEnabled },
              waveCausticsEnabled: { value: waveCausticsEnabled },
              waterBounceCount: { value: 0 },
              waterBounceRects: { value: waterBounceRectValues },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });

        this._causticMesh = new THREE.Mesh(this._geometry, material);
      });
    }

    update(renderer, waterTexture, time) {
      this._causticMesh.material.uniforms['water'].value = waterTexture;
      this._causticMesh.material.uniforms['time'].value = time;
      this._causticMesh.material.uniforms['oceanWaveStrength'].value = oceanWaveStrength * waterSystemConfig.swellAmplitude;
      this._causticMesh.material.uniforms['oceanWaveFrequency'].value = oceanWaveFrequency;
      this._causticMesh.material.uniforms['oceanWaveSpeed'].value = oceanWaveSpeed;
      this._causticMesh.material.uniforms['oceanWaveSharpness'].value = oceanWaveSharpness;
      this._causticMesh.material.uniforms['oceanWindDirection'].value.set(
        Math.cos(waterSystemConfig.windDirection),
        Math.sin(waterSystemConfig.windDirection)
      );
      this._causticMesh.material.uniforms['oceanWindSpeed'].value = waterSystemConfig.windSpeed;
      this._causticMesh.material.uniforms['oceanChoppiness'].value = waterSystemConfig.choppiness;
      this._causticMesh.material.uniforms['fftWavesEnabled'].value = fftWavesEnabled;
      this._causticMesh.material.uniforms['waveCausticsEnabled'].value = waveCausticsEnabled;
      this._causticMesh.material.uniforms['waterBounceCount'].value = waterBounceRectCount;
      this._causticMesh.material.uniforms['waterBounceRects'].value = waterBounceRectValues;

      renderer.setRenderTarget(this.texture);
      renderer.setClearColor(black, 0);
      renderer.clear();

      // TODO Camera is useless here, what should be done?
      renderer.render(this._causticMesh, this._camera);
    }

    setResolution(resolution) {
      this.texture.setSize(resolution, resolution);
    }

  }


  class Water {

    constructor() {
      this.geometry = new THREE.PlaneBufferGeometry(waterWidth, waterLength, waterRenderSegmentsX, waterRenderSegmentsZ);
      this.causticGeometry = new THREE.PlaneBufferGeometry(waterWidth, waterLength, waterCausticSegmentsX, waterCausticSegmentsZ);

      const shadersPromises = [
        loadFile('shaders/water/vertex.glsl'),
        loadFile('shaders/water/fragment.glsl')
      ];

      this.loaded = Promise.all(shadersPromises)
          .then(([vertexShader, fragmentShader]) => {
        this.material = new THREE.RawShaderMaterial({
          uniforms: {
              light: { value: light },
              tiles: { value: tiles },
              sky: { value: textureCube },
              water: { value: null },
              waterImageTexture: { value: waterImageTexture },
              foamImageTexture: { value: foamImageTexture },
              shipWakeFoamTexture: { value: null },
              causticTex: { value: null },
              poolHalfSize: { value: waterHalfSize },
              reflectionTexture: { value: reflectionTarget.texture },
              reflectionTextureMatrix: { value: reflectionTextureMatrix },
              reflectionStrength: { value: reflectionStrength },
              waterOpacity: { value: waterOpacity },
              waterBodyColor: { value: waterSystemConfig.waterColor.clone() },
              waterAbsorptionColor: { value: waterSystemConfig.absorption.clone() },
              waterTextureOpacity: { value: waterTextureOpacity },
              waterTextureFrequency: { value: waterTextureFrequency },
              worldCameraPosition: { value: camera.position.clone() },
              time: { value: 0 },
              oceanWaveStrength: { value: oceanWaveStrength * waterSystemConfig.swellAmplitude },
              oceanWaveFrequency: { value: oceanWaveFrequency },
              oceanWaveSpeed: { value: oceanWaveSpeed },
              oceanWaveSharpness: { value: oceanWaveSharpness },
              oceanWindDirection: { value: new THREE.Vector2(
                Math.cos(waterSystemConfig.windDirection),
                Math.sin(waterSystemConfig.windDirection)
              ) },
              oceanWindSpeed: { value: waterSystemConfig.windSpeed },
              oceanChoppiness: { value: waterSystemConfig.choppiness },
              fftWavesEnabled: { value: fftWavesEnabled },
              wakeWaveStrength: { value: wakeWaveStrength },
              waterTextureEnabled: { value: waterTextureEnabled },
              waterImageTextureEnabled: { value: waterImageTextureEnabled },
              waterSize: { value: waterSize },
              waterTexel: { value: 1 / waterSimulationResolution },
              waterBounceCount: { value: 0 },
              waterBounceRects: { value: waterBounceRectValues },
              waterHullMaskCount: { value: 0 },
              waterHullMaskValues: { value: waterHullMaskValues },
              waterHullMaskSizes: { value: waterHullMaskSizes },
              foamHeightThreshold: { value: foamHeightThreshold },
              foamHeightSoftness: { value: foamHeightSoftness },
              foamFromHeightStrength: { value: foamFromHeightStrength },
              objectFoamEnabled: { value: objectFoamEnabled },
              waveFoamEnabled: { value: waveFoamEnabled },
              extraFoamEnabled: { value: extraFoamEnabled },
              foamMottleEnabled: { value: foamMottleEnabled },
              waterMottleEnabled: { value: waterMottleEnabled },
              extraFoamRippleBoost: { value: extraFoamRippleBoost },
              underwater: { value: false },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          transparent: true,
          depthWrite: false,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.frustumCulled = false;
      });
    }

    draw(renderer, waterTexture, foamTexture, causticsTexture, time) {
      this.material.uniforms['water'].value = waterTexture;
      this.material.uniforms['shipWakeFoamTexture'].value = foamTexture;
      this.material.uniforms['causticTex'].value = causticsTexture;
      this.material.uniforms['worldCameraPosition'].value.copy(camera.position);
      this.material.uniforms['time'].value = time;
      this.material.uniforms['oceanWindDirection'].value.set(
        Math.cos(waterSystemConfig.windDirection),
        Math.sin(waterSystemConfig.windDirection)
      );
      this.material.uniforms['oceanWindSpeed'].value = waterSystemConfig.windSpeed;
      this.material.uniforms['oceanChoppiness'].value = waterSystemConfig.choppiness;
      this.material.uniforms['waterBounceCount'].value = waterBounceRectCount;
      this.material.uniforms['waterBounceRects'].value = waterBounceRectValues;
      this.material.uniforms['waterHullMaskCount'].value = waterHullMaskCount;
      this.material.uniforms['waterHullMaskValues'].value = waterHullMaskValues;
      this.material.uniforms['waterHullMaskSizes'].value = waterHullMaskSizes;

      const underwaterView = camera.position.y < 0;
      this.material.side = underwaterView ? THREE.FrontSide : THREE.BackSide;
      this.material.uniforms['underwater'].value = underwaterView;
      renderer.render(this.mesh, camera);
    }

  }

  function updateReflectionTexture() {
    reflectionViewPosition.copy(camera.position);
    reflectionViewPosition.y *= -1;

    camera.getWorldDirection(reflectionViewDirection);
    reflectionViewDirection.y *= -1;
    reflectionTargetPoint.copy(reflectionViewPosition).add(reflectionViewDirection);

    reflectionCamera.position.copy(reflectionViewPosition);
    reflectionCamera.up.copy(camera.up);
    reflectionCamera.up.y *= -1;
    reflectionCamera.lookAt(reflectionTargetPoint);
    reflectionCamera.updateMatrixWorld();
    reflectionCamera.projectionMatrix.copy(camera.projectionMatrix);

    reflectionTextureMatrix.copy(reflectionTextureTransform);
    reflectionTextureMatrix.multiply(reflectionCamera.projectionMatrix);
    reflectionTextureMatrix.multiply(reflectionCamera.matrixWorldInverse);

    renderer.setRenderTarget(reflectionTarget);
    renderer.setClearColor(black, 0);
    renderer.clear();
    renderer.render(objectScene, reflectionCamera);
  }


  class Pool {

    constructor() {
      this._geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        -waterHalfWidth, 1, -waterHalfLength,
        -waterHalfWidth, 1, waterHalfLength,
        waterHalfWidth, 1, -waterHalfLength,
        waterHalfWidth, 1, waterHalfLength
      ]);
      const indices = new Uint32Array([
        0, 1, 2,
        2, 1, 3
      ]);

      this._geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      this._geometry.setIndex(new THREE.BufferAttribute(indices, 1));

      const shadersPromises = [
        loadFile('shaders/pool/vertex.glsl'),
        loadFile('shaders/pool/fragment.glsl')
      ];

      this.loaded = Promise.all(shadersPromises)
          .then(([vertexShader, fragmentShader]) => {
        this._material = new THREE.RawShaderMaterial({
          uniforms: {
              light: { value: light },
              tiles: { value: tiles },
              water: { value: null },
              causticTex: { value: null },
              poolHalfSize: { value: waterHalfSize },
              time: { value: 0 },
              oceanWaveStrength: { value: oceanWaveStrength * waterSystemConfig.swellAmplitude },
              oceanWaveFrequency: { value: oceanWaveFrequency },
              oceanWaveSpeed: { value: oceanWaveSpeed },
              oceanWaveSharpness: { value: oceanWaveSharpness },
              fftWavesEnabled: { value: fftWavesEnabled },
              waveCausticsEnabled: { value: waveCausticsEnabled },
              waterBounceCount: { value: 0 },
              waterBounceRects: { value: waterBounceRectValues },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });
        this._material.side = THREE.FrontSide;

        this._mesh = new THREE.Mesh(this._geometry, this._material);
      });
    }

    draw(renderer, waterTexture, causticsTexture, time) {
      this._material.uniforms['water'].value = waterTexture;
      this._material.uniforms['causticTex'].value = causticsTexture;
      this._material.uniforms['time'].value = time;
      this._material.uniforms['oceanWaveStrength'].value = oceanWaveStrength * waterSystemConfig.swellAmplitude;
      this._material.uniforms['oceanWaveFrequency'].value = oceanWaveFrequency;
      this._material.uniforms['oceanWaveSpeed'].value = oceanWaveSpeed;
      this._material.uniforms['oceanWaveSharpness'].value = oceanWaveSharpness;
      this._material.uniforms['fftWavesEnabled'].value = fftWavesEnabled;
      this._material.uniforms['waveCausticsEnabled'].value = waveCausticsEnabled;
      this._material.uniforms['waterBounceCount'].value = waterBounceRectCount;
      this._material.uniforms['waterBounceRects'].value = waterBounceRectValues;

      renderer.render(this._mesh, camera);
    }

  }


  class WaterVolume {

    constructor() {
      this._geometry = new THREE.BufferGeometry();

      const vertices = new Float32Array([
        -waterHalfWidth, -1, -waterHalfLength,
        -waterHalfWidth, 0, -waterHalfLength,
        waterHalfWidth, -1, -waterHalfLength,
        waterHalfWidth, 0, -waterHalfLength,
        waterHalfWidth, -1, -waterHalfLength,
        waterHalfWidth, 0, -waterHalfLength,
        waterHalfWidth, -1, waterHalfLength,
        waterHalfWidth, 0, waterHalfLength,
        waterHalfWidth, -1, waterHalfLength,
        waterHalfWidth, 0, waterHalfLength,
        -waterHalfWidth, -1, waterHalfLength,
        -waterHalfWidth, 0, waterHalfLength,
        -waterHalfWidth, -1, waterHalfLength,
        -waterHalfWidth, 0, waterHalfLength,
        -waterHalfWidth, -1, -waterHalfLength,
        -waterHalfWidth, 0, -waterHalfLength
      ]);
      const indices = new Uint16Array([
        0, 1, 2,
        2, 1, 3,
        4, 5, 6,
        6, 5, 7,
        8, 9, 10,
        10, 9, 11,
        12, 13, 14,
        14, 13, 15
      ]);

      this._geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      this._geometry.setIndex(new THREE.BufferAttribute(indices, 1));

      this._material = new THREE.MeshPhongMaterial({
        color: 0x2aa8d8,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      this._mesh = new THREE.Mesh(this._geometry, this._material);
    }

    draw(renderer) {
      renderer.render(this._mesh, camera);
    }

  }


  class BoundaryWalls {

    constructor() {
      this.group = new THREE.Group();
      const wallHeight = 0.5;
      const wallThickness = 0.12;
      const wallY = wallHeight * 0.5 - 0.05;
      const material = new THREE.MeshPhongMaterial({
        color: 0xb8c1c5,
        shininess: 18,
        specular: 0x333333,
      });
      addUnderwaterCaustics(material);

      const longWallGeometry = new THREE.BoxBufferGeometry(waterWidth + wallThickness * 2, wallHeight, wallThickness);
      const sideWallGeometry = new THREE.BoxBufferGeometry(wallThickness, wallHeight, waterLength);

      const northWall = new THREE.Mesh(longWallGeometry, material);
      northWall.position.set(0, wallY, -waterHalfLength - wallThickness * 0.5);
      const southWall = new THREE.Mesh(longWallGeometry, material);
      southWall.position.set(0, wallY, waterHalfLength + wallThickness * 0.5);
      const eastWall = new THREE.Mesh(sideWallGeometry, material);
      eastWall.position.set(waterHalfWidth + wallThickness * 0.5, wallY, 0);
      const westWall = new THREE.Mesh(sideWallGeometry, material);
      westWall.position.set(-waterHalfWidth - wallThickness * 0.5, wallY, 0);

      [northWall, southWall, eastWall, westWall].forEach((wall) => {
        wall.castShadow = true;
        wall.receiveShadow = true;
      });

      this.group.add(northWall, southWall, eastWall, westWall);
      objectScene.add(this.group);
      registerWaterBounceObject(northWall);
      registerWaterBounceObject(southWall);
      registerWaterBounceObject(eastWall);
      registerWaterBounceObject(westWall);
    }

    draw(renderer) {
      renderer.render(this.group, camera);
    }

    setVisible(visible) {
      this.group.visible = visible;
      this.group.traverse((child) => {
        child.visible = visible;
      });
    }

  }

  class FloorShadowReceiver {

    constructor() {
      const geometry = new THREE.PlaneBufferGeometry(waterWidth, waterLength);
      const material = new THREE.ShadowMaterial({
        color: 0x061016,
        opacity: shadowStrength,
        transparent: true,
        depthWrite: false,
      });

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.rotation.x = -Math.PI / 2;
      this.mesh.position.y = -0.998;
      this.mesh.receiveShadow = true;
      objectScene.add(this.mesh);
    }

    setStrength(value) {
      this.mesh.material.opacity = value;
    }

  }


  class FloatingSquare {

    constructor() {
      this.visible = false;
      this.size = 0.42;
      this.thickness = 0.08;
      this.floatOffset = this.thickness * 0.28;

      const geometry = new THREE.BoxBufferGeometry(this.size, this.thickness, this.size);
      const material = new THREE.MeshPhongMaterial({
        color: 0x3f8f9d,
        shininess: 32,
        specular: 0x1d3940,
      });
      addUnderwaterCaustics(material, { tintSubmerged: true });

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.position.set(0.55, this.floatOffset, -0.42);
      this.mesh.visible = this.visible;
      objectScene.add(this.mesh);
      registerWaterBounceObject(this.mesh);
      registerWaterInteractor({
        object: this.mesh,
        objectType: 'cube',
        draft: this.thickness * 0.5,
        displacedVolume: this.size * this.size * this.thickness * 0.5,
        sampleCount: 260,
        radiusScale: 1.05,
        wakeStrength: 0.82,
        maxWakeLength: this.size,
        maxWakeBeam: this.size,
        wakeShape: 'passive',
      });
    }

    setVisible(visible) {
      this.visible = visible;
      this.mesh.visible = visible;
    }

    clampToPool() {
      this.mesh.position.x = clampPoolX(this.mesh.position.x);
      this.mesh.position.z = clampPoolZ(this.mesh.position.z);
      this.mesh.updateMatrixWorld();
    }

    moveToWaterPoint(point) {
      this.mesh.position.x = point.x;
      this.mesh.position.z = point.z;
      this.clampToPool();
    }

    update(time) {
      if (!this.visible) return;

      const waterHeight = getOceanHeightAt(this.mesh.position.x, this.mesh.position.z, time);
      this.mesh.position.y = waterHeight + this.floatOffset;
      this.mesh.updateMatrixWorld();
    }

  }


class FloatingSphere {

    constructor() {
      this.radius = 0.09;
      this.visible = true;
      this.buoyancy = Number(buoyancySlider.value);
      this.velocity = 0;
      this.waterLevel = 0;
      this.floorLevel = -1 + this.radius;

      const geometry = new THREE.SphereBufferGeometry(this.radius, 48, 24);
      const material = new THREE.MeshPhongMaterial({
        color: 0xff6b35,
        shininess: 45,
        specular: 0x442211,
      });
      addUnderwaterCaustics(material, { tintSubmerged: true });

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.position.set(-0.5, this.radius * 0.25, 0.3);
      objectScene.add(this.mesh);
      registerWaterInteractor({
        object: this.mesh,
        objectType: 'sphere',
        draft: this.radius,
        displacedVolume: 4 / 3 * Math.PI * Math.pow(this.radius, 3) * 0.5,
        sampleCount: 320,
        radiusScale: 1.25,
        wakeStrength: 0.78,
        maxWakeLength: this.radius * 2,
        maxWakeBeam: this.radius * 2,
        wakeShape: 'passive',
      });
    }

    setVisible(visible) {
      this.visible = visible;
      this.mesh.visible = visible;
    }

    setBuoyancy(value) {
      this.buoyancy = value;
    }

    clampToPool() {
      this.mesh.position.x = clampPoolX(this.mesh.position.x);
      this.mesh.position.z = clampPoolZ(this.mesh.position.z);
      this.mesh.updateMatrixWorld();
    }

    moveToWaterPoint(point) {
      this.mesh.position.x = point.x;
      this.mesh.position.z = point.z;
      this.clampToPool();
    }

    update(waterLevel) {
      this.waterLevel = waterLevel;

      if (draggedVessel === this) {
        this.velocity = 0;
        this.clampToPool();
        return;
      }

      const bottom = this.mesh.position.y - this.radius;
      const submergedDepth = Math.min(Math.max(this.waterLevel - bottom, 0), this.radius * 2);
      const submergedRatio = submergedDepth / (this.radius * 2);
      const gravity = -0.0035;
      const buoyancyForce = this.buoyancy * submergedRatio * 0.007;

      this.velocity += gravity + buoyancyForce;
      this.velocity *= 0.985;
      this.mesh.position.y += this.velocity;

      if (this.mesh.position.y < this.floorLevel) {
        this.mesh.position.y = this.floorLevel;
        this.velocity = Math.max(0, this.velocity * -0.2);
      }

      const maxHeight = this.waterLevel + this.radius * 1.2;
      if (this.mesh.position.y > maxHeight) {
        this.mesh.position.y = maxHeight;
        this.velocity = Math.min(0, this.velocity);
      }

      this.clampToPool();
    }

    draw(renderer) {
      renderer.render(objectScene, camera);
    }

  }


  class CargoShip {

    constructor() {
      this.visible = true;
      this.waterLevel = 0;
      this.draft = 0.008;
      this.buoyancy = Number(shipBuoyancySlider.value);
      this.floatY = 0;
      this.needsFloatReset = true;
      this.targetYaw = 0;
      this.previousUpdateTime = null;
      this.wavePitch = 0;
      this.waveRoll = 0;
      this.wakeDirection = null;
      this.wakeTurnAmount = 0;
      this.waterInteraction = null;
      this.wakeExtents = {
        bow: shipWakeBowOffset,
        stern: shipWakeSternOffset,
        beam: shipWakeBeam,
      };
      this.group = new THREE.Group();
      tagWaterObject(this.group, waterInteractionTagShip);
      this.modelRoot = new THREE.Group();
      this.group.add(this.modelRoot);
      this.group.position.set(-0.5, 0, 0.15);
      this.floatY = this.group.position.y;

      const dragGeometry = new THREE.BoxBufferGeometry(0.56, 0.18, 0.22);
      const dragMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      this.dragTarget = new THREE.Mesh(dragGeometry, dragMaterial);
      this.dragTarget.position.y = 0.08;
      this.dragTarget.userData.ignoreWaterReaction = true;
      this.group.add(this.dragTarget);

      objectScene.add(this.group);
      registerWaterHullMask(this.group, {
        bow: this.wakeExtents.bow,
        stern: this.wakeExtents.stern,
        beam: this.wakeExtents.beam,
        headingYawOffset: shipMovementYawOffset,
      });

      this.loaded = new Promise((resolve) => {
        if (!THREE.GLTFLoader) {
          console.error('THREE.GLTFLoader is not available.');
          resolve();
          return;
        }

        const loader = new THREE.GLTFLoader();
        loader.load('models/cargo_03.glb', (gltf) => {
          const model = gltf.scene;
          const originalBox = new THREE.Box3().setFromObject(model);
          const originalSize = originalBox.getSize(new THREE.Vector3());
          const maxDeckSize = Math.max(originalSize.x, originalSize.z);
          const scale = 0.1;

          model.scale.setScalar(scale);
          this.modelRoot.add(model);

          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.x -= center.x;
          model.position.z -= center.z;
          model.position.y -= box.min.y;
          model.rotation.y = shipModelYawOffset;
          model.updateMatrixWorld(true);
          this.group.updateMatrixWorld(true);
          this.buildWakeEmitters(model);
          registerWaterHullMask(this.group, {
            bow: this.wakeExtents.bow,
            stern: this.wakeExtents.stern,
            beam: this.wakeExtents.beam,
            headingYawOffset: shipMovementYawOffset,
          });
          this.resizeDragTarget();
          this.waterInteraction = registerWaterInteractor({
            object: this.group,
            collisionMesh: this.modelRoot,
            objectType: 'containerShip',
            tags: [waterInteractionTagShip],
            draft: this.draft,
            displacedVolume: (this.wakeExtents.bow + this.wakeExtents.stern) * this.wakeExtents.beam * this.draft * 0.58,
            sampleCount: WATER_QUALITY_PRESETS.ultra.hullSamples,
            radiusScale: 1.0,
            wakeStrength: 1.18,
            turbulenceStrength: 1.12,
            maxWakeLength: this.wakeExtents.bow + this.wakeExtents.stern,
            maxWakeBeam: this.wakeExtents.beam,
            headingYawOffset: shipMovementYawOffset,
            motorWake: true,
            propellerPoints: [{ x: -this.wakeExtents.stern * 0.86, y: 0.01, z: 0 }],
          });

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              addUnderwaterCaustics(child.material, { tintSubmerged: true });
            }
          });
          this.update(0, 0);
          this.requestFloatReset();
          resolve();
        }, undefined, (error) => {
          console.error('Could not load cargo_ship_01.glb', error);
          resolve();
        });
      });
    }

    setVisible(visible) {
      this.visible = visible;
      this.group.visible = visible;
    }

    setBuoyancy(value) {
      this.buoyancy = value;
    }

    requestFloatReset() {
      this.needsFloatReset = true;
    }

    resizeDragTarget() {
      this.dragTarget.scale.set(
        Math.max(0.35, this.wakeExtents.beam * 3.2),
        1,
        Math.max(0.35, (this.wakeExtents.bow + this.wakeExtents.stern) * 1.25)
      );
    }

    collectFootprintPoints(model) {
      const points = [];
      const vertex = new THREE.Vector3();

      this.group.updateMatrixWorld(true);
      model.updateMatrixWorld(true);

      model.traverse((child) => {
        if (!child.isMesh || !child.geometry || !child.geometry.attributes || !child.geometry.attributes.position) {
          return;
        }

        const position = child.geometry.attributes.position;
        const stride = Math.max(1, Math.floor(position.count / 2500));

        for (let i = 0; i < position.count; i += stride) {
          vertex.fromBufferAttribute(position, i);
          child.localToWorld(vertex);
          this.group.worldToLocal(vertex);
          points.push({
            x: vertex.x,
            y: vertex.y,
            z: vertex.z,
          });
        }
      });

      return points;
    }

    buildWakeEmitters(model) {
      const points = this.collectFootprintPoints(model);

      if (points.length === 0) return;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      let minZ = Infinity;
      let maxZ = -Infinity;

      for (const point of points) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
        minZ = Math.min(minZ, point.z);
        maxZ = Math.max(maxZ, point.z);
      }

      const sizeX = maxX - minX;
      const sizeZ = maxZ - minZ;
      const forwardAxis = sizeX > sizeZ ? 'x' : 'z';
      const sideAxis = forwardAxis === 'x' ? 'z' : 'x';
      const lowerCutoff = minY + (maxY - minY) * 0.62;
      const footprintPoints = points.filter((point) => point.y <= lowerCutoff);
      const usablePoints = footprintPoints.length > 16 ? footprintPoints : points;
      const forwardValues = usablePoints.map((point) => point[forwardAxis]);
      const sideValues = usablePoints.map((point) => point[sideAxis]);
      const forwardMin = Math.min(...forwardValues);
      const forwardMax = Math.max(...forwardValues);
      const sideMin = Math.min(...sideValues);
      const sideMax = Math.max(...sideValues);
      const beam = Math.max(0.001, sideMax - sideMin);
      const centerForward = (forwardMin + forwardMax) * 0.5;

      this.wakeExtents = {
        bow: Math.max(shipWakeBowOffset * 0.5, forwardMax - centerForward),
        stern: Math.max(shipWakeSternOffset * 0.5, centerForward - forwardMin),
        beam: Math.max(shipWakeBeam * 0.5, beam),
      };
    }

    clampToPool() {
      this.group.position.x = clampPoolX(this.group.position.x);
      this.group.position.z = clampPoolZ(this.group.position.z);
      this.group.updateMatrixWorld();
    }

    moveToWaterPoint(point) {
      const dx = point.x - this.group.position.x;
      const dz = point.z - this.group.position.z;

      if (Math.sqrt(dx * dx + dz * dz) > 0.001) {
        this.targetYaw = Math.atan2(dx, dz) + shipMovementYawOffset;
      }

      this.group.position.x = point.x;
      this.group.position.z = point.z;
      this.clampToPool();
    }

    update(waterSamples, time) {
      const samples = typeof waterSamples === 'number'
        ? { center: waterSamples, bow: waterSamples, stern: waterSamples, left: waterSamples, right: waterSamples }
        : waterSamples;

      this.waterLevel = samples.center;
      const previousTime = this.previousUpdateTime === null ? time : this.previousUpdateTime;
      const deltaTime = Math.min(0.05, Math.max(0, time - previousTime));
      const yawBlend = 1 - Math.exp(-deltaTime * shipYawSmoothness);
      const yawDelta = shortestAngleDelta(this.group.rotation.y, this.targetYaw);
      const tiltBlend = 1 - Math.exp(-deltaTime * shipWaveTiltSmoothness);
      const waveTiltAmount = smoothStep(shipWaveTiltStart, shipWaveTiltFull, oceanWaveStrength);
      const length = Math.max(0.001, this.wakeExtents.bow + this.wakeExtents.stern);
      const beam = Math.max(0.001, this.wakeExtents.beam);
      const followAmount = clamp(this.buoyancy / 2, 0, 1);
      const heaveAmount = shipVerticalHeaveMin + (shipVerticalHeaveMax - shipVerticalHeaveMin) * followAmount;
      const targetY = this.waterLevel * heaveAmount - this.draft;
      const targetPitch = clamp((samples.bow - samples.stern) / length * shipWavePitchStrength, -shipWaveMaxPitch, shipWaveMaxPitch) * waveTiltAmount * heaveAmount;
      const targetRoll = clamp((samples.right - samples.left) / beam * shipWaveRollStrength, -shipWaveMaxRoll, shipWaveMaxRoll) * waveTiltAmount * heaveAmount;
      const fakeRockAmount = 1 - waveTiltAmount;
      const followSpeed = shipVerticalFollowMin + (shipVerticalFollowMax - shipVerticalFollowMin) * followAmount;
      const verticalBlend = 1 - Math.exp(-deltaTime * followSpeed);

      this.previousUpdateTime = time;
      if (this.needsFloatReset) {
        this.floatY = targetY;
        this.wavePitch = targetPitch;
        this.waveRoll = targetRoll;
        this.needsFloatReset = false;
      } else {
        this.floatY += (targetY - this.floatY) * verticalBlend;
      }

      this.wavePitch += (targetPitch - this.wavePitch) * tiltBlend;
      this.waveRoll += (targetRoll - this.waveRoll) * tiltBlend;
      this.group.position.y = this.floatY + Math.sin(time * 2.0) * 0.0015 * fakeRockAmount;
      this.group.rotation.y += yawDelta * yawBlend;
      this.modelRoot.rotation.x = this.wavePitch + Math.sin(time * 1.2 + this.group.position.z * 3.0) * 0.02 * fakeRockAmount;
      this.modelRoot.rotation.z = this.waveRoll + Math.sin(time * 1.4 + this.group.position.x * 2.6) * 0.014 * fakeRockAmount;
    }

  }


  class Debug {

    constructor() {
      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 1);
      this._geometry = new THREE.PlaneBufferGeometry();

      const shadersPromises = [
        loadFile('shaders/debug/vertex.glsl'),
        loadFile('shaders/debug/fragment.glsl')
      ];

      this.loaded = Promise.all(shadersPromises)
          .then(([vertexShader, fragmentShader]) => {
        this._material = new THREE.RawShaderMaterial({
          uniforms: {
              texture: { value: null },
              mode: { value: 0 },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });

        this._mesh = new THREE.Mesh(this._geometry, this._material);
      });
    }

    draw(renderer, texture, mode) {
      this._material.uniforms['texture'].value = texture;
      this._material.uniforms['mode'].value = mode;

      renderer.setRenderTarget(null);
      renderer.render(this._mesh, this._camera);
    }

  }

  const waterSimulation = new WaterSimulation();
  const foamSimulation = new FoamSimulation();
  const waterHeightProbe = new WaterHeightProbe();
  const water = new Water();
  const caustics = new Caustics(water.causticGeometry);
  const pool = new Pool();
  const floorShadowReceiver = new FloorShadowReceiver();
  const waterVolume = new WaterVolume();
  const boundaryWalls = new BoundaryWalls();
  const floatingSquare = new FloatingSquare();
  const floatingSphere = new FloatingSphere();
  const cargoShip = new CargoShip();
  boundaryWalls.setVisible(wallsEnabled);
  floatingSphere.setVisible(false);
  let shipMovementMode = shipMovementModeRandom;
  let shipAutoTarget = null;
  let shipAutoLastTime = null;
  let shipAutoNextTurnTime = 0;
  let shipAutoTurnBias = 0;
  let shipAutoTargetTurnBias = 0;
  let shipAutoTravelAngle = null;
  let shipCircleAngle = null;
  let shipTestProgress = 0;
  let shipTestDirection = 1;
  let shipTestSpeed = 0;
  let simulationTime = 0;
  let previousFrameTime = null;
  let simulationAccumulator = 0;
  let sourceMotionAccumulator = 0;
  let simulationFrame = 0;
  let renderFrame = 0;
  let renderRateLimit = 0;
  let previousRenderDispatchTime = null;
  let debugView = 'off';

  const debug = new Debug();

  const debugViewModes = {
    off: { mode: 0, field: null },
    height: { mode: 1, field: 'water' },
    velocity: { mode: 2, field: 'water' },
    foam: { mode: 3, field: 'foam' },
    flow: { mode: 4, field: 'foam' },
    source: { mode: 5, field: 'source' },
  };

  class GpuFrameTimer {

    constructor(context, webgl2) {
      this.context = context;
      this.webgl2 = webgl2;
      this.extension = context.getExtension(
        webgl2 ? 'EXT_disjoint_timer_query_webgl2' : 'EXT_disjoint_timer_query'
      );
      this.activeQuery = null;
      this.pendingQuery = null;
      this.lastMilliseconds = null;
    }

    begin() {
      this.poll();
      if (!this.extension || this.activeQuery || this.pendingQuery) return;

      if (this.webgl2) {
        this.activeQuery = this.context.createQuery();
        this.context.beginQuery(this.extension.TIME_ELAPSED_EXT, this.activeQuery);
      } else {
        this.activeQuery = this.extension.createQueryEXT();
        this.extension.beginQueryEXT(this.extension.TIME_ELAPSED_EXT, this.activeQuery);
      }
    }

    end() {
      if (!this.activeQuery || !this.extension) return;

      if (this.webgl2) {
        this.context.endQuery(this.extension.TIME_ELAPSED_EXT);
      } else {
        this.extension.endQueryEXT(this.extension.TIME_ELAPSED_EXT);
      }
      this.pendingQuery = this.activeQuery;
      this.activeQuery = null;
    }

    poll() {
      if (!this.pendingQuery || !this.extension) return this.lastMilliseconds;

      const available = this.webgl2
        ? this.context.getQueryParameter(this.pendingQuery, this.context.QUERY_RESULT_AVAILABLE)
        : this.extension.getQueryObjectEXT(this.pendingQuery, this.extension.QUERY_RESULT_AVAILABLE_EXT);
      if (!available) return this.lastMilliseconds;

      const disjoint = this.context.getParameter(this.extension.GPU_DISJOINT_EXT);
      if (!disjoint) {
        const nanoseconds = this.webgl2
          ? this.context.getQueryParameter(this.pendingQuery, this.context.QUERY_RESULT)
          : this.extension.getQueryObjectEXT(this.pendingQuery, this.extension.QUERY_RESULT_EXT);
        this.lastMilliseconds = nanoseconds / 1000000;
      }

      if (this.webgl2) {
        this.context.deleteQuery(this.pendingQuery);
      } else {
        this.extension.deleteQueryEXT(this.pendingQuery);
      }
      this.pendingQuery = null;
      return this.lastMilliseconds;
    }

  }

  const gpuFrameTimer = new GpuFrameTimer(gl, isWebGL2);
  let diagnosticsWindowStart = performance.now();
  let diagnosticsFrameCount = 0;
  let diagnosticsCpuMilliseconds = 0;

  function clearDynamicWake() {
    clearObjectPressureField();
    clearWakeSourceField();
    objectPressureTexture.needsUpdate = true;
    wakeSourceTexture.needsUpdate = true;
    waterSimulation.clear(renderer);
    foamSimulation.clear(renderer);
    simulationAccumulator = 0;
    sourceMotionAccumulator = 0;

    for (const interaction of objectWaterInteractions) {
      interaction.wakeHistory.length = 0;
      interaction.lastWakeHistoryByType = {};
      interaction.hasWakeDirection = false;
      interaction.wakeTurnAmount = 0;
    }
  }

  function resetWaterInteractorKinematics(root) {
    const interaction = objectWaterInteractions.find((candidate) => candidate.root === root);
    if (!interaction) return;

    root.getWorldPosition(interaction.previousPosition);
    interaction.velocityX = 0;
    interaction.velocityZ = 0;
    interaction.previousVelocityX = 0;
    interaction.previousVelocityZ = 0;
    interaction.accelerationX = 0;
    interaction.accelerationZ = 0;
    interaction.angularVelocity = 0;
    interaction.lateralVelocity = 0;
    interaction.previousYaw = root.rotation.y;
    interaction.hasWakeDirection = false;
  }

  function updateQualityButtons() {
    setToggleButtonState(qualityLowButton, waterSystemConfig.quality === 'low');
    setToggleButtonState(qualityMediumButton, waterSystemConfig.quality === 'medium');
    setToggleButtonState(qualityUltraButton, waterSystemConfig.quality === 'ultra');
  }

  function getPresetSubstepLimit(preset) {
    return Math.max(
      preset.maxSubsteps,
      Math.ceil(maxSimulationDelta / waterSystemConfig.fixedTimeStep)
    );
  }

  function applyQualityPreset(name) {
    const preset = WATER_QUALITY_PRESETS[name];
    if (!preset) return;

    waterSystemConfig.quality = name;
    waterSystemConfig.maxSubsteps = getPresetSubstepLimit(preset);
    rendererPixelRatioCap = preset.pixelRatio;
    objectWaterSampleLimit = preset.hullSamples;
    waterSimulation.setResolution(renderer, preset.waterResolution);
    foamSimulation.setResolution(renderer, preset.foamResolution);
    reflectionTarget.setSize(preset.reflectionResolution, preset.reflectionResolution);
    caustics.setResolution(preset.causticsResolution);
    fftWavesEnabled = preset.spectralOcean ? 1 : 0;

    for (const interaction of objectWaterInteractions) {
      interaction.sampleLimit = Math.min(
        interaction.requestedSampleLimit || preset.hullSamples,
        preset.hullSamples
      );
      rebuildObjectWaterSamples(interaction);
    }

    if (water.material) {
      water.material.uniforms['waterTexel'].value = 1 / preset.waterResolution;
    }
    resizeRendererToCanvas();
    clearDynamicWake();
    setToggleButtonState(toggleFftWavesButton, fftWavesEnabled > 0);
    updateWaterWaveUniforms();
    updateQualityButtons();
  }

  function setDebugView(view) {
    debugView = debugViewModes[view] ? view : 'off';
    debugViewSelect.value = debugView;
  }

  function updateDiagnostics(frameCpuStart, simulationSteps) {
    const cpuMilliseconds = performance.now() - frameCpuStart;
    diagnosticsCpuMilliseconds = diagnosticsCpuMilliseconds === 0
      ? cpuMilliseconds
      : diagnosticsCpuMilliseconds * 0.90 + cpuMilliseconds * 0.10;
    diagnosticsFrameCount++;

    const now = performance.now();
    const elapsed = now - diagnosticsWindowStart;
    if (elapsed < 500) return;

    const gpuMilliseconds = gpuFrameTimer.poll();
    diagnosticFps.textContent = (diagnosticsFrameCount * 1000 / elapsed).toFixed(0);
    diagnosticCpu.textContent = diagnosticsCpuMilliseconds.toFixed(2) + ' ms';
    diagnosticGpu.textContent = gpuMilliseconds === null ? 'unavailable' : gpuMilliseconds.toFixed(2) + ' ms';
    diagnosticSimulation.textContent =
      waterSimulation.resolution + ' / ' + foamSimulation.resolution + ' px, ' + simulationSteps + ' steps';
    diagnosticRenderer.textContent =
      runtimeCapabilities.renderer + ', ' + renderer.info.render.calls + ' calls, ' +
      renderer.info.render.triangles + ' tris';
    diagnosticsWindowStart = now;
    diagnosticsFrameCount = 0;
  }

  Object.assign(window.waterLab, {
    clearWake: clearDynamicWake,
    setDebugView,
    setQuality: applyQualityPreset,
    getDiagnostics: () => ({
      cpuMilliseconds: diagnosticsCpuMilliseconds,
      gpuMilliseconds: gpuFrameTimer.lastMilliseconds,
      waterResolution: waterSimulation.resolution,
      foamResolution: foamSimulation.resolution,
      simulationFrame,
    }),
  });

  function decimalsForStep(step) {
    const text = String(step);
    const decimalIndex = text.indexOf('.');
    return decimalIndex === -1 ? 0 : text.length - decimalIndex - 1;
  }

  function formatControlValue(value, slider) {
    return Number(value).toFixed(decimalsForStep(slider.step));
  }

  function clampToSlider(value, slider) {
    const min = Number(slider.min);
    const max = Number(slider.max);
    return Math.min(max, Math.max(min, value));
  }

  function setControlValue(slider, valueInput, value) {
    const clampedValue = clampToSlider(value, slider);
    const formattedValue = formatControlValue(clampedValue, slider);

    slider.value = formattedValue;
    valueInput.value = formattedValue;
    return clampedValue;
  }

  function bindNumberInput(slider, valueInput) {
    valueInput.addEventListener('change', () => {
      const parsedValue = Number(valueInput.value);
      const value = Number.isFinite(parsedValue) ? parsedValue : Number(slider.value);

      setControlValue(slider, valueInput, value);
      slider.dispatchEvent(new Event('input'));
    });
  }

  function bindConfigSlider(slider, valueInput, key, transform = (value) => value, onInput = null) {
    bindNumberInput(slider, valueInput);
    slider.addEventListener('input', () => {
      const value = setControlValue(slider, valueInput, Number(slider.value));
      waterSystemConfig[key] = transform(value);
      if (onInput) onInput(value);
    });
  }

  function updateWaterWaveUniforms() {
    if (!water.material) return;

    water.material.uniforms['oceanWaveStrength'].value = oceanWaveStrength * waterSystemConfig.swellAmplitude;
    water.material.uniforms['oceanWaveFrequency'].value = oceanWaveFrequency;
    water.material.uniforms['oceanWaveSpeed'].value = oceanWaveSpeed;
    water.material.uniforms['oceanWaveSharpness'].value = oceanWaveSharpness;
    water.material.uniforms['oceanWindDirection'].value.set(
      Math.cos(waterSystemConfig.windDirection),
      Math.sin(waterSystemConfig.windDirection)
    );
    water.material.uniforms['oceanWindSpeed'].value = waterSystemConfig.windSpeed;
    water.material.uniforms['oceanChoppiness'].value = waterSystemConfig.choppiness;
    water.material.uniforms['fftWavesEnabled'].value = fftWavesEnabled;
  }

  function applyOceanWaveControlValues() {
    setControlValue(waveAmplitudeSlider, waveAmplitudeValue, oceanWaveStrength);
    setControlValue(waveFrequencySlider, waveFrequencyValue, oceanWaveFrequency);
    setControlValue(waveSpeedSlider, waveSpeedValue, oceanWaveSpeed);
    setControlValue(waveSharpnessSlider, waveSharpnessValue, oceanWaveSharpness);
    updateWaterWaveUniforms();
    cargoShip.requestFloatReset();
  }

  bindNumberInput(buoyancySlider, buoyancyValue);
  bindNumberInput(shipBuoyancySlider, shipBuoyancyValue);
  bindNumberInput(shipSpeedSlider, shipSpeedValue);
  bindNumberInput(waveAmplitudeSlider, waveAmplitudeValue);
  bindNumberInput(waveFrequencySlider, waveFrequencyValue);
  bindNumberInput(waveSpeedSlider, waveSpeedValue);
  bindNumberInput(waveSharpnessSlider, waveSharpnessValue);
  bindNumberInput(generatorFrequencySlider, generatorFrequencyValue);
  bindNumberInput(generatorStrengthSlider, generatorStrengthValue);
  bindNumberInput(generatorWidthSlider, generatorWidthValue);
  bindNumberInput(generatorRadiusSlider, generatorRadiusValue);
  bindNumberInput(generatorZSlider, generatorZValue);
  bindNumberInput(wakeHeightSlider, wakeHeightValue);
  bindNumberInput(rippleLengthSlider, rippleLengthValue);
  bindNumberInput(reflectionStrengthSlider, reflectionStrengthValue);
  bindNumberInput(waterOpacitySlider, waterOpacityValue);
  bindNumberInput(shadowStrengthSlider, shadowStrengthValue);
  bindNumberInput(waterTextureOpacitySlider, waterTextureOpacityValue);
  bindNumberInput(waterTextureFrequencySlider, waterTextureFrequencyValue);
  bindConfigSlider(windSpeedSlider, windSpeedValue, 'windSpeed', (value) => value, updateWaterWaveUniforms);
  bindConfigSlider(
    windDirectionSlider,
    windDirectionValue,
    'windDirection',
    (value) => value * Math.PI / 180,
    updateWaterWaveUniforms
  );
  bindConfigSlider(swellAmplitudeSlider, swellAmplitudeValue, 'swellAmplitude', (value) => value, updateWaterWaveUniforms);
  bindConfigSlider(choppinessSlider, choppinessValue, 'choppiness', (value) => value, updateWaterWaveUniforms);
  bindConfigSlider(nearWakeLengthSlider, nearWakeLengthValue, 'nearWakeLength');
  bindConfigSlider(farWakeLifetimeSlider, farWakeLifetimeValue, 'farWakeLifetime');
  bindConfigSlider(propagationSpeedSlider, propagationSpeedValue, 'wavePropagationSpeed');
  bindConfigSlider(viscositySlider, viscosityValue, 'viscosity');
  bindConfigSlider(foamThresholdSlider, foamThresholdValue, 'foamGenerationThreshold');
  bindConfigSlider(foamDecaySlider, foamDecayValue, 'foamDecay');
  bindConfigSlider(foamAdvectionSlider, foamAdvectionValue, 'foamAdvectionSpeed');
  bindConfigSlider(turbulenceSlider, turbulenceValue, 'turbulenceIntensity');
  bindConfigSlider(hullImpulseSlider, hullImpulseValue, 'hullImpulseStrength');
  bindConfigSlider(bowStrengthSlider, bowStrengthValue, 'bowWaveStrength');
  bindConfigSlider(sternTurbulenceSlider, sternTurbulenceValue, 'sternTurbulence');
  bindConfigSlider(propellerWashSlider, propellerWashValue, 'propellerWash');

  fixedStepSelect.addEventListener('change', () => {
    waterSystemConfig.fixedTimeStep = 1 / Number(fixedStepSelect.value);
    waterSystemConfig.maxSubsteps = getPresetSubstepLimit(
      WATER_QUALITY_PRESETS[waterSystemConfig.quality]
    );
    simulationAccumulator = 0;
    sourceMotionAccumulator = 0;
  });

  renderRateSelect.addEventListener('change', () => {
    renderRateLimit = Number(renderRateSelect.value);
    previousRenderDispatchTime = null;
    resetFrameClock();
  });

  debugViewSelect.addEventListener('change', () => {
    setDebugView(debugViewSelect.value);
  });

  qualityLowButton.addEventListener('click', () => applyQualityPreset('low'));
  qualityMediumButton.addEventListener('click', () => applyQualityPreset('medium'));
  qualityUltraButton.addEventListener('click', () => applyQualityPreset('ultra'));

  buoyancySlider.addEventListener('input', () => {
    const value = setControlValue(buoyancySlider, buoyancyValue, Number(buoyancySlider.value));
    floatingSphere.setBuoyancy(value);
  });

  shipBuoyancySlider.addEventListener('input', () => {
    const value = setControlValue(shipBuoyancySlider, shipBuoyancyValue, Number(shipBuoyancySlider.value));
    cargoShip.setBuoyancy(value);
  });

  shipSpeedSlider.addEventListener('input', () => {
    shipAutopilotSpeed = setControlValue(
      shipSpeedSlider,
      shipSpeedValue,
      Number(shipSpeedSlider.value)
    );
  });

  waveAmplitudeSlider.addEventListener('input', () => {
    oceanWaveStrength = setControlValue(waveAmplitudeSlider, waveAmplitudeValue, Number(waveAmplitudeSlider.value));
    updateWaterWaveUniforms();
    cargoShip.requestFloatReset();
  });

  waveFrequencySlider.addEventListener('input', () => {
    oceanWaveFrequency = setControlValue(waveFrequencySlider, waveFrequencyValue, Number(waveFrequencySlider.value));
    updateWaterWaveUniforms();
    cargoShip.requestFloatReset();
  });

  waveSpeedSlider.addEventListener('input', () => {
    oceanWaveSpeed = setControlValue(waveSpeedSlider, waveSpeedValue, Number(waveSpeedSlider.value));
    updateWaterWaveUniforms();
  });

  waveSharpnessSlider.addEventListener('input', () => {
    oceanWaveSharpness = setControlValue(waveSharpnessSlider, waveSharpnessValue, Number(waveSharpnessSlider.value));
    updateWaterWaveUniforms();
    cargoShip.requestFloatReset();
  });

  generatorFrequencySlider.addEventListener('input', () => {
    primaryWaveEmitter.frequency = setControlValue(
      generatorFrequencySlider,
      generatorFrequencyValue,
      Number(generatorFrequencySlider.value)
    );
    resetWaveEmitters();
  });

  generatorStrengthSlider.addEventListener('input', () => {
    primaryWaveEmitter.strength = setControlValue(
      generatorStrengthSlider,
      generatorStrengthValue,
      Number(generatorStrengthSlider.value)
    );
    primaryWaveEmitter.troughStrength = -primaryWaveEmitter.strength * 0.62;
  });

  generatorWidthSlider.addEventListener('input', () => {
    primaryWaveEmitter.width = setControlValue(
      generatorWidthSlider,
      generatorWidthValue,
      Number(generatorWidthSlider.value)
    );
  });

  generatorRadiusSlider.addEventListener('input', () => {
    primaryWaveEmitter.radius = setControlValue(
      generatorRadiusSlider,
      generatorRadiusValue,
      Number(generatorRadiusSlider.value)
    );
    primaryWaveEmitter.troughOffset = primaryWaveEmitter.radius * 1.5;
  });

  generatorZSlider.addEventListener('input', () => {
    primaryWaveEmitter.origin.z = setControlValue(
      generatorZSlider,
      generatorZValue,
      Number(generatorZSlider.value)
    );
  });

  wakeHeightSlider.addEventListener('input', () => {
    objectWakeHeightScale = setControlValue(wakeHeightSlider, wakeHeightValue, Number(wakeHeightSlider.value));
  });

  rippleLengthSlider.addEventListener('input', () => {
    rippleDistance = setControlValue(rippleLengthSlider, rippleLengthValue, Number(rippleLengthSlider.value));
  });

  reflectionStrengthSlider.addEventListener('input', () => {
    reflectionStrength = setControlValue(reflectionStrengthSlider, reflectionStrengthValue, Number(reflectionStrengthSlider.value));

    if (water.material) {
      water.material.uniforms['reflectionStrength'].value = reflectionStrength;
    }
  });

  waterOpacitySlider.addEventListener('input', () => {
    waterOpacity = setControlValue(waterOpacitySlider, waterOpacityValue, Number(waterOpacitySlider.value));

    if (water.material) {
      water.material.uniforms['waterOpacity'].value = waterOpacity;
    }
  });

  shadowStrengthSlider.addEventListener('input', () => {
    shadowStrength = setControlValue(
      shadowStrengthSlider,
      shadowStrengthValue,
      Number(shadowStrengthSlider.value)
    );
    floorShadowReceiver.setStrength(shadowStrength);
  });

  waterTextureOpacitySlider.addEventListener('input', () => {
    waterTextureOpacity = setControlValue(
      waterTextureOpacitySlider,
      waterTextureOpacityValue,
      Number(waterTextureOpacitySlider.value)
    );

    if (water.material) {
      water.material.uniforms['waterTextureOpacity'].value = waterTextureOpacity;
    }
  });

  waterTextureFrequencySlider.addEventListener('input', () => {
    waterTextureFrequency = setControlValue(
      waterTextureFrequencySlider,
      waterTextureFrequencyValue,
      Number(waterTextureFrequencySlider.value)
    );

    if (water.material) {
      water.material.uniforms['waterTextureFrequency'].value = waterTextureFrequency;
    }
  });

  waterColorInput.addEventListener('input', () => {
    waterSystemConfig.waterColor.set(waterColorInput.value);
    if (water.material) {
      water.material.uniforms['waterBodyColor'].value.copy(waterSystemConfig.waterColor);
    }
  });

  absorptionColorInput.addEventListener('input', () => {
    waterSystemConfig.absorption.set(absorptionColorInput.value);
    if (water.material) {
      water.material.uniforms['waterAbsorptionColor'].value.copy(waterSystemConfig.absorption);
    }
  });

  function setToggleButtonState(button, enabled) {
    button.classList.toggle('is-info', enabled);
    button.classList.toggle('is-light', !enabled);
  }

  function updateShipMovementModeButtons() {
    setToggleButtonState(shipModeStraightButton, shipMovementMode === shipMovementModeStraight);
    setToggleButtonState(shipModeRandomButton, shipMovementMode === shipMovementModeRandom);
    setToggleButtonState(shipModeCircleButton, shipMovementMode === shipMovementModeCircle);
    setToggleButtonState(shipModeSTurnButton, shipMovementMode === shipMovementModeSTurn);
    setToggleButtonState(shipModeGeometryButton, shipMovementMode === shipMovementModeGeometry);
    setToggleButtonState(shipModeStoppedButton, shipMovementMode === shipMovementModeStopped);
  }

  function setShipMovementMode(mode) {
    shipMovementMode = mode;
    resetShipAutopilotState();
    prepareShipMotionTest(mode);
    updateShipMovementModeButtons();
  }

  function setMaterialWireframe(material, enabled) {
    if (!material) return;

    if (Array.isArray(material)) {
      material.forEach((item) => setMaterialWireframe(item, enabled));
      return;
    }

    if ('wireframe' in material) {
      material.wireframe = enabled;
      material.needsUpdate = true;
    }
  }

  function setObjectWireframe(object, enabled) {
    object.traverse((child) => {
      if (child.isMesh) {
        setMaterialWireframe(child.material, enabled);
      }
    });
  }

  function applyWireframeMode() {
    setObjectWireframe(objectScene, wireframeEnabled);
    setMaterialWireframe(water.material, wireframeEnabled);
    setMaterialWireframe(pool._material, wireframeEnabled);
    setMaterialWireframe(waterVolume._material, wireframeEnabled);
  }

  function updateFoamUniforms() {
    if (!water.material) return;

    water.material.uniforms['foamHeightThreshold'].value = foamHeightThreshold;
    water.material.uniforms['foamHeightSoftness'].value = foamHeightSoftness;
    water.material.uniforms['foamFromHeightStrength'].value = foamFromHeightStrength;
  }

  toggleSphereButton.addEventListener('click', () => {
    floatingSphere.setVisible(!floatingSphere.visible);
    if (!floatingSphere.visible && draggedVessel === floatingSphere) {
      draggedVessel = null;
      draggedVesselOffset = { x: 0, z: 0 };
    }
    setToggleButtonState(toggleSphereButton, floatingSphere.visible);
  });

  toggleShipButton.addEventListener('click', () => {
    cargoShip.setVisible(!cargoShip.visible);
    if (!cargoShip.visible && draggedVessel === cargoShip) {
      draggedVessel = null;
      draggedVesselOffset = { x: 0, z: 0 };
    }
    setToggleButtonState(toggleShipButton, cargoShip.visible);
  });

  toggleSquareButton.addEventListener('click', () => {
    floatingSquare.setVisible(!floatingSquare.visible);
    if (!floatingSquare.visible && draggedVessel === floatingSquare) {
      draggedVessel = null;
      draggedVesselOffset = { x: 0, z: 0 };
    }
    setToggleButtonState(toggleSquareButton, floatingSquare.visible);
  });

  shipModeStraightButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeStraight);
  });

  shipModeRandomButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeRandom);
  });

  shipModeCircleButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeCircle);
  });

  shipModeSTurnButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeSTurn);
  });

  shipModeGeometryButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeGeometry);
  });

  shipModeStoppedButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeStopped);
  });

  toggleFftWavesButton.addEventListener('click', () => {
    fftWavesEnabled = fftWavesEnabled > 0 ? 0 : 1;
    setToggleButtonState(toggleFftWavesButton, fftWavesEnabled > 0);
    updateWaterWaveUniforms();
    cargoShip.requestFloatReset();
  });

  toggleObjectFoamButton.addEventListener('click', () => {
    objectFoamEnabled = objectFoamEnabled > 0 ? 0 : 1;
    setToggleButtonState(toggleObjectFoamButton, objectFoamEnabled > 0);

    if (water.material) {
      water.material.uniforms['objectFoamEnabled'].value = objectFoamEnabled;
    }
  });

  toggleWaveFoamButton.addEventListener('click', () => {
    waveFoamEnabled = waveFoamEnabled > 0 ? 0 : 1;
    setToggleButtonState(toggleWaveFoamButton, waveFoamEnabled > 0);

    if (water.material) {
      water.material.uniforms['waveFoamEnabled'].value = waveFoamEnabled;
    }
  });

  toggleExtraFoamButton.addEventListener('click', () => {
    extraFoamEnabled = extraFoamEnabled > 0 ? 0 : 1;

    setToggleButtonState(toggleExtraFoamButton, extraFoamEnabled > 0);

    if (water.material) {
      water.material.uniforms['extraFoamEnabled'].value = extraFoamEnabled;
    }
  });

  toggleWaveGeneratorButton.addEventListener('click', () => {
    waveGeneratorEnabled = !waveGeneratorEnabled;
    resetWaveEmitters();
    setToggleButtonState(toggleWaveGeneratorButton, waveGeneratorEnabled);
  });

  toggleWallsButton.addEventListener('click', () => {
    wallsEnabled = !wallsEnabled;
    boundaryWalls.setVisible(wallsEnabled);
    setToggleButtonState(toggleWallsButton, wallsEnabled);
  });

  toggleFoamTextureButton.addEventListener('click', () => {
    foamMottleEnabled = foamMottleEnabled > 0 ? 0 : 1;
    setToggleButtonState(toggleFoamTextureButton, foamMottleEnabled > 0);

    if (water.material) {
      water.material.uniforms['foamMottleEnabled'].value = foamMottleEnabled;
    }
  });

  toggleWaveCausticsButton.addEventListener('click', () => {
    waveCausticsEnabled = waveCausticsEnabled > 0 ? 0 : 1;
    setToggleButtonState(toggleWaveCausticsButton, waveCausticsEnabled > 0);
  });

  toggleWaterTextureButton.addEventListener('click', () => {
    waterImageTextureEnabled = waterImageTextureEnabled > 0 ? 0 : 1;
    setToggleButtonState(toggleWaterTextureButton, waterImageTextureEnabled > 0);

    if (water.material) {
      water.material.uniforms['waterImageTextureEnabled'].value = waterImageTextureEnabled;
    }
  });

  toggleWireframeButton.addEventListener('click', () => {
    wireframeEnabled = !wireframeEnabled;
    setToggleButtonState(toggleWireframeButton, wireframeEnabled);
    applyWireframeMode();
  });

  function hasVisibleVessel() {
    return floatingSphere.visible || floatingSquare.visible || cargoShip.visible;
  }

  function getVesselPoint(vessel) {
    const position = vessel.group ? vessel.group.position : vessel.mesh.position;

    return {
      x: position.x,
      z: position.z,
    };
  }

  function getOffsetWaterPoint(point) {
    return {
      x: point.x - draggedVesselOffset.x,
      z: point.z - draggedVesselOffset.z,
    };
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothStep(edge0, edge1, value) {
    const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function shortestAngleDelta(from, to) {
    return Math.atan2(Math.sin(to - from), Math.cos(to - from));
  }

  function smoothAngle(from, to, amount) {
    return from + shortestAngleDelta(from, to) * amount;
  }

  function randomShipAutoTarget() {
    return {
      x: randomRange(-shipAutopilotBounds, shipAutopilotBounds),
      z: randomRange(-shipAutopilotBounds, shipAutopilotBounds),
    };
  }

  function chooseShipAutoTurn(time) {
    shipAutoTargetTurnBias = randomRange(-shipAutopilotTurnBiasMax, shipAutopilotTurnBiasMax);
    shipAutoNextTurnTime = time + randomRange(shipAutopilotTurnChangeMinTime, shipAutopilotTurnChangeMaxTime);
  }

  function resetShipWakeDirection() {
    cargoShip.wakeDirection = null;
    cargoShip.wakeTurnAmount = 0;
  }

  function resetShipAutopilotState() {
    shipAutoTarget = null;
    shipAutoLastTime = null;
    shipAutoNextTurnTime = 0;
    shipAutoTurnBias = 0;
    shipAutoTargetTurnBias = 0;
    shipAutoTravelAngle = null;
    shipCircleAngle = null;
    resetShipWakeDirection();
  }

  function placeShipForMotionTest(point, yaw) {
    cargoShip.group.position.x = point.x;
    cargoShip.group.position.z = point.z;
    cargoShip.group.rotation.y = yaw;
    cargoShip.targetYaw = yaw;
    cargoShip.clampToPool();
    cargoShip.requestFloatReset();
    resetWaterInteractorKinematics(cargoShip.group);
  }

  function prepareShipMotionTest(mode) {
    shipTestProgress = 0;
    shipTestDirection = 1;
    shipTestSpeed = 0;

    if (mode === shipMovementModeStopped) {
      clearObjectPressureField();
      clearWakeSourceField();
      objectPressureTexture.needsUpdate = true;
      wakeSourceTexture.needsUpdate = true;
      resetWaterInteractorKinematics(cargoShip.group);
      resetWaterInteractorKinematics(floatingSquare.mesh);
      resetWaterInteractorKinematics(floatingSphere.mesh);
      return;
    }

    if (mode === shipMovementModeStraight || mode === shipMovementModeSTurn) {
      clearDynamicWake();
      placeShipForMotionTest(
        { x: shipTestPathMinX, z: 0 },
        Math.PI
      );
      return;
    }

    if (mode === shipMovementModeCircle) {
      clearDynamicWake();
      shipCircleAngle = 0;
      placeShipForMotionTest(
        { x: shipCircleCenter.x + shipCircleRadius, z: shipCircleCenter.z },
        shipMovementYawOffset
      );
      return;
    }

    if (mode === shipMovementModeGeometry) {
      clearDynamicWake();
      floatingSquare.setVisible(true);
      floatingSphere.setVisible(true);
      setToggleButtonState(toggleSquareButton, true);
      setToggleButtonState(toggleSphereButton, true);
      placeShipForMotionTest({ x: shipTestPathMinX, z: 0 }, Math.PI);
      floatingSquare.moveToWaterPoint({ x: shipTestPathMinX, z: 0.72 });
      floatingSphere.moveToWaterPoint({ x: shipTestPathMinX, z: -0.72 });
      resetWaterInteractorKinematics(floatingSquare.mesh);
      resetWaterInteractorKinematics(floatingSphere.mesh);
    }
  }

  function updateShipRandomMovement(time, deltaTime) {
    if (!shipAutoTarget) {
      shipAutoTarget = randomShipAutoTarget();
      chooseShipAutoTurn(time);
    }

    const current = getVesselPoint(cargoShip);
    const dx = shipAutoTarget.x - current.x;
    const dz = shipAutoTarget.z - current.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < shipAutopilotTargetRadius) {
      shipAutoTarget = randomShipAutoTarget();
      chooseShipAutoTurn(time);
      shipAutoTravelAngle = null;
      resetShipWakeDirection();
      return;
    }

    if (time >= shipAutoNextTurnTime) {
      chooseShipAutoTurn(time);
    }

    const targetAngle = Math.atan2(dx, dz);
    const turnBlend = 1 - Math.exp(-deltaTime * shipAutopilotTurnSmoothness);
    const headingBlend = 1 - Math.exp(-deltaTime * shipAutopilotHeadingSmoothness);
    shipAutoTurnBias += (shipAutoTargetTurnBias - shipAutoTurnBias) * turnBlend;

    const desiredTravelAngle = targetAngle + shipAutoTurnBias * Math.min(1, distance / 0.5);
    shipAutoTravelAngle = shipAutoTravelAngle === null
      ? desiredTravelAngle
      : smoothAngle(shipAutoTravelAngle, desiredTravelAngle, headingBlend);

    const travelAngle = shipAutoTravelAngle;
    const step = Math.min(distance, shipAutopilotSpeed * deltaTime);
    const nextPoint = {
      x: current.x + Math.sin(travelAngle) * step,
      z: current.z + Math.cos(travelAngle) * step,
    };

    cargoShip.moveToWaterPoint(nextPoint);
  }

  function updateShipCircleMovement(deltaTime) {
    const current = getVesselPoint(cargoShip);

    if (shipCircleAngle === null) {
      shipCircleAngle = Math.atan2(current.z - shipCircleCenter.z, current.x - shipCircleCenter.x);
    }

    shipCircleAngle += shipAutopilotSpeed / shipCircleRadius * deltaTime;

    const circlePoint = {
      x: shipCircleCenter.x + Math.cos(shipCircleAngle) * shipCircleRadius,
      z: shipCircleCenter.z + Math.sin(shipCircleAngle) * shipCircleRadius,
    };
    const dx = circlePoint.x - current.x;
    const dz = circlePoint.z - current.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance <= 0.0001) return;

    const step = Math.min(distance, shipAutopilotSpeed * deltaTime);
    const nextPoint = {
      x: current.x + dx / distance * step,
      z: current.z + dz / distance * step,
    };

    cargoShip.moveToWaterPoint(nextPoint);
  }

  function updateShipPathTest(deltaTime, sTurn, compareGeometry = false) {
    const pathLength = shipTestPathMaxX - shipTestPathMinX;
    shipTestSpeed = Math.min(shipAutopilotSpeed, shipTestSpeed + shipTestAcceleration * deltaTime);
    shipTestProgress += shipTestDirection * shipTestSpeed * deltaTime / pathLength;

    if (shipTestProgress >= 1 || shipTestProgress <= 0) {
      shipTestProgress = clamp(shipTestProgress, 0, 1);
      shipTestDirection *= -1;
      shipTestSpeed = 0;
    }

    const x = shipTestPathMinX + pathLength * shipTestProgress;
    cargoShip.moveToWaterPoint({
      x,
      z: sTurn ? Math.sin(shipTestProgress * Math.PI * 2) * shipTestSTurnAmplitude : 0,
    });

    if (compareGeometry) {
      floatingSquare.moveToWaterPoint({ x, z: 0.72 });
      floatingSphere.moveToWaterPoint({ x, z: -0.72 });
    }
  }

  function updateAutonomousShip(time) {
    if (!cargoShip.visible || draggedVessel === cargoShip || shipMovementMode === shipMovementModeStopped) {
      shipAutoLastTime = time;
      shipAutoTravelAngle = null;
      return;
    }

    const previousTime = shipAutoLastTime === null ? time : shipAutoLastTime;
    const deltaTime = Math.min(0.05, Math.max(0, time - previousTime));
    shipAutoLastTime = time;

    if (deltaTime <= 0) return;

    if (shipMovementMode === shipMovementModeCircle) {
      updateShipCircleMovement(deltaTime);
      return;
    }

    if (shipMovementMode === shipMovementModeStraight) {
      updateShipPathTest(deltaTime, false);
      return;
    }

    if (shipMovementMode === shipMovementModeSTurn) {
      updateShipPathTest(deltaTime, true);
      return;
    }

    if (shipMovementMode === shipMovementModeGeometry) {
      updateShipPathTest(deltaTime, false, true);
      return;
    }

    updateShipRandomMovement(time, deltaTime);
  }

  function pickVessel(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);

    const hits = [];

    if (floatingSphere.visible) {
      const sphereHits = raycaster.intersectObject(floatingSphere.mesh, true);
      if (sphereHits.length > 0) {
        hits.push({
          distance: sphereHits[0].distance,
          vessel: floatingSphere,
        });
      }
    }

    if (floatingSquare.visible) {
      const squareHits = raycaster.intersectObject(floatingSquare.mesh, true);
      if (squareHits.length > 0) {
        hits.push({
          distance: squareHits[0].distance,
          vessel: floatingSquare,
        });
      }
    }

    if (cargoShip.visible) {
      const shipHits = raycaster.intersectObject(cargoShip.group, true);
      if (shipHits.length > 0) {
        hits.push({
          distance: shipHits[0].distance,
          vessel: cargoShip,
        });
      }
    }

    if (hits.length === 0) return null;

    hits.sort((a, b) => a.distance - b.distance);
    return hits[0].vessel;
  }

  function gerstnerHeight(pointX, pointZ, directionX, directionZ, frequency, speed, amplitude, time) {
    const windX = Math.cos(waterSystemConfig.windDirection);
    const windZ = Math.sin(waterSystemConfig.windDirection);
    const rotatedX = directionX * windX - directionZ * windZ;
    const rotatedZ = directionX * windZ + directionZ * windX;
    const length = Math.sqrt(rotatedX * rotatedX + rotatedZ * rotatedZ);
    const normalizedX = rotatedX / length;
    const normalizedZ = rotatedZ / length;
    const crest = Math.sin(
      (pointX * normalizedX + pointZ * normalizedZ) * frequency * oceanWaveFrequency +
      time * speed * oceanWaveSpeed
    );
    const storm = Math.min(1, Math.max(0, (oceanWaveStrength - 0.08) / 0.04));
    const easedStorm = storm * storm * (3 - 2 * storm);
    const positiveCrest = Math.max(crest, 0);
    const negativeCrest = Math.max(-crest, 0);

    return (
      crest +
      Math.pow(positiveCrest, 3) * easedStorm * 0.85 * oceanWaveSharpness -
      Math.pow(negativeCrest, 2) * easedStorm * 0.16 * oceanWaveSharpness
    ) * amplitude;
  }

  function getOceanHeightAt(x, z, time) {
    if (fftWavesEnabled > 0) {
      return getSpectralOceanHeightAt(x, z, time);
    }

    let height = 0;

    height += gerstnerHeight(x, z, 1, 0.24, 4.2, 0.85, 0.55, time);
    height += gerstnerHeight(x, z, 0.82, 0.55, 6.8, 1.22, 0.32, time);
    height += gerstnerHeight(x, z, -0.35, 1, 10.5, 1.85, 0.18, time);
    height += gerstnerHeight(x, z, 0.2, 1, 17, 2.65, 0.08, time);
    height += gerstnerHeight(x, z, -1, 0.15, 24, 3.4, 0.045, time);

    const windEnergy = clamp(waterSystemConfig.windSpeed / 9, 0.35, 1.85);
    return height * oceanWaveStrength * windEnergy * waterSystemConfig.swellAmplitude;
  }

  function spectralHeight(pointX, pointZ, directionX, directionZ, frequency, speed, amplitude, phase, time) {
    const windX = Math.cos(waterSystemConfig.windDirection);
    const windZ = Math.sin(waterSystemConfig.windDirection);
    const rotatedX = directionX * windX - directionZ * windZ;
    const rotatedZ = directionX * windZ + directionZ * windX;
    const length = Math.sqrt(rotatedX * rotatedX + rotatedZ * rotatedZ);
    const normalizedX = rotatedX / length;
    const normalizedZ = rotatedZ / length;
    const angle =
      (pointX * normalizedX + pointZ * normalizedZ) * frequency * oceanWaveFrequency +
      time * speed * oceanWaveSpeed +
      phase;

    return Math.sin(angle) * amplitude;
  }

  function getSpectralOceanHeightAt(x, z, time) {
    let height = 0;

    height += spectralHeight(x, z, 1.00, 0.18, 2.60, 0.56, 0.42, 0.30, time);
    height += spectralHeight(x, z, 0.92, 0.38, 3.70, 0.72, 0.32, 2.10, time);
    height += spectralHeight(x, z, 0.72, 0.70, 5.20, 0.96, 0.24, 4.50, time);
    height += spectralHeight(x, z, 0.36, 0.94, 6.80, 1.15, 0.18, 1.40, time);
    height += spectralHeight(x, z, -0.10, 1.00, 8.60, 1.42, 0.14, 5.30, time);
    height += spectralHeight(x, z, -0.42, 0.91, 10.80, 1.68, 0.105, 0.80, time);
    height += spectralHeight(x, z, 0.58, -0.82, 12.60, 1.94, 0.080, 3.70, time);
    height += spectralHeight(x, z, -0.74, 0.66, 15.20, 2.22, 0.060, 2.80, time);
    height += spectralHeight(x, z, 0.98, -0.22, 18.50, 2.55, 0.045, 5.90, time);
    height += spectralHeight(x, z, -0.88, -0.48, 21.00, 2.88, 0.034, 1.90, time);
    height += spectralHeight(x, z, 0.18, 0.98, 24.80, 3.25, 0.026, 4.10, time);
    height += spectralHeight(x, z, -0.26, 0.96, 29.50, 3.68, 0.020, 0.55, time);
    height += spectralHeight(x, z, 0.64, 0.77, 34.00, 4.05, 0.016, 3.20, time);
    height += spectralHeight(x, z, -0.56, 0.83, 40.00, 4.52, 0.012, 5.05, time);
    height += spectralHeight(x, z, 0.86, 0.50, 48.00, 5.10, 0.009, 2.45, time);
    height += spectralHeight(x, z, -0.98, 0.18, 56.00, 5.75, 0.007, 4.85, time);

    const windEnergy = clamp(waterSystemConfig.windSpeed / 9, 0.35, 1.85);
    return height * oceanWaveStrength * windEnergy * waterSystemConfig.swellAmplitude;
  }

  function getShipWaterProbePoints() {
    const x = cargoShip.group.position.x;
    const z = cargoShip.group.position.z;
    const heading = cargoShip.group.rotation.y - shipMovementYawOffset;
    const forwardX = Math.sin(heading);
    const forwardZ = Math.cos(heading);
    const sideX = -forwardZ;
    const sideZ = forwardX;
    const bowOffset = cargoShip.wakeExtents.bow;
    const sternOffset = cargoShip.wakeExtents.stern;
    const sideOffset = cargoShip.wakeExtents.beam * 0.5;

    return {
      center: { x, z },
      bow: { x: x + forwardX * bowOffset, z: z + forwardZ * bowOffset },
      stern: { x: x - forwardX * sternOffset, z: z - forwardZ * sternOffset },
      left: { x: x - sideX * sideOffset, z: z - sideZ * sideOffset },
      right: { x: x + sideX * sideOffset, z: z + sideZ * sideOffset },
    };
  }

  function sampleTotalWaterHeights(points, waterTexture, time) {
    const wakeHeights = waterHeightProbe.sample(renderer, waterTexture, points);
    return points.map((point, index) =>
      wakeHeights[index] * wakeWaveStrength + getOceanHeightAt(point.x, point.z, time)
    );
  }

  function clearWakeSourceField() {
    wakeSourceFieldData.fill(0);
  }

  function splatShipWakeFoamTrail(sample) {
    const axisLength = Math.sqrt(sample.axisX * sample.axisX + sample.axisZ * sample.axisZ);
    if (!Number.isFinite(axisLength) || axisLength < 0.0001 || sample.length <= 0) return;

    const axisX = sample.axisX / axisLength;
    const axisZ = sample.axisZ / axisLength;
    const sideX = -axisZ;
    const sideZ = axisX;
    const length = clamp(sample.length, 0.01, Math.max(waterWidth, waterLength));
    const startWidth = clamp(sample.startWidth, 0.008, objectWaterSegmentMaxWidth);
    const endWidth = clamp(sample.endWidth, 0.008, objectWaterSegmentMaxWidth * 1.4);
    const maxWidth = Math.max(startWidth, endWidth);
    const endX = sample.x + axisX * length;
    const endZ = sample.z + axisZ * length;
    const padding = maxWidth * 0.7 + Math.max(waterWidth, waterLength) / wakeSourceFieldResolution;
    const minWorldX = Math.min(sample.x, endX) - padding;
    const maxWorldX = Math.max(sample.x, endX) + padding;
    const minWorldZ = Math.min(sample.z, endZ) - padding;
    const maxWorldZ = Math.max(sample.z, endZ) + padding;
    const minX = Math.max(0, Math.floor(worldXToWaterUv(minWorldX) * (wakeSourceFieldResolution - 1)));
    const maxX = Math.min(wakeSourceFieldResolution - 1, Math.ceil(worldXToWaterUv(maxWorldX) * (wakeSourceFieldResolution - 1)));
    const minY = Math.max(0, Math.floor(worldZToWaterUv(minWorldZ) * (wakeSourceFieldResolution - 1)));
    const maxY = Math.min(wakeSourceFieldResolution - 1, Math.ceil(worldZToWaterUv(maxWorldZ) * (wakeSourceFieldResolution - 1)));
    const headFeather = Math.max(0.012, Math.min(length * 0.12, startWidth));
    const tailFeather = Math.max(0.025, Math.min(length * 0.22, endWidth * 1.8));
    const directionByteX = Math.round((axisX * 0.5 + 0.5) * 255);
    const directionByteZ = Math.round((axisZ * 0.5 + 0.5) * 255);
    const intensity = clamp(sample.intensity, 0, 1);
    const churn = clamp(sample.churn, 0, 1);

    for (let y = minY; y <= maxY; y++) {
      const worldZ = (y / (wakeSourceFieldResolution - 1) - 0.5) * waterLength;

      for (let x = minX; x <= maxX; x++) {
        const worldX = (x / (wakeSourceFieldResolution - 1) - 0.5) * waterWidth;
        const dx = worldX - sample.x;
        const dz = worldZ - sample.z;
        const along = dx * axisX + dz * axisZ;
        if (along < -headFeather || along > length + tailFeather) continue;

        const t = clamp(along / length, 0, 1);
        const width = startWidth + (endWidth - startWidth) * Math.pow(t, 0.72);
        const halfWidth = Math.max(0.004, width * 0.5);
        const cross = Math.abs(dx * sideX + dz * sideZ) / halfWidth;
        if (cross >= 1) continue;

        const crossFade = 1 - smoothStep(0.30, 1.0, cross);
        const headFade = smoothStep(-headFeather, 0, along);
        const tailFade = 1 - smoothStep(length * 0.72, length + tailFeather, along);
        const edgeFade = getWaterEdgeFade(worldX, worldZ);
        const value = clamp(intensity * crossFade * headFade * tailFade * edgeFade, 0, 1);
        if (value <= 0.002) continue;

        const index = (y * wakeSourceFieldResolution + x) * 4;
        const current = wakeSourceFieldData[index] / 255;
        wakeSourceFieldData[index] = Math.round(Math.max(current, value) * 255);
        wakeSourceFieldData[index + 3] = Math.round(Math.max(
          wakeSourceFieldData[index + 3] / 255,
          value * churn
        ) * 255);

        if (value >= current * 0.72) {
          wakeSourceFieldData[index + 1] = directionByteX;
          wakeSourceFieldData[index + 2] = directionByteZ;
        }
      }
    }
  }

  function getShipWakeAngle(interaction, hullLength) {
    const speed = Math.sqrt(
      interaction.velocityX * interaction.velocityX +
      interaction.velocityZ * interaction.velocityZ
    );
    const froudeNumber = speed / Math.sqrt(9.81 * Math.max(hullLength, 0.01));
    const highSpeedNarrowing = smoothStep(0.42, 1.15, froudeNumber);
    return objectWaterKelvinAngle * (1 - highSpeedNarrowing * 0.46);
  }

  function addShipWakeFoam(interaction, contacts, slices, directionX, directionZ, sideX, sideZ, speedAmount, turnAmount) {
    if (!interaction.isShip || slices.length === 0) return;

    const leading = slices[slices.length - 1];
    const trailing = slices[0];
    const trailX = -directionX;
    const trailZ = -directionZ;
    const length = contacts.wakeLength || contacts.length;
    const beam = contacts.wakeBeam || contacts.beam;
    const wakeAngle = getShipWakeAngle(interaction, length);
    const foamSpeed = smoothStep(0.12, 0.72, speedAmount) * interaction.strengthScale;
    if (foamSpeed <= 0.001) return;

    splatShipWakeFoamTrail({
      x: trailing.x,
      z: trailing.z,
      axisX: trailX,
      axisZ: trailZ,
      length: Math.max(length * waterSystemConfig.nearWakeLength, beam * 2.4),
      startWidth: Math.max(beam * 0.20, 0.018),
      endWidth: Math.max(beam * 0.36, 0.034),
      intensity: foamSpeed * 0.82,
      churn: 1.0,
    });

    for (const propellerPoint of interaction.propellerPoints) {
      objectWaterPropellerPosition
        .set(propellerPoint.x, propellerPoint.y, propellerPoint.z)
        .applyMatrix4(interaction.root.matrixWorld);
      splatShipWakeFoamTrail({
        x: objectWaterPropellerPosition.x,
        z: objectWaterPropellerPosition.z,
        axisX: trailX,
        axisZ: trailZ,
        length: Math.max(length * 0.86, beam * 2.4),
        startWidth: Math.max(beam * 0.10, 0.012),
        endWidth: Math.max(beam * 0.26, 0.026),
        intensity: foamSpeed,
        churn: 1.0,
      });
    }

    for (const sideSign of [-1, 1]) {
      const sideScale = getTurnSideScale(turnAmount, sideSign, 0.72, 0.24);
      const shoulderX = trailing.x + sideX * beam * 0.27 * sideSign;
      const shoulderZ = trailing.z + sideZ * beam * 0.27 * sideSign;

      splatShipWakeFoamTrail({
        x: shoulderX,
        z: shoulderZ,
        axisX: trailX,
        axisZ: trailZ,
        length: Math.max(length * (0.58 + Math.max(0, sideScale - 1) * 0.12), beam * 2.2),
        startWidth: Math.max(beam * 0.075, 0.012),
        endWidth: Math.max(beam * 0.18, 0.022),
        intensity: foamSpeed * 0.68 * sideScale,
        churn: 0.88,
      });

      const bowSide = getWakeSliceSidePoint(leading, directionX, directionZ, sideX, sideZ, sideSign);
      if (!bowSide) continue;

      splatShipWakeFoamTrail({
        x: bowSide.x,
        z: bowSide.z,
        axisX: trailX,
        axisZ: trailZ,
        length: Math.max(length * 0.30, beam * 1.0),
        startWidth: Math.max(beam * 0.065, 0.011),
        endWidth: Math.max(beam * 0.12, 0.017),
        intensity: foamSpeed * 0.52 * sideScale,
        churn: 0.70,
      });

      const cuspX = trailX * Math.cos(wakeAngle) + sideX * Math.sin(wakeAngle) * sideSign;
      const cuspZ = trailZ * Math.cos(wakeAngle) + sideZ * Math.sin(wakeAngle) * sideSign;
      splatShipWakeFoamTrail({
        x: bowSide.x,
        z: bowSide.z,
        axisX: cuspX,
        axisZ: cuspZ,
        length: Math.max(length * (0.38 + Math.max(0, sideScale - 1) * 0.08), beam * 1.25),
        startWidth: Math.max(beam * 0.050, 0.010),
        endWidth: Math.max(beam * 0.15, 0.020),
        intensity: foamSpeed * 0.30 * sideScale,
        churn: 0.48,
      });
    }
  }

  function clearObjectPressureField() {
    objectPressureFieldData.fill(0);
  }

  function splatObjectPressure(sample) {
    const axisLength = Math.sqrt(sample.axisX * sample.axisX + sample.axisZ * sample.axisZ);
    if (!Number.isFinite(axisLength) || axisLength < 0.0001) return;

    const axisX = sample.axisX / axisLength;
    const axisZ = sample.axisZ / axisLength;
    const rawHalfLength = Number.isFinite(sample.halfLength) ? sample.halfLength : 0;
    const rawHalfWidth = Number.isFinite(sample.halfWidth) ? sample.halfWidth : 0;
    const halfLength = clamp(rawHalfLength, 0.002, objectWaterSegmentMaxLength * 0.5);
    const halfWidth = clamp(rawHalfWidth, 0.002, objectWaterSegmentMaxWidth * 0.5);
    const target = Number.isFinite(sample.target) ? clamp(sample.target, -objectWaterPressureLimit, objectWaterPressureLimit) : 0;
    const impulse = Number.isFinite(sample.impulse) ? clamp(sample.impulse, -objectWaterImpulseLimit, objectWaterImpulseLimit) : 0;
    const turbulence = Number.isFinite(sample.turbulence) ? clamp(sample.turbulence, 0, 1) : 0;
    const uvX = worldXToWaterUv(sample.x);
    const uvY = worldZToWaterUv(sample.z);
    if (!Number.isFinite(uvX) || !Number.isFinite(uvY)) return;

    const centerX = uvX * (objectPressureFieldResolution - 1);
    const centerY = uvY * (objectPressureFieldResolution - 1);
    const radius = Math.sqrt(halfLength * halfLength + halfWidth * halfWidth);
    const radiusCells = Math.max(
      1,
      Math.ceil(Math.max(radius / waterWidth, radius / waterLength) * objectPressureFieldResolution)
    );
    const worldCellSizeX = waterWidth / (objectPressureFieldResolution - 1);
    const worldCellSizeZ = waterLength / (objectPressureFieldResolution - 1);
    const minX = Math.max(0, Math.floor(centerX - radiusCells));
    const maxX = Math.min(objectPressureFieldResolution - 1, Math.ceil(centerX + radiusCells));
    const minY = Math.max(0, Math.floor(centerY - radiusCells));
    const maxY = Math.min(objectPressureFieldResolution - 1, Math.ceil(centerY + radiusCells));
    const weight = Math.max(0, objectWakeHeightScale);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = (x - centerX) * worldCellSizeX;
        const dz = (y - centerY) * worldCellSizeZ;
        const along = dx * axisX + dz * axisZ;
        const cross = dx * -axisZ + dz * axisX;
        const distance = Math.sqrt(
          (along / halfLength) * (along / halfLength) +
          (cross / halfWidth) * (cross / halfWidth)
        );

        if (distance > 1) continue;

        const worldX = (x / (objectPressureFieldResolution - 1) - 0.5) * waterWidth;
        const worldZ = (y / (objectPressureFieldResolution - 1) - 0.5) * waterLength;
        const edgeFade = getWaterEdgeFade(worldX, worldZ);
        if (edgeFade <= 0) continue;

        const falloff = 1 - distance;
        const smoothFalloff = falloff * falloff * (3 - 2 * falloff) * edgeFade;
        const index = (y * objectPressureFieldResolution + x) * 4;

        objectPressureFieldData[index] += target * smoothFalloff * weight;
        objectPressureFieldData[index + 1] += impulse * smoothFalloff * weight;
        objectPressureFieldData[index + 2] += turbulence * smoothFalloff;
        objectPressureFieldData[index + 3] += smoothFalloff;
      }
    }
  }

  function addObjectPressureSegment(startX, startZ, axisX, axisZ, length, width, target, impulse, turbulence = 0) {
    const axisLength = Math.sqrt(axisX * axisX + axisZ * axisZ);
    if (
      !Number.isFinite(axisLength) ||
      axisLength < 0.0001 ||
      length <= 0 ||
      width <= 0 ||
      !Number.isFinite(startX) ||
      !Number.isFinite(startZ) ||
      !Number.isFinite(length) ||
      !Number.isFinite(width)
    ) return;

    const normalizedX = axisX / axisLength;
    const normalizedZ = axisZ / axisLength;
    const safeLength = clamp(length, 0.004, objectWaterSegmentMaxLength);
    const safeWidth = clamp(width, 0.004, objectWaterSegmentMaxWidth);
    const halfLength = safeLength * 0.5;

    splatObjectPressure({
      x: startX + normalizedX * halfLength,
      z: startZ + normalizedZ * halfLength,
      axisX: normalizedX,
      axisZ: normalizedZ,
      halfLength,
      halfWidth: safeWidth * 0.5,
      target,
      impulse,
      turbulence,
    });
  }

  function addObjectDivergentPressure(origin, trailX, trailZ, sideX, sideZ, sideSign, length, width, strength) {
    const axisX = trailX * Math.cos(objectWaterKelvinAngle) + sideX * Math.sin(objectWaterKelvinAngle) * sideSign;
    const axisZ = trailZ * Math.cos(objectWaterKelvinAngle) + sideZ * Math.sin(objectWaterKelvinAngle) * sideSign;

    addObjectPressureSegment(
      origin.x,
      origin.z,
      axisX,
      axisZ,
      length,
      width,
      strength * 0.42,
      strength * 0.36,
      0.45
    );
  }

  function finalizeObjectPressureField() {
    for (let i = 0; i < objectPressureFieldData.length; i += 4) {
      const coverage = objectPressureFieldData[i + 3];
      if (coverage <= 0) continue;

      objectPressureFieldData[i] = clamp(
        objectPressureFieldData[i] / coverage,
        -objectWaterPressureLimit,
        objectWaterPressureLimit
      );
      objectPressureFieldData[i + 1] = clamp(
        objectPressureFieldData[i + 1] / coverage,
        -objectWaterImpulseLimit,
        objectWaterImpulseLimit
      );
      objectPressureFieldData[i + 2] = clamp(objectPressureFieldData[i + 2] / coverage, 0, 1);
      objectPressureFieldData[i + 3] = clamp(coverage / 2.4, 0, 1);
    }
  }

  function collectObjectWaterContacts(interaction, directionX, directionZ, sideX, sideZ) {
    const result = {
      points: objectWaterSamples,
      minAlong: Infinity,
      maxAlong: -Infinity,
      minSide: Infinity,
      maxSide: -Infinity,
    };

    objectWaterSamples.length = 0;

    for (const sample of interaction.samples) {
      const mesh = sample.mesh;
      if (!mesh.visible) continue;

      objectWaterVertex.copy(sample.position).applyMatrix4(mesh.matrixWorld);

      if (
        objectWaterVertex.x < -waterHalfWidth ||
        objectWaterVertex.x > waterHalfWidth ||
        objectWaterVertex.z < -waterHalfLength ||
        objectWaterVertex.z > waterHalfLength
      ) {
        continue;
      }

      const waterHeight = getOceanHeightAt(objectWaterVertex.x, objectWaterVertex.z, simulationTime);
      const depth = waterHeight + objectWaterContactPadding - objectWaterVertex.y;
      if (depth < 0 || depth > objectWaterMaxDepth) continue;

      const along = objectWaterVertex.x * directionX + objectWaterVertex.z * directionZ;
      const side = objectWaterVertex.x * sideX + objectWaterVertex.z * sideZ;
      const immersion = smoothStep(0, objectWaterMaxDepth, depth);

      result.points.push({
        x: objectWaterVertex.x,
        z: objectWaterVertex.z,
        along,
        side,
        immersion,
      });
      result.minAlong = Math.min(result.minAlong, along);
      result.maxAlong = Math.max(result.maxAlong, along);
      result.minSide = Math.min(result.minSide, side);
      result.maxSide = Math.max(result.maxSide, side);
    }

    if (result.points.length < 3) return null;

    result.length = Math.max(0.001, result.maxAlong - result.minAlong);
    result.beam = Math.max(0.001, result.maxSide - result.minSide);
    return result;
  }

  function wakeAxesToWorld(along, side, directionX, directionZ, sideX, sideZ) {
    return {
      x: directionX * along + sideX * side,
      z: directionZ * along + sideZ * side,
    };
  }

  function getWakePointFrame(point) {
    return {
      trailX: -point.directionX,
      trailZ: -point.directionZ,
      sideX: point.sideX,
      sideZ: point.sideZ,
    };
  }

  function buildObjectWaterSlices(contacts, directionX, directionZ, sideX, sideZ, requestedCount) {
    const sliceCount = Math.max(4, requestedCount);
    const length = Math.max(0.001, contacts.maxAlong - contacts.minAlong);
    const slices = [];

    for (let i = 0; i < sliceCount; i++) {
      const minAlong = contacts.minAlong + length * i / sliceCount;
      const maxAlong = contacts.minAlong + length * (i + 1) / sliceCount;
      let minSide = Infinity;
      let maxSide = -Infinity;
      let sideSum = 0;
      let alongSum = 0;
      let immersionSum = 0;
      let count = 0;

      for (const point of contacts.points) {
        if (point.along < minAlong || point.along > maxAlong) continue;

        minSide = Math.min(minSide, point.side);
        maxSide = Math.max(maxSide, point.side);
        sideSum += point.side;
        alongSum += point.along;
        immersionSum += point.immersion;
        count++;
      }

      if (count < 2 || minSide >= maxSide) continue;

      const along = alongSum / count;
      const side = sideSum / count;
      const center = wakeAxesToWorld(along, side, directionX, directionZ, sideX, sideZ);

      slices.push({
        x: center.x,
        z: center.z,
        along,
        side,
        minSide,
        maxSide,
        beam: maxSide - minSide,
        immersion: immersionSum / count,
        t: clamp((along - contacts.minAlong) / length, 0, 1),
      });
    }

    return slices;
  }

  function addShipHullPressure(interaction, contacts, slices, directionX, directionZ, sideX, sideZ, speedAmount, turnAmount) {
    if (slices.length === 0) return;

    const alignment = getObjectWakeHeadingAlignment(interaction, directionX, directionZ);
    const length = contacts.wakeLength || contacts.length;
    const beam = contacts.wakeBeam || contacts.beam;
    const displacedReference = Math.max(0.000001, length * beam * interaction.draft * 0.58);
    const displacementScale = clamp(interaction.displacedVolume / displacedReference, 0.55, 1.85);
    const longitudinalAcceleration =
      interaction.accelerationX * directionX + interaction.accelerationZ * directionZ;
    const accelerationScale = clamp(1 + longitudinalAcceleration * 0.22, 0.72, 1.42);
    const pressureScale = speedAmount *
      (0.82 + alignment * 0.18) *
      interaction.strengthScale *
      displacementScale *
      waterSystemConfig.hullImpulseStrength;
    const trailX = -directionX;
    const trailZ = -directionZ;
    const wakeAngle = getShipWakeAngle(interaction, length);
    const leading = slices[slices.length - 1];
    const trailing = slices[0];
    const sliceThickness = Math.max(0.010, length / Math.max(10, slices.length) * 1.05);
    const railWidth = Math.max(beam * 0.055, 0.010) * interaction.radiusScale;
    const turnMagnitude = Math.min(1, Math.abs(turnAmount));

    for (const slice of slices) {
      const bowProfile = Math.pow(smoothStep(0.56, 1.0, slice.t), 1.8);
      const shoulderProfile = Math.sin(slice.t * Math.PI);
      const sternProfile = Math.pow(1 - smoothStep(0.0, 0.34, slice.t), 1.4);
      const immersion = slice.immersion * pressureScale;

      if (shoulderProfile > 0.08 || bowProfile > 0.04) {
        const crossLength = Math.max(slice.beam * 0.98, beam * 0.26);
        const crossStrength = objectWaterSidePressureStrength * immersion *
          (shoulderProfile * 0.20 + bowProfile * 0.48 - sternProfile * 0.10);

        addObjectPressureSegment(
          slice.x - sideX * crossLength * 0.5,
          slice.z - sideZ * crossLength * 0.5,
          sideX,
          sideZ,
          crossLength,
          sliceThickness,
          crossStrength,
          crossStrength * 0.58,
          0.10 + shoulderProfile * 0.12
        );
      }

      for (const sideSign of [-1, 1]) {
        const railSide = sideSign < 0 ? slice.minSide : slice.maxSide;
        const rail = wakeAxesToWorld(slice.along, railSide, directionX, directionZ, sideX, sideZ);
        const sideScale = getTurnSideScale(turnAmount, sideSign, 0.72, 0.24);
        const railStrength = objectWaterSidePressureStrength * immersion * sideScale *
          (0.16 + bowProfile * 0.82 + shoulderProfile * 0.24);

        addObjectPressureSegment(
          rail.x,
          rail.z,
          trailX,
          trailZ,
          sliceThickness * (1.55 + bowProfile * 0.85),
          railWidth,
          railStrength,
          railStrength * 0.74,
          0.12 + shoulderProfile * 0.20
        );
      }
    }

    const bowCrestWidth = Math.max(beam * 1.05, railWidth * 3.2);
    const bowPressure = objectWaterBowPressureStrength *
      pressureScale *
      accelerationScale *
      waterSystemConfig.bowWaveStrength *
      (0.82 + leading.immersion * 0.42);
    addObjectPressureSegment(
      leading.x - sideX * bowCrestWidth * 0.5,
      leading.z - sideZ * bowCrestWidth * 0.5,
      sideX,
      sideZ,
      bowCrestWidth,
      Math.max(length * 0.085, railWidth * 1.7),
      bowPressure,
      bowPressure * 0.72,
      0.24
    );

    for (const sideSign of [-1, 1]) {
      const bowSide = getWakeSliceSidePoint(leading, directionX, directionZ, sideX, sideZ, sideSign);
      if (!bowSide) continue;

      const sideScale = getTurnSideScale(turnAmount, sideSign, 1.05, 0.30);
      const outside = sideScale > 1;
      const cuspX = trailX * Math.cos(wakeAngle) + sideX * Math.sin(wakeAngle) * sideSign;
      const cuspZ = trailZ * Math.cos(wakeAngle) + sideZ * Math.sin(wakeAngle) * sideSign;
      const cuspStrength = objectWaterDivergentStrength * pressureScale * sideScale;

      addObjectPressureSegment(
        bowSide.x,
        bowSide.z,
        cuspX,
        cuspZ,
        Math.max(length * (outside ? 0.82 : 0.68), beam * 2.2),
        Math.max(beam * (outside ? 0.075 : 0.055), 0.011),
        cuspStrength * 0.27,
        cuspStrength * 0.31,
        0.22
      );
    }

    const sternSuction = objectWaterSternSuctionStrength *
      pressureScale *
      waterSystemConfig.sternTurbulence *
      interaction.turbulenceStrength *
      (0.74 + trailing.immersion * 0.42);
    addObjectPressureSegment(
      trailing.x,
      trailing.z,
      trailX,
      trailZ,
      Math.max(length * 0.78, beam * 2.0),
      Math.max(beam * 0.30, railWidth * 2.4),
      -sternSuction * 0.74,
      sternSuction * 0.48,
      0.72
    );

    const propWash = objectWaterPropWashStrength *
      pressureScale *
      waterSystemConfig.propellerWash *
      interaction.turbulenceStrength;
    if (interaction.propellerPoints.length > 0) {
      const perPropellerStrength = propWash / Math.sqrt(interaction.propellerPoints.length);
      for (const propellerPoint of interaction.propellerPoints) {
        objectWaterPropellerPosition
          .set(propellerPoint.x, propellerPoint.y, propellerPoint.z)
          .applyMatrix4(interaction.root.matrixWorld);
        addObjectPressureSegment(
          objectWaterPropellerPosition.x,
          objectWaterPropellerPosition.z,
          trailX,
          trailZ,
          Math.max(length * 1.05, beam * 3.0),
          Math.max(beam * 0.22, 0.026),
          -perPropellerStrength * 0.38,
          perPropellerStrength,
          1.0
        );
      }
    } else {
      addObjectPressureSegment(
        trailing.x,
        trailing.z,
        trailX,
        trailZ,
        Math.max(length * 1.05, beam * 3.0),
        Math.max(beam * 0.22, 0.026),
        -propWash * 0.38,
        propWash,
        1.0
      );
    }

    for (const sideSign of [-1, 1]) {
      const sideScale = getTurnSideScale(turnAmount, sideSign, 0.95, 0.28);
      const outside = sideScale > 1;
      const shoulderX = trailing.x + sideX * beam * 0.28 * sideSign;
      const shoulderZ = trailing.z + sideZ * beam * 0.28 * sideSign;
      const shoulderStrength = propWash * sideScale;

      addObjectPressureSegment(
        shoulderX,
        shoulderZ,
        trailX,
        trailZ,
        Math.max(length * (outside ? 0.92 : 0.76), beam * 2.5),
        Math.max(beam * (outside ? 0.085 : 0.065), 0.012),
        shoulderStrength * 0.22,
        shoulderStrength * 0.58,
        0.78
      );

      const cuspX = trailX * Math.cos(wakeAngle) + sideX * Math.sin(wakeAngle) * sideSign;
      const cuspZ = trailZ * Math.cos(wakeAngle) + sideZ * Math.sin(wakeAngle) * sideSign;
      addObjectPressureSegment(
        shoulderX,
        shoulderZ,
        cuspX,
        cuspZ,
        Math.max(length * (0.74 + turnMagnitude * (outside ? 0.18 : -0.04)), beam * 2.1),
        Math.max(beam * (outside ? 0.070 : 0.050), 0.010),
        objectWaterDivergentStrength * pressureScale * sideScale * 0.24,
        objectWaterDivergentStrength * pressureScale * sideScale * 0.28,
        0.24
      );
    }

    const lateralEnergy = clamp(
      Math.abs(interaction.lateralVelocity) * 1.8 +
      Math.abs(interaction.angularVelocity) * beam * 1.4,
      0,
      1
    );
    if (lateralEnergy > 0.002) {
      const outsideSign = Math.sign(turnAmount || interaction.angularVelocity || 1);
      const outsideX = trailing.x + sideX * beam * 0.46 * outsideSign;
      const outsideZ = trailing.z + sideZ * beam * 0.46 * outsideSign;
      addObjectPressureSegment(
        outsideX,
        outsideZ,
        sideX * outsideSign,
        sideZ * outsideSign,
        Math.max(beam * 0.72, 0.035),
        Math.max(length * 0.12, 0.018),
        objectWaterSidePressureStrength * pressureScale * lateralEnergy * 0.68,
        objectWaterSidePressureStrength * pressureScale * lateralEnergy * 0.84,
        0.52 * interaction.turbulenceStrength
      );
    }
  }

  function addContinuousHullPressure(interaction, contacts, slices, directionX, directionZ, sideX, sideZ, speedAmount, turnAmount) {
    if (slices.length === 0) return;

    if (interaction.isShip) {
      addShipHullPressure(
        interaction,
        contacts,
        slices,
        directionX,
        directionZ,
        sideX,
        sideZ,
        speedAmount,
        turnAmount
      );
      return;
    }

    const isHullWake = interaction.wakeShape === 'hull';
    const hasMotorWake = interaction.motorWake === true;
    const alignment = getObjectWakeHeadingAlignment(interaction, directionX, directionZ);
    const speedScale = speedAmount * (isHullWake ? 0.74 + alignment * 0.34 : 0.7) * (hasMotorWake ? 1 : 0.72);
    const length = contacts.wakeLength || contacts.length;
    const beam = contacts.wakeBeam || contacts.beam;
    const sliceThickness = Math.max(0.012, length / Math.max(8, slices.length) * (isHullWake ? 1.45 : 1.1));
    const sideWakeWidth = Math.max(
      isHullWake ? 0.010 : 0.016,
      Math.min(isHullWake ? 0.034 : 0.055, beam * (isHullWake ? 0.08 : 0.18))
    ) * interaction.radiusScale;
    const turnMagnitude = Math.min(1, Math.abs(turnAmount));

    for (const slice of slices) {
      const bowProfile = Math.pow(smoothStep(0.50, 1.0, slice.t), 1.55);
      const midProfile = Math.sin(slice.t * Math.PI);
      const sternProfile = Math.pow(1.0 - smoothStep(0.0, 0.42, slice.t), 1.35);
      const displacement = (bowProfile * 0.92 + midProfile * 0.32 - sternProfile * 0.45) *
        slice.immersion *
        speedScale *
        interaction.strengthScale;

      if (Math.abs(displacement) > 0.0001) {
        addObjectPressureSegment(
          slice.x,
          slice.z,
          sideX,
          sideZ,
          Math.max(slice.beam * 1.04, beam * 0.22),
          sliceThickness,
          displacement * objectWaterSidePressureStrength,
          displacement * objectWaterSidePressureStrength * 0.72,
          midProfile * 0.34 + sternProfile * 0.28
        );
      }

      for (const sideSign of [-1, 1]) {
        const railSide = sideSign < 0 ? slice.minSide : slice.maxSide;
        const rail = wakeAxesToWorld(slice.along, railSide, directionX, directionZ, sideX, sideZ);
        const sideScale = getTurnSideScale(turnAmount, sideSign, 1.55, 0.38);
        const railStrength = (0.24 + bowProfile * 0.9 + midProfile * 0.35) *
          slice.immersion *
          speedScale *
          interaction.strengthScale *
          sideScale;

        addObjectPressureSegment(
          rail.x,
          rail.z,
          -directionX,
          -directionZ,
          sliceThickness * (isHullWake ? 2.4 : 1.2),
          sideWakeWidth,
          railStrength * objectWaterSidePressureStrength,
          railStrength * objectWaterSidePressureStrength * 0.82,
          0.28 + midProfile * 0.32
        );
      }
    }

    const leading = slices[slices.length - 1];
    const trailing = slices[0];
    const bowRam = objectWaterBowPressureStrength * interaction.strengthScale * speedScale * (0.72 + leading.immersion * 0.5) * (hasMotorWake ? 1 : 0.72);
    const bowWidth = Math.max(beam * (isHullWake ? 0.42 : 0.68), sideWakeWidth * 2.8);
    const bowLength = Math.max(length * (isHullWake ? 0.42 : 0.28), beam * 0.8);

    addObjectPressureSegment(
      leading.x,
      leading.z,
      -directionX,
      -directionZ,
      bowLength,
      bowWidth,
      bowRam,
      bowRam * 0.78,
      0.45
    );

    for (const sideSign of [-1, 1]) {
      const bowSide = getWakeSliceSidePoint(leading, directionX, directionZ, sideX, sideZ, sideSign);
      if (!bowSide) continue;

      const sideScale = getTurnSideScale(turnAmount, sideSign, 1.85, 0.4);
      const outside = sideScale > 1;
      const bowArmStrength = objectWaterDivergentStrength * interaction.strengthScale * speedScale * sideScale * (hasMotorWake ? 1.2 : 0.56);
      const bowArmLength = Math.max(length * (isHullWake ? 1.55 : 0.68), beam * (isHullWake ? 3.2 : 1.15)) * (1 + turnMagnitude * (outside ? 0.62 : -0.12));
      const bowArmWidth = Math.max(sideWakeWidth * (outside ? 1.1 : 0.62), beam * (isHullWake ? 0.038 : 0.12));

      addObjectDivergentPressure(
        bowSide,
        -directionX,
        -directionZ,
        sideX,
        sideZ,
        sideSign,
        bowArmLength,
        bowArmWidth,
        bowArmStrength
      );
    }

    const sternWash = objectWaterSternSuctionStrength * interaction.strengthScale * speedScale * (0.62 + trailing.immersion * 0.6) * (hasMotorWake ? 1 : 0.42);
    const sternLength = Math.max(length * (isHullWake ? 0.72 : 0.42), beam * (isHullWake ? 1.8 : 0.92)) * (1 + turnMagnitude * 0.14);
    const sternWidth = Math.max(beam * (isHullWake ? 0.28 : 0.58), sideWakeWidth * 3.2);

    addObjectPressureSegment(
      trailing.x,
      trailing.z,
      -directionX,
      -directionZ,
      sternLength,
      sternWidth,
      -sternWash,
      sternWash * 0.68,
      hasMotorWake ? 1.0 : 0.42
    );

    if (hasMotorWake) {
      const propWash = objectWaterPropWashStrength * interaction.strengthScale * speedScale;
      const washLength = Math.max(length * (isHullWake ? 0.95 : 0.62), beam * (isHullWake ? 2.25 : 1.25)) * (1 + turnMagnitude * 0.14);
      const washWidth = Math.max(beam * (isHullWake ? 0.18 : 0.32), sideWakeWidth * 2.4);
      const shoulderWidth = Math.max(sideWakeWidth * 0.72, beam * (isHullWake ? 0.035 : 0.08));

      addObjectPressureSegment(
        trailing.x,
        trailing.z,
        -directionX,
        -directionZ,
        washLength,
        washWidth,
        -propWash * (isHullWake ? 0.46 : 0.28),
        propWash * (isHullWake ? 0.94 : 0.48),
        1.0
      );

      for (const sideSign of [-1, 1]) {
        const shoulder = wakeAxesToWorld(
          trailing.along,
          trailing.side + beam * (isHullWake ? 0.18 : 0.28) * sideSign,
          directionX,
          directionZ,
          sideX,
          sideZ
        );
        const sideScale = getTurnSideScale(turnAmount, sideSign, 1.35, 0.36);
        const outside = sideScale > 1;

        addObjectPressureSegment(
          shoulder.x,
          shoulder.z,
          -directionX,
          -directionZ,
          washLength * (outside ? 0.96 : 0.58),
          shoulderWidth * (outside ? 1.22 : 0.72),
          propWash * 0.34 * sideScale,
          propWash * 0.62 * sideScale,
          0.92
        );
      }
    }

    for (const sideSign of [-1, 1]) {
      const shoulderSide = sideSign < 0 ? trailing.minSide : trailing.maxSide;
      const shoulder = wakeAxesToWorld(trailing.along, shoulderSide, directionX, directionZ, sideX, sideZ);
      const sideScale = getTurnSideScale(turnAmount, sideSign, 1.9, 0.48);
      const outside = sideScale > 1;
      const divergentStrength = objectWaterDivergentStrength * interaction.strengthScale * speedScale * sideScale * (hasMotorWake ? 1 : 0.46);
      const divergentLength = Math.max(length * (isHullWake ? 0.95 : 0.48), beam * (isHullWake ? 2.1 : 0.95)) * (1 + turnMagnitude * (outside ? 0.52 : -0.12));
      const divergentWidth = Math.max(sideWakeWidth * (outside ? 1.05 : 0.56), beam * (isHullWake ? 0.045 : 0.13));

      addObjectDivergentPressure(
        shoulder,
        -directionX,
        -directionZ,
        sideX,
        sideZ,
        sideSign,
        divergentLength,
        divergentWidth,
        divergentStrength
      );
    }
  }

  function getWakeSternFromSlices(slices) {
    if (slices.length === 0) return null;
    return slices[0];
  }

  function getWakeBowFromSlices(slices) {
    if (slices.length === 0) return null;
    return slices[slices.length - 1];
  }

  function getWakeSliceSidePoint(slice, directionX, directionZ, sideX, sideZ, sideSign) {
    if (!slice) return null;

    const side = sideSign < 0 ? slice.minSide : slice.maxSide;
    return wakeAxesToWorld(slice.along, side, directionX, directionZ, sideX, sideZ);
  }

  function offsetWakeSlices(slices, offsetX, offsetZ, directionX, directionZ, sideX, sideZ) {
    if (offsetX === 0 && offsetZ === 0) return slices;

    const alongOffset = offsetX * directionX + offsetZ * directionZ;
    const sideOffset = offsetX * sideX + offsetZ * sideZ;

    return slices.map((slice) => ({
      ...slice,
      x: slice.x + offsetX,
      z: slice.z + offsetZ,
      along: slice.along + alongOffset,
      side: slice.side + sideOffset,
      minSide: slice.minSide + sideOffset,
      maxSide: slice.maxSide + sideOffset,
    }));
  }

  function addWakeHistoryPoint(interaction, source, directionX, directionZ, sideX, sideZ, length, beam, speedAmount, turnAmount, time, emitterType, sideSign = 0) {
    if (!source || speedAmount <= 0.001) return;

    const history = interaction.wakeHistory;
    const key = emitterType + ':' + sideSign;
    const last = interaction.lastWakeHistoryByType[key];
    const minDistance = Math.max(wakeHistoryMinSampleDistance, length * 0.035);

    if (last) {
      const dx = source.x - last.x;
      const dz = source.z - last.z;
      if (Math.sqrt(dx * dx + dz * dz) < minDistance) {
        return;
      }
    }

    const point = {
      x: source.x,
      z: source.z,
      directionX,
      directionZ,
      sideX,
      sideZ,
      length,
      beam,
      speed: speedAmount,
      time,
      turnAmount,
      emitterType,
      sideSign,
      strength: interaction.strengthScale,
      radiusScale: interaction.radiusScale,
      hullWake: interaction.wakeShape === 'hull',
      motorWake: interaction.motorWake === true,
    };

    history.push(point);
    interaction.lastWakeHistoryByType[key] = point;

    const maxHistoryPoints = point.hullWake ? wakeHistoryMaxFramePoints : wakeHistoryMaxPoints;
    while (history.length > maxHistoryPoints) {
      const removed = history.shift();
      if (removed) {
        const removedKey = removed.emitterType + ':' + removed.sideSign;
        if (interaction.lastWakeHistoryByType[removedKey] === removed) {
          delete interaction.lastWakeHistoryByType[removedKey];
        }
      }
    }
  }

  function renderWakeHistoryPoint(point, time) {
    const age = time - point.time;
    if (age < 0 || age > wakeHistoryLifetime) return false;

    const ageFade = 1 - smoothStep(wakeHistoryLifetime * 0.42, wakeHistoryLifetime, age);
    const youngFade = smoothStep(0.0, 0.28, age);
    const fade = ageFade * (0.55 + youngFade * 0.45);
    if (fade <= 0.001) return false;

    const speed = point.speed;
    const length = point.length;
    const beam = point.beam;
    const hullScale = point.hullWake ? 1 : 0.58;
    const motorScale = point.motorWake ? 1 : 0.42;
    const turnMagnitude = Math.min(1, Math.abs(point.turnAmount));
    const centerLength = Math.max(length * (point.hullWake ? 0.68 : 0.46), beam * (point.hullWake ? 1.7 : 0.95));
    const centerWidth = Math.max(beam * (point.hullWake ? 0.18 : 0.25), 0.018) * point.radiusScale;
    const armLength = Math.max(length * (point.hullWake ? 0.9 : 0.55), beam * (point.hullWake ? 2.0 : 1.1));
    const armWidth = Math.max(beam * (point.hullWake ? 0.038 : 0.075), 0.008) * point.radiusScale;
    const fixedFrame = getWakePointFrame(point);
    const trailX = fixedFrame.trailX;
    const trailZ = fixedFrame.trailZ;
    const fixedSideX = fixedFrame.sideX;
    const fixedSideZ = fixedFrame.sideZ;
    const centerStrength = wakeHistoryCentralStrength * point.strength * speed * fade * hullScale;

    if (point.emitterType === wakeEmitterBowLeft || point.emitterType === wakeEmitterBowRight) {
      const sideSign = point.sideSign || (point.emitterType === wakeEmitterBowLeft ? -1 : 1);
      const sideScale = getTurnSideScale(point.turnAmount, sideSign, 1.85, 0.42);
      const bowArmStrength = wakeHistoryKelvinStrength * point.strength * speed * fade * sideScale * hullScale * (point.motorWake ? 1.35 : 0.58);
      const bowFoamStrength = wakeHistoryFoamStrength * point.strength * speed * fade * sideScale * hullScale * (point.motorWake ? 0.9 : 0.26);
      const armOrigin = {
        x: point.x,
        z: point.z,
      };

      addObjectDivergentPressure(
        armOrigin,
        trailX,
        trailZ,
        fixedSideX,
        fixedSideZ,
        sideSign,
        armLength * (1.05 + turnMagnitude * (sideScale > 1 ? 0.35 : 0.04)),
        Math.max(armWidth * (sideScale > 1 ? 0.95 : 0.58), beam * 0.024),
        bowArmStrength
      );

      addObjectPressureSegment(
        armOrigin.x,
        armOrigin.z,
        trailX * Math.cos(objectWaterKelvinAngle) + fixedSideX * Math.sin(objectWaterKelvinAngle) * sideSign,
        trailZ * Math.cos(objectWaterKelvinAngle) + fixedSideZ * Math.sin(objectWaterKelvinAngle) * sideSign,
        armLength * (sideScale > 1 ? 0.92 : 0.58),
        Math.max(armWidth * 0.92, beam * 0.032),
        bowFoamStrength * 0.48,
        bowFoamStrength * 0.66,
        0.72 * fade
      );

      return true;
    }

    addObjectPressureSegment(
      point.x,
      point.z,
      trailX,
      trailZ,
      centerLength * (1 + turnMagnitude * 0.12),
      centerWidth * (1 + turnMagnitude * 0.22),
      -centerStrength * 0.46 * motorScale,
      centerStrength * 0.82 * motorScale,
      (point.motorWake ? 0.92 : 0.34) * fade
    );

    if (!point.motorWake) {
      return true;
    }

    for (const sideSign of [-1, 1]) {
      const sideScale = getTurnSideScale(point.turnAmount, sideSign, 1.7, 0.45);
      const outside = sideScale > 1;
      const shoulderX = point.x + fixedSideX * beam * 0.2 * sideSign;
      const shoulderZ = point.z + fixedSideZ * beam * 0.2 * sideSign;
      const kelvinStrength = wakeHistoryKelvinStrength * point.strength * speed * fade * sideScale * hullScale;

      addObjectDivergentPressure(
        { x: shoulderX, z: shoulderZ },
        trailX,
        trailZ,
        fixedSideX,
        fixedSideZ,
        sideSign,
        armLength * (1 + turnMagnitude * (outside ? 0.38 : -0.08)),
        armWidth * (1 + turnMagnitude * (outside ? 0.24 : -0.12)),
        kelvinStrength
      );

      const foamShoulderX = point.x + fixedSideX * beam * 0.24 * sideSign;
      const foamShoulderZ = point.z + fixedSideZ * beam * 0.24 * sideSign;
      const shoulderStrength = wakeHistoryFoamStrength * point.strength * speed * fade * sideScale * hullScale;

      addObjectPressureSegment(
        foamShoulderX,
        foamShoulderZ,
        trailX,
        trailZ,
        centerLength * 0.68,
        Math.max(armWidth * 0.8, beam * 0.028),
        shoulderStrength * 0.42,
        shoulderStrength * 0.74,
        0.86 * fade
      );
    }

    return true;
  }

  function renderWakeHistory(interaction, time) {
    const history = interaction.wakeHistory;
    if (history.length === 0) return;

    let writeIndex = 0;
    for (let i = 0; i < history.length; i++) {
      const point = history[i];
      if (renderWakeHistoryPoint(point, time)) {
        history[writeIndex++] = point;
      }
    }

    history.length = writeIndex;
    interaction.lastWakeHistoryByType = {};
    for (const point of history) {
      interaction.lastWakeHistoryByType[point.emitterType + ':' + point.sideSign] = point;
    }
  }

  function getObjectWakeDimensions(interaction, contacts) {
    const maxLength = interaction.maxWakeLength || contacts.length;
    const maxBeam = interaction.maxWakeBeam || contacts.beam;

    return {
      length: Math.min(contacts.length, maxLength * 1.12),
      beam: Math.min(contacts.beam, maxBeam * 1.35),
      maxLength,
      maxBeam,
    };
  }

  function getObjectWakeHeadingAlignment(interaction, directionX, directionZ) {
    if (!interaction.maxWakeLength || !interaction.maxWakeBeam) return 1;

    const heading = interaction.root.rotation.y - interaction.headingYawOffset;
    const headingX = Math.sin(heading);
    const headingZ = Math.cos(heading);

    return Math.abs(headingX * directionX + headingZ * directionZ);
  }

  function updateObjectWakeTurn(interaction, directionX, directionZ) {
    if (!interaction.hasWakeDirection) {
      interaction.hasWakeDirection = true;
      interaction.wakeDirectionX = directionX;
      interaction.wakeDirectionZ = directionZ;
      interaction.wakeTurnAmount = 0;
      return 0;
    }

    const turnAmount = clamp(
      (interaction.wakeDirectionX * directionZ - interaction.wakeDirectionZ * directionX) * wakeTurnSensitivity,
      -1,
      1
    );

    interaction.wakeTurnAmount = interaction.wakeTurnAmount * 0.62 + turnAmount * 0.38;
    interaction.wakeDirectionX = interaction.wakeDirectionX * 0.72 + directionX * 0.28;
    interaction.wakeDirectionZ = interaction.wakeDirectionZ * 0.72 + directionZ * 0.28;

    const length = Math.sqrt(
      interaction.wakeDirectionX * interaction.wakeDirectionX +
      interaction.wakeDirectionZ * interaction.wakeDirectionZ
    );

    if (length > 0.0001) {
      interaction.wakeDirectionX /= length;
      interaction.wakeDirectionZ /= length;
    }

    return interaction.wakeTurnAmount;
  }

  function getTurnSideScale(turnAmount, sideSign, outsideBoost = 0.8, insideDamp = 0.28) {
    const turnMagnitude = Math.min(1, Math.abs(turnAmount));
    if (turnMagnitude < 0.001) return 1;

    const outside = Math.sign(turnAmount) === sideSign;
    return outside
      ? 1 + turnMagnitude * outsideBoost
      : 1 - turnMagnitude * insideDamp;
  }

  function writeObjectWaterInteraction(
    interaction,
    directionX,
    directionZ,
    speedAmount = 1,
    turnAmount = 0,
    time = simulationTime,
    offsetX = 0,
    offsetZ = 0,
    recordHistory = true
  ) {
    const sideX = -directionZ;
    const sideZ = directionX;
    const contacts = collectObjectWaterContacts(interaction, directionX, directionZ, sideX, sideZ);
    if (!contacts) return;

    const dimensions = getObjectWakeDimensions(interaction, contacts);
    contacts.wakeLength = dimensions.length;
    contacts.wakeBeam = dimensions.beam;

    const isHullWake = interaction.wakeShape === 'hull';
    const slices = buildObjectWaterSlices(
      contacts,
      directionX,
      directionZ,
      sideX,
      sideZ,
      isHullWake ? 22 : 9
    );
    const shiftedSlices = offsetWakeSlices(slices, offsetX, offsetZ, directionX, directionZ, sideX, sideZ);
    const stern = getWakeSternFromSlices(shiftedSlices);
    const bow = getWakeBowFromSlices(shiftedSlices);
    const bowLeft = getWakeSliceSidePoint(bow, directionX, directionZ, sideX, sideZ, -1);
    const bowRight = getWakeSliceSidePoint(bow, directionX, directionZ, sideX, sideZ, 1);

    addContinuousHullPressure(
      interaction,
      contacts,
      shiftedSlices,
      directionX,
      directionZ,
      sideX,
      sideZ,
      speedAmount,
      turnAmount
    );

    addShipWakeFoam(
      interaction,
      contacts,
      shiftedSlices,
      directionX,
      directionZ,
      sideX,
      sideZ,
      speedAmount,
      turnAmount
    );

    if (!recordHistory || interaction.isShip) return;

    addWakeHistoryPoint(
      interaction,
      stern,
      directionX,
      directionZ,
      sideX,
      sideZ,
      dimensions.length,
      dimensions.beam,
      speedAmount,
      turnAmount,
      time,
      wakeEmitterSternCenter
    );
    addWakeHistoryPoint(
      interaction,
      bowLeft,
      directionX,
      directionZ,
      sideX,
      sideZ,
      dimensions.length,
      dimensions.beam,
      speedAmount,
      turnAmount,
      time,
      wakeEmitterBowLeft,
      -1
    );
    addWakeHistoryPoint(
      interaction,
      bowRight,
      directionX,
      directionZ,
      sideX,
      sideZ,
      dimensions.length,
      dimensions.beam,
      speedAmount,
      turnAmount,
      time,
      wakeEmitterBowRight,
      1
    );
  }

  function updateObjectWaterInteractions(deltaTime, time) {
    const dt = Math.max(1 / 240, deltaTime);

    clearObjectPressureField();
    clearWakeSourceField();

    for (const interaction of objectWaterInteractions) {
      const root = interaction.root;

      if (!root.visible) {
        root.getWorldPosition(interaction.previousPosition);
        interaction.velocityX = 0;
        interaction.velocityZ = 0;
        interaction.accelerationX = 0;
        interaction.accelerationZ = 0;
        interaction.angularVelocity = 0;
        interaction.previousYaw = root.rotation.y;
        interaction.lateralVelocity = 0;
        interaction.hasWakeDirection = false;
        interaction.wakeTurnAmount = 0;
        interaction.wakeHistory.length = 0;
        interaction.lastWakeHistoryByType = {};
        continue;
      }

      root.getWorldPosition(objectWaterPosition);
      objectWaterPreviousPosition.copy(interaction.previousPosition);

      const rawVelocityX = (objectWaterPosition.x - objectWaterPreviousPosition.x) / dt;
      const rawVelocityZ = (objectWaterPosition.z - objectWaterPreviousPosition.z) / dt;
      const response = 1 - Math.exp(-dt * objectWaterVelocityResponse);
      const decay = Math.exp(-dt * objectWaterVelocityDecay);
      const previousVelocityX = interaction.velocityX;
      const previousVelocityZ = interaction.velocityZ;

      interaction.velocityX = interaction.velocityX * decay + (rawVelocityX - interaction.velocityX) * response;
      interaction.velocityZ = interaction.velocityZ * decay + (rawVelocityZ - interaction.velocityZ) * response;
      const rawAccelerationX = (interaction.velocityX - previousVelocityX) / dt;
      const rawAccelerationZ = (interaction.velocityZ - previousVelocityZ) / dt;
      const accelerationResponse = 1 - Math.exp(-dt * 8.0);
      interaction.accelerationX += (rawAccelerationX - interaction.accelerationX) * accelerationResponse;
      interaction.accelerationZ += (rawAccelerationZ - interaction.accelerationZ) * accelerationResponse;
      interaction.previousVelocityX = previousVelocityX;
      interaction.previousVelocityZ = previousVelocityZ;

      const currentYaw = root.rotation.y;
      const rawAngularVelocity = shortestAngleDelta(interaction.previousYaw, currentYaw) / dt;
      interaction.angularVelocity += (rawAngularVelocity - interaction.angularVelocity) * response;
      interaction.previousYaw = currentYaw;
      interaction.previousPosition.copy(objectWaterPosition);

      const velocityLength = Math.sqrt(
        interaction.velocityX * interaction.velocityX +
        interaction.velocityZ * interaction.velocityZ
      );
      const heading = currentYaw - interaction.headingYawOffset;
      const headingX = Math.sin(heading);
      const headingZ = Math.cos(heading);
      const headingSideX = -headingZ;
      const headingSideZ = headingX;
      interaction.lateralVelocity = interaction.velocityX * headingSideX + interaction.velocityZ * headingSideZ;
      const rotationalSpeed = Math.abs(interaction.angularVelocity) * Math.max(0.01, interaction.maxWakeBeam || 0.1) * 0.5;
      const effectiveVelocity = Math.max(velocityLength, rotationalSpeed);

      if (effectiveVelocity < objectWaterMinVelocity) {
        interaction.hasWakeDirection = false;
        interaction.wakeTurnAmount *= 0.85;
        if (!interaction.isShip) renderWakeHistory(interaction, time);
        continue;
      }

      const speedAmount = smoothStep(objectWaterMinVelocity, objectWaterFullWakeVelocity, effectiveVelocity);
      if (speedAmount <= 0.001) {
        if (!interaction.isShip) renderWakeHistory(interaction, time);
        continue;
      }

      const directionX = velocityLength > objectWaterMinVelocity ? interaction.velocityX / velocityLength : headingX;
      const directionZ = velocityLength > objectWaterMinVelocity ? interaction.velocityZ / velocityLength : headingZ;
      const pathTurn = updateObjectWakeTurn(interaction, directionX, directionZ);
      const angularTurn = clamp(interaction.angularVelocity * 2.4, -1, 1);
      const lateralTurn = clamp(interaction.lateralVelocity / Math.max(effectiveVelocity, 0.001), -1, 1);
      const turnAmount = clamp(pathTurn * 0.55 + angularTurn * 0.34 + lateralTurn * 0.22, -1, 1);
      interaction.wakeTurnAmount = turnAmount;
      const frameMoveX = objectWaterPosition.x - objectWaterPreviousPosition.x;
      const frameMoveZ = objectWaterPosition.z - objectWaterPreviousPosition.z;
      const frameMoveDistance = Math.sqrt(frameMoveX * frameMoveX + frameMoveZ * frameMoveZ);
      const sweepSamples = interaction.isShip
        ? Math.max(1, Math.min(continuousWakeMaxFrameSamples, Math.ceil(frameMoveDistance / continuousWakeSampleSpacing)))
        : 1;

      root.updateMatrixWorld(true);
      for (let sampleIndex = 1; sampleIndex <= sweepSamples; sampleIndex++) {
        const blend = sampleIndex / sweepSamples;
        const sampleX = objectWaterPreviousPosition.x + frameMoveX * blend;
        const sampleZ = objectWaterPreviousPosition.z + frameMoveZ * blend;
        const sampleTime = time - dt * (1 - blend);

        writeObjectWaterInteraction(
          interaction,
          directionX,
          directionZ,
          speedAmount,
          turnAmount,
          sampleTime,
          sampleX - objectWaterPosition.x,
          sampleZ - objectWaterPosition.z,
          true
        );
      }
      if (!interaction.isShip) renderWakeHistory(interaction, time);
    }

    updateWaveEmitters(time);
    finalizeObjectPressureField();
    objectPressureTexture.needsUpdate = true;
    wakeSourceTexture.needsUpdate = true;
  }

  // Main rendering loop
  function animate() {
    const dispatchTime = performance.now();
    if (
      renderRateLimit > 0 &&
      previousRenderDispatchTime !== null &&
      dispatchTime - previousRenderDispatchTime < 1000 / renderRateLimit - 0.5
    ) {
      window.requestAnimationFrame(animate);
      return;
    }
    previousRenderDispatchTime = dispatchTime;

    const frameCpuStart = performance.now();
    resizeRendererToCanvas();
    renderer.info.reset();
    gpuFrameTimer.begin();

    const now = performance.now() * 0.001;
    const realDelta = previousFrameTime === null ? 0 : Math.max(0, now - previousFrameTime);
    const deltaTime = Math.min(realDelta, maxSimulationDelta * waterSystemConfig.maxSubsteps);
    previousFrameTime = now;
    simulationTime += deltaTime;
    const time = simulationTime;
    const fixedTimeStep = waterSystemConfig.fixedTimeStep;
    const maxAccumulatedTime = fixedTimeStep * waterSystemConfig.maxSubsteps;
    simulationAccumulator = Math.min(simulationAccumulator + deltaTime, maxAccumulatedTime);
    sourceMotionAccumulator = Math.min(sourceMotionAccumulator + deltaTime, maxAccumulatedTime);

    updateAutonomousShip(time);
    floatingSquare.update(time);

    updateWaterBounceRects();
    let simulationSteps = Math.min(
      waterSystemConfig.maxSubsteps,
      Math.floor(simulationAccumulator / fixedTimeStep)
    );

    if (simulationSteps > 0) {
      updateObjectWaterInteractions(sourceMotionAccumulator, time);
      sourceMotionAccumulator = 0;

      for (let step = 0; step < simulationSteps; step++) {
        waterSimulation.stepSimulation(renderer, fixedTimeStep);
        foamSimulation.step(
          renderer,
          waterSimulation.texture.texture,
          wakeSourceTexture,
          time,
          fixedTimeStep
        );
        simulationAccumulator -= fixedTimeStep;
        simulationFrame++;
      }

      waterSimulation.updateNormals(renderer);
    }

    const waterTexture = waterSimulation.texture.texture;
    const spherePoint = {
      x: floatingSphere.mesh.position.x,
      z: floatingSphere.mesh.position.z,
    };
    const shipProbePoints = getShipWaterProbePoints();
    const probePoints = [
      spherePoint,
      shipProbePoints.center,
      shipProbePoints.bow,
      shipProbePoints.stern,
      shipProbePoints.left,
      shipProbePoints.right,
    ];
    const probeHeights = sampleTotalWaterHeights(probePoints, waterTexture, time);
    floatingSphere.update(probeHeights[0]);
    cargoShip.update({
      center: probeHeights[1],
      bow: probeHeights[2],
      stern: probeHeights[3],
      left: probeHeights[4],
      right: probeHeights[5],
    }, time);

    const debugMode = debugViewModes[debugView];
    if (debugMode && debugMode.field) {
      const debugTexture = debugMode.field === 'water'
        ? waterTexture
        : debugMode.field === 'foam'
          ? foamSimulation.texture.texture
          : wakeSourceTexture;
      renderer.setRenderTarget(null);
      renderer.setClearColor(black, 1);
      renderer.clear();
      debug.draw(renderer, debugTexture, debugMode.mode);
      gpuFrameTimer.end();
      updateDiagnostics(frameCpuStart, simulationSteps);
      renderFrame++;
      window.requestAnimationFrame(animate);
      return;
    }

    const qualityPreset = WATER_QUALITY_PRESETS[waterSystemConfig.quality];
    if (renderFrame % qualityPreset.causticsCadence === 0) {
      caustics.update(renderer, waterTexture, time);
    }

    const causticsTexture = caustics.texture.texture;
    updateObjectCausticUniforms(waterTexture, causticsTexture, time);
    if (renderFrame % qualityPreset.reflectionCadence === 0) {
      updateReflectionTexture();
    }

    renderer.setRenderTarget(null);
    renderer.setClearColor(white, 1);
    renderer.clear();

    pool.draw(renderer, waterTexture, causticsTexture, time);
    boundaryWalls.draw(renderer);
    floatingSphere.draw(renderer);
    waterVolume.draw(renderer);
    water.draw(renderer, waterTexture, foamSimulation.texture.texture, causticsTexture, time);

    gpuFrameTimer.end();
    updateDiagnostics(frameCpuStart, simulationSteps);
    renderFrame++;
    window.requestAnimationFrame(animate);
  }

  function clampPoolX(value) {
    return Math.min(waterHalfWidth * 0.98, Math.max(-waterHalfWidth * 0.98, value));
  }

  function clampPoolZ(value) {
    return Math.min(waterHalfLength * 0.98, Math.max(-waterHalfLength * 0.98, value));
  }

  function resetWaveEmitters() {
    for (const emitter of waveEmitters) {
      emitter.nextEmitTime = null;
    }
  }

  function normalizeDirection(direction) {
    const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);

    if (length < 0.0001) {
      return { x: 0, z: 1 };
    }

    return {
      x: direction.x / length,
      z: direction.z / length,
    };
  }

  function updateWaveEmitters(time) {
    if (!waveGeneratorEnabled) {
      resetWaveEmitters();
      return;
    }

    for (const emitter of waveEmitters) {
      if (!emitter.enabled) continue;

      if (emitter.type === waveEmitterTypeLine) {
        updateLineWaveEmitter(emitter, time);
      } else if (emitter.type === waveEmitterTypePoint) {
        updatePointWaveEmitter(emitter, time);
      }
    }
  }

  function shouldEmitWave(emitter, time) {
    const interval = 1 / Math.max(0.001, emitter.frequency);

    if (emitter.nextEmitTime === null) {
      emitter.nextEmitTime = time;
    }

    if (time < emitter.nextEmitTime) {
      return false;
    }

    emitter.nextEmitTime += interval;
    return true;
  }

  function updateLineWaveEmitter(emitter, time) {
    if (!shouldEmitWave(emitter, time)) return;

    const direction = normalizeDirection(emitter.direction);
    const side = { x: -direction.z, z: direction.x };
    const troughOffset = emitter.troughOffset || emitter.radius * 1.5;
    const crestWidth = Math.max(0.012, emitter.radius * 0.48);
    const crestLength = Math.max(0.02, emitter.width);
    const edgeFade = getWaterEdgeFade(emitter.origin.x, emitter.origin.z);
    if (edgeFade <= 0) return;

    addObjectPressureSegment(
      emitter.origin.x - side.x * crestLength * 0.5,
      emitter.origin.z - side.z * crestLength * 0.5,
      side.x,
      side.z,
      crestLength,
      crestWidth,
      emitter.strength * edgeFade,
      emitter.strength * 0.92 * edgeFade,
      0.18
    );
    addObjectPressureSegment(
      emitter.origin.x - direction.x * troughOffset - side.x * crestLength * 0.5,
      emitter.origin.z - direction.z * troughOffset - side.z * crestLength * 0.5,
      side.x,
      side.z,
      crestLength,
      crestWidth * 1.35,
      emitter.troughStrength * edgeFade,
      emitter.troughStrength * 0.72 * edgeFade,
      0.12
    );
  }

  function updatePointWaveEmitter(emitter, time) {
    if (!shouldEmitWave(emitter, time)) return;

    const direction = normalizeDirection(emitter.direction || { x: 0, z: 1 });
    const edgeFade = getWaterEdgeFade(emitter.origin.x, emitter.origin.z);
    if (edgeFade <= 0) return;

    addObjectPressureSegment(
      emitter.origin.x - direction.x * emitter.radius,
      emitter.origin.z - direction.z * emitter.radius,
      direction.x,
      direction.z,
      emitter.radius * 2.1,
      emitter.radius * 0.82,
      emitter.strength * edgeFade,
      emitter.strength * 0.85 * edgeFade,
      0.22
    );
  }

  function onMouseMove(event) {
    if (isRotatingPool) {
      const dx = event.clientX - previousMouseX;
      const dy = event.clientY - previousMouseY;

      previousMouseX = event.clientX;
      previousMouseY = event.clientY;

      cameraSpherical.theta -= dx * 0.006;
      cameraSpherical.phi = Math.min(
        Math.PI * 0.47,
        Math.max(Math.PI * 0.12, cameraSpherical.phi - dy * 0.006)
      );
      updateCameraFromOrbit();
      return;
    }

    if (!draggedVessel) return;

    const point = getPointerWaterPoint(event);
    if (!point) return;

    event.preventDefault();
    const targetPoint = getOffsetWaterPoint(point);

    draggedVessel.moveToWaterPoint(targetPoint);
  }

  function onMouseDown(event) {
    if (event.button === 2) {
      event.preventDefault();
      isRotatingPool = true;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
      return;
    }

    if (event.button !== 0) return;
    if (!hasVisibleVessel()) return;

    const vessel = pickVessel(event);
    if (!vessel) return;

    const point = getPointerWaterPoint(event);
    if (!point) return;

    event.preventDefault();
    draggedVessel = vessel;
    if (draggedVessel === cargoShip) {
      resetShipAutopilotState();
    }
    const vesselPoint = getVesselPoint(draggedVessel);
    draggedVesselOffset = {
      x: point.x - vesselPoint.x,
      z: point.z - vesselPoint.z,
    };
  }

  function onMouseUp(event) {
    if (event.button === 2) {
      isRotatingPool = false;
    }

    if (event.button === 0) {
      if (draggedVessel === cargoShip) {
        resetShipAutopilotState();
      }
      draggedVessel = null;
      draggedVesselOffset = { x: 0, z: 0 };
    }
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  function onWheel(event) {
    event.preventDefault();
    const zoomFactor = Math.exp(event.deltaY * 0.001);
    cameraSpherical.radius *= zoomFactor;
    updateCameraFromOrbit();
  }

  function resetFrameClock() {
    previousFrameTime = null;
    previousRenderDispatchTime = null;
    simulationAccumulator = 0;
    sourceMotionAccumulator = 0;
  }

  function onPageFocusChange() {
    resetFrameClock();
    cargoShip.requestFloatReset();
  }

  const loaded = [
    waterSimulation.loaded,
    foamSimulation.loaded,
    waterHeightProbe.loaded,
    caustics.loaded,
    water.loaded,
    pool.loaded,
    cargoShip.loaded,
    debug.loaded,
  ];

  Promise.all(loaded).then(() => {
    foamSimulation.clear(renderer);
    setControlValue(buoyancySlider, buoyancyValue, Number(buoyancySlider.value));
    setControlValue(shipBuoyancySlider, shipBuoyancyValue, Number(shipBuoyancySlider.value));
    setControlValue(shipSpeedSlider, shipSpeedValue, shipAutopilotSpeed);
    setControlValue(waveAmplitudeSlider, waveAmplitudeValue, oceanWaveStrength);
    setControlValue(waveFrequencySlider, waveFrequencyValue, oceanWaveFrequency);
    setControlValue(waveSpeedSlider, waveSpeedValue, oceanWaveSpeed);
    setControlValue(waveSharpnessSlider, waveSharpnessValue, oceanWaveSharpness);
    setControlValue(generatorFrequencySlider, generatorFrequencyValue, primaryWaveEmitter.frequency);
    setControlValue(generatorStrengthSlider, generatorStrengthValue, primaryWaveEmitter.strength);
    setControlValue(generatorWidthSlider, generatorWidthValue, primaryWaveEmitter.width);
    setControlValue(generatorRadiusSlider, generatorRadiusValue, primaryWaveEmitter.radius);
    setControlValue(generatorZSlider, generatorZValue, primaryWaveEmitter.origin.z);
    setControlValue(wakeHeightSlider, wakeHeightValue, objectWakeHeightScale);
    setControlValue(rippleLengthSlider, rippleLengthValue, rippleDistance);
    setControlValue(reflectionStrengthSlider, reflectionStrengthValue, reflectionStrength);
    setControlValue(waterOpacitySlider, waterOpacityValue, waterOpacity);
    setControlValue(shadowStrengthSlider, shadowStrengthValue, shadowStrength);
    setControlValue(waterTextureOpacitySlider, waterTextureOpacityValue, waterTextureOpacity);
    setControlValue(waterTextureFrequencySlider, waterTextureFrequencyValue, waterTextureFrequency);
    setControlValue(windSpeedSlider, windSpeedValue, waterSystemConfig.windSpeed);
    setControlValue(windDirectionSlider, windDirectionValue, waterSystemConfig.windDirection * 180 / Math.PI);
    setControlValue(swellAmplitudeSlider, swellAmplitudeValue, waterSystemConfig.swellAmplitude);
    setControlValue(choppinessSlider, choppinessValue, waterSystemConfig.choppiness);
    setControlValue(nearWakeLengthSlider, nearWakeLengthValue, waterSystemConfig.nearWakeLength);
    setControlValue(farWakeLifetimeSlider, farWakeLifetimeValue, waterSystemConfig.farWakeLifetime);
    setControlValue(propagationSpeedSlider, propagationSpeedValue, waterSystemConfig.wavePropagationSpeed);
    setControlValue(viscositySlider, viscosityValue, waterSystemConfig.viscosity);
    setControlValue(foamThresholdSlider, foamThresholdValue, waterSystemConfig.foamGenerationThreshold);
    setControlValue(foamDecaySlider, foamDecayValue, waterSystemConfig.foamDecay);
    setControlValue(foamAdvectionSlider, foamAdvectionValue, waterSystemConfig.foamAdvectionSpeed);
    setControlValue(turbulenceSlider, turbulenceValue, waterSystemConfig.turbulenceIntensity);
    setControlValue(hullImpulseSlider, hullImpulseValue, waterSystemConfig.hullImpulseStrength);
    setControlValue(bowStrengthSlider, bowStrengthValue, waterSystemConfig.bowWaveStrength);
    setControlValue(sternTurbulenceSlider, sternTurbulenceValue, waterSystemConfig.sternTurbulence);
    setControlValue(propellerWashSlider, propellerWashValue, waterSystemConfig.propellerWash);
    waterColorInput.value = '#' + waterSystemConfig.waterColor.getHexString();
    absorptionColorInput.value = '#' + waterSystemConfig.absorption.getHexString();
    fixedStepSelect.value = String(Math.round(1 / waterSystemConfig.fixedTimeStep));
    setToggleButtonState(toggleSphereButton, floatingSphere.visible);
    setToggleButtonState(toggleShipButton, cargoShip.visible);
    setToggleButtonState(toggleSquareButton, floatingSquare.visible);
    updateShipMovementModeButtons();
    updateQualityButtons();
    setDebugView('off');
    setToggleButtonState(toggleFftWavesButton, fftWavesEnabled > 0);
    setToggleButtonState(toggleWaveGeneratorButton, waveGeneratorEnabled);
    setToggleButtonState(toggleWallsButton, wallsEnabled);
    setToggleButtonState(toggleObjectFoamButton, objectFoamEnabled > 0);
    setToggleButtonState(toggleWaveFoamButton, waveFoamEnabled > 0);
    setToggleButtonState(toggleExtraFoamButton, extraFoamEnabled > 0);
    setToggleButtonState(toggleFoamTextureButton, foamMottleEnabled > 0);
    setToggleButtonState(toggleWaveCausticsButton, waveCausticsEnabled > 0);
    setToggleButtonState(toggleWaterTextureButton, waterImageTextureEnabled > 0);
    setToggleButtonState(toggleWireframeButton, wireframeEnabled);
    applyWireframeMode();
    updateFoamUniforms();

    canvas.addEventListener('mousemove', { handleEvent: onMouseMove });
    canvas.addEventListener('mousedown', { handleEvent: onMouseDown });
    canvas.addEventListener('wheel', { handleEvent: onWheel }, { passive: false });
    window.addEventListener('mouseup', { handleEvent: onMouseUp });
    canvas.addEventListener('contextmenu', { handleEvent: onContextMenu });
    window.addEventListener('resize', resizeRendererToCanvas);
    window.addEventListener('blur', resetFrameClock);
    window.addEventListener('focus', onPageFocusChange);
    document.addEventListener('visibilitychange', onPageFocusChange);

    animate();
  });

});
