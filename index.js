const canvas = document.getElementById('canvas');
const buoyancySlider = document.getElementById('buoyancy');
const buoyancyValue = document.getElementById('buoyancy-value');
const shipBuoyancySlider = document.getElementById('ship-buoyancy');
const shipBuoyancyValue = document.getElementById('ship-buoyancy-value');
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
const toggleSphereButton = document.getElementById('toggle-sphere');
const toggleShipButton = document.getElementById('toggle-ship');
const shipModeRandomButton = document.getElementById('ship-mode-random');
const shipModeCircleButton = document.getElementById('ship-mode-circle');
const shipModeStoppedButton = document.getElementById('ship-mode-stopped');
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
const toggleWaterTextureButton = document.getElementById('toggle-water-texture');
const toggleWireframeButton = document.getElementById('toggle-wireframe');

const width = canvas.width;
const height = canvas.height;
const waterExtent = 2.5;
const wallExtent = 2.0;
const maxWaterBounceObjects = 16;

// Lower values make wake waves fade sooner. Higher values let them travel farther.
let rippleDistance = Number(rippleLengthSlider.value);
let reflectionStrength = Number(reflectionStrengthSlider.value);
let waterOpacity = Number(waterOpacitySlider.value);
const wakeHeightRecovery = 0.992;
const maxWakeHeight = 5;
let oceanWaveStrength = Number(waveAmplitudeSlider.value);
let oceanWaveFrequency = Number(waveFrequencySlider.value);
let oceanWaveSpeed = Number(waveSpeedSlider.value);
let oceanWaveSharpness = Number(waveSharpnessSlider.value);
let objectWakeHeightScale = Number(wakeHeightSlider.value);
const wakeWaveStrength = 0.75;
const normalFoamHeightThreshold = 0;
const normalFoamHeightSoftness = 0.03;
const normalFoamFromHeightStrength = 1.25;
let foamHeightThreshold = normalFoamHeightThreshold;
let foamHeightSoftness = normalFoamHeightSoftness;
let foamFromHeightStrength = normalFoamFromHeightStrength;
let objectFoamEnabled = 1;
let waveFoamEnabled = 0;
let extraFoamEnabled = 0;
let foamMottleEnabled = 1;
let waterMottleEnabled = 0;
let waterImageTextureEnabled = 1;
let waterTextureEnabled = 1;
let wireframeEnabled = false;
let fftWavesEnabled = 1;
let waveGeneratorEnabled = true;
let wallsEnabled = true;
const extraFoamRippleBoost = 0;
const wakeDropCount = 5;
const wakeTrailSpacing = 0.055;
const wakeSpread = 0.72;
const wakeStrength = 0.018;
const wakeTroughStrength = -0.014;
const wakeMinMovement = 0.006;
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
const shipTrackWakeCount = 8;
const shipTrackWakeSpacing = 0.06;
const shipTrackWakeStrength = 0.018;
const shipTurnWakeStrength = 0.035;
const shipTurnWakeSensitivity = 5.5;
const shipWakeBowOffset = 0.3;
const shipWakeSternOffset = 0.28;
const shipWakeBeam = 0.18;
const shipWakeHullSamples = 4;
const normalShipWakeMinVisibleSpeed = 0.28;
const extraFoamShipWakeMinVisibleSpeed = 0.42;
let shipWakeMinVisibleSpeed = normalShipWakeMinVisibleSpeed;
const shipWakeGeometrySideBins = 11;
const shipWakeGeometryLengthBins = 6;
const shipWakePressureStrength = -0.010;
const shipWakeEmitterStrength = 0.010;
const shipWakeReferenceLength = shipWakeBowOffset + shipWakeSternOffset;
const shipWakeReferenceBeam = shipWakeBeam;
const shipModelYawOffset = 2*Math.PI;
const shipMovementYawOffset = Math.PI / 2;
const shipAutopilotSpeed = 0.18;
const shipAutopilotTurnBiasMax = 0.45;
const shipAutopilotTargetRadius = 0.12;
const shipAutopilotBounds = 2.0;
const shipAutopilotTurnChangeMinTime = 1.8;
const shipAutopilotTurnChangeMaxTime = 3.8;
const shipAutopilotTurnSmoothness = 1.6;
const shipAutopilotHeadingSmoothness = 3.0;
const shipMovementModeRandom = 'random';
const shipMovementModeCircle = 'circle';
const shipMovementModeStopped = 'stopped';
const shipCircleCenter = { x: 0, z: 0 };
const shipCircleRadius = 1.35;
const shipCircleAngularSpeed = shipAutopilotSpeed / shipCircleRadius;
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
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
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
  renderer.setSize(width, height);
  renderer.autoClear = false;

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

  function registerWaterBounceObject(object) {
    object.userData.waterBounce = true;
  }

  function worldToWaterUv(value) {
    return value / (waterExtent * 2) + 0.5;
  }

  function updateWaterBounceRects() {
    let count = 0;

    objectScene.traverse((object) => {
      if (!object.userData.waterBounce || !object.visible || count >= maxWaterBounceObjects) return;

      waterBounceBounds.setFromObject(object);
      const minX = Math.max(-waterExtent, waterBounceBounds.min.x);
      const maxX = Math.min(waterExtent, waterBounceBounds.max.x);
      const minZ = Math.max(-waterExtent, waterBounceBounds.min.z);
      const maxZ = Math.min(waterExtent, waterBounceBounds.max.z);

      if (minX >= maxX || minZ >= maxZ) return;

      waterBounceRectValues[count].set(
        worldToWaterUv(minX),
        worldToWaterUv(minZ),
        worldToWaterUv(maxX),
        worldToWaterUv(maxZ)
      );
      count++;
    });

    if (waterSimulation && waterSimulation._updateMesh) {
      waterSimulation._updateMesh.material.uniforms['waterBounceCount'].value = count;
      waterSimulation._updateMesh.material.uniforms['waterBounceRects'].value = waterBounceRectValues;
    }
  }

  // Light direction
  const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

  const objectAmbient = new THREE.AmbientLight(0xffffff, 0.3);
  const objectLight = new THREE.DirectionalLight(0xffffff, 0.6);
  objectLight.position.set(light[0], light[1], light[2]);
  objectScene.add(objectAmbient);
  objectScene.add(objectLight);

  // Ray caster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let draggedVessel = null;
  let draggedVesselOffset = { x: 0, z: 0 };
  let isRotatingPool = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  const targetgeometry = new THREE.PlaneGeometry(waterExtent * 2, waterExtent * 2);
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
    'xpos.jpg', 'xneg.jpg',
    'ypos.jpg', 'ypos.jpg',
    'zpos.jpg', 'zneg.jpg',
  ]);

  const textureloader = new THREE.TextureLoader();

  const tiles = textureloader.load('tiles.jpg');
  const waterImageTexture = textureloader.load('images/textures/water.jpg');
  waterImageTexture.wrapS = THREE.RepeatWrapping;
  waterImageTexture.wrapT = THREE.RepeatWrapping;
  waterImageTexture.minFilter = THREE.LinearFilter;
  waterImageTexture.magFilter = THREE.LinearFilter;

  class WaterSimulation {

    constructor() {
      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

      this._geometry = new THREE.PlaneBufferGeometry(2, 2);

      this._textureA = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
      this._textureB = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
      this.texture = this._textureA;

      const shadersPromises = [
        loadFile('shaders/simulation/vertex.glsl'),
        loadFile('shaders/simulation/drop_fragment.glsl'),
        loadFile('shaders/simulation/normal_fragment.glsl'),
        loadFile('shaders/simulation/update_fragment.glsl'),
      ];

      this.loaded = Promise.all(shadersPromises)
          .then(([vertexShader, dropFragmentShader, normalFragmentShader, updateFragmentShader]) => {
        const dropMaterial = new THREE.RawShaderMaterial({
          uniforms: {
              center: { value: [0, 0] },
              radius: { value: 0 },
              strength: { value: 0 },
              texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: dropFragmentShader,
        });

        const normalMaterial = new THREE.RawShaderMaterial({
          uniforms: {
              delta: { value: [1 / 256, 1 / 256] },
              texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: normalFragmentShader,
        });

        const updateMaterial = new THREE.RawShaderMaterial({
          uniforms: {
              delta: { value: [1 / 256, 1 / 256] },
              rippleDistance: { value: rippleDistance },
              wakeHeightRecovery: { value: wakeHeightRecovery },
              maxWakeHeight: { value: maxWakeHeight },
              waterBounceCount: { value: 0 },
              waterBounceRects: { value: waterBounceRectValues },
              texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: updateFragmentShader,
        });

        this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
        this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
        this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
      });
    }

    // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
    addDrop(renderer, x, y, radius, strength) {
      this._dropMesh.material.uniforms['center'].value = [x, y];
      this._dropMesh.material.uniforms['radius'].value = radius;
      this._dropMesh.material.uniforms['strength'].value = strength;

      this._render(renderer, this._dropMesh);
    }

    stepSimulation(renderer) {
      this._updateMesh.material.uniforms['rippleDistance'].value = rippleDistance;
      this._render(renderer, this._updateMesh);
    }

    updateNormals(renderer) {
      this._render(renderer, this._normalMesh);
    }

    getHeightAt(renderer, x, z) {
      const pixel = new Float32Array(4);
      const px = Math.min(255, Math.max(0, Math.floor(((x / waterExtent) * 0.5 + 0.5) * 256)));
      const py = Math.min(255, Math.max(0, Math.floor(((z / waterExtent) * 0.5 + 0.5) * 256)));

      try {
        renderer.readRenderTargetPixels(this.texture, px, py, 1, 1, pixel);
        return pixel[0];
      } catch (error) {
        return 0;
      }
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
              waterExtent: { value: waterExtent },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });

        this._causticMesh = new THREE.Mesh(this._geometry, material);
      });
    }

    update(renderer, waterTexture) {
      this._causticMesh.material.uniforms['water'].value = waterTexture;

      renderer.setRenderTarget(this.texture);
      renderer.setClearColor(black, 0);
      renderer.clear();

      // TODO Camera is useless here, what should be done?
      renderer.render(this._causticMesh, this._camera);
    }

  }


  class Water {

    constructor() {
      this.geometry = new THREE.PlaneBufferGeometry(waterExtent * 2, waterExtent * 2, 280, 280);

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
              causticTex: { value: null },
              reflectionTexture: { value: reflectionTarget.texture },
              reflectionTextureMatrix: { value: reflectionTextureMatrix },
              reflectionStrength: { value: reflectionStrength },
              waterOpacity: { value: waterOpacity },
              time: { value: 0 },
              oceanWaveStrength: { value: oceanWaveStrength },
              oceanWaveFrequency: { value: oceanWaveFrequency },
              oceanWaveSpeed: { value: oceanWaveSpeed },
              oceanWaveSharpness: { value: oceanWaveSharpness },
              fftWavesEnabled: { value: fftWavesEnabled },
              wakeWaveStrength: { value: wakeWaveStrength },
              waterTextureEnabled: { value: waterTextureEnabled },
              waterImageTextureEnabled: { value: waterImageTextureEnabled },
              waterExtent: { value: waterExtent },
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
      });
    }

    draw(renderer, waterTexture, causticsTexture, time) {
      this.material.uniforms['water'].value = waterTexture;
      this.material.uniforms['causticTex'].value = causticsTexture;
      this.material.uniforms['time'].value = time;

      this.material.side = THREE.FrontSide;
      this.material.uniforms['underwater'].value = true;
      renderer.render(this.mesh, camera);

      this.material.side = THREE.BackSide;
      this.material.uniforms['underwater'].value = false;
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
        -waterExtent, 1, -waterExtent,
        -waterExtent, 1, waterExtent,
        waterExtent, 1, -waterExtent,
        waterExtent, 1, waterExtent
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
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });
        this._material.side = THREE.FrontSide;

        this._mesh = new THREE.Mesh(this._geometry, this._material);
      });
    }

    draw(renderer, waterTexture, causticsTexture) {
      this._material.uniforms['water'].value = waterTexture;
      this._material.uniforms['causticTex'].value = causticsTexture;

      renderer.render(this._mesh, camera);
    }

  }


  class WaterVolume {

    constructor() {
      this._geometry = new THREE.BufferGeometry();

      const vertices = new Float32Array([
        -waterExtent, -1, -waterExtent,
        -waterExtent, 0, -waterExtent,
        waterExtent, -1, -waterExtent,
        waterExtent, 0, -waterExtent,
        waterExtent, -1, -waterExtent,
        waterExtent, 0, -waterExtent,
        waterExtent, -1, waterExtent,
        waterExtent, 0, waterExtent,
        waterExtent, -1, waterExtent,
        waterExtent, 0, waterExtent,
        -waterExtent, -1, waterExtent,
        -waterExtent, 0, waterExtent,
        -waterExtent, -1, waterExtent,
        -waterExtent, 0, waterExtent,
        -waterExtent, -1, -waterExtent,
        -waterExtent, 0, -waterExtent
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

      const longWallGeometry = new THREE.BoxBufferGeometry(wallExtent * 2 + wallThickness * 2, wallHeight, wallThickness);
      const sideWallGeometry = new THREE.BoxBufferGeometry(wallThickness, wallHeight, wallExtent * 2);

      const northWall = new THREE.Mesh(longWallGeometry, material);
      northWall.position.set(0, wallY, -wallExtent - wallThickness * 0.5);
      const southWall = new THREE.Mesh(longWallGeometry, material);
      southWall.position.set(0, wallY, wallExtent + wallThickness * 0.5);
      const eastWall = new THREE.Mesh(sideWallGeometry, material);
      eastWall.position.set(wallExtent + wallThickness * 0.5, wallY, 0);
      const westWall = new THREE.Mesh(sideWallGeometry, material);
      westWall.position.set(-wallExtent - wallThickness * 0.5, wallY, 0);

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
      this.sphereShader = null;

      const geometry = new THREE.SphereBufferGeometry(this.radius, 48, 24);
      const material = new THREE.MeshPhongMaterial({
        color: 0xff6b35,
        shininess: 45,
        specular: 0x442211,
      });
      material.onBeforeCompile = (shader) => {
        shader.uniforms.waterLevel = { value: this.waterLevel };
        this.sphereShader = shader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vWorldPosition;'
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvec4 sphereWorldPosition = modelMatrix * vec4(transformed, 1.0);\nvWorldPosition = sphereWorldPosition.xyz;'
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          '#include <common>\nuniform float waterLevel;\nvarying vec3 vWorldPosition;'
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          [
            '#include <color_fragment>',
            'float submerged = smoothstep(waterLevel + 0.015, waterLevel - 0.015, vWorldPosition.y);',
            'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.03, 0.42, 0.62), submerged);',
            'diffuseColor.rgb *= mix(1.0, 0.72, submerged);'
          ].join('\n')
        );
      };

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(-0.5, this.radius * 0.25, 0.3);
      objectScene.add(this.mesh);

      const waterlineGeometry = new THREE.TorusBufferGeometry(1, 0.006, 8, 72);
      const waterlineMaterial = new THREE.MeshBasicMaterial({
        color: 0xd7f8ff,
        transparent: true,
        opacity: 0.85,
      });
      this.waterline = new THREE.Mesh(waterlineGeometry, waterlineMaterial);
      this.waterline.rotation.x = Math.PI / 2;
      this.waterline.visible = false;
      objectScene.add(this.waterline);

      const shadowGeometry = new THREE.CircleBufferGeometry(this.radius * 1.15, 48);
      const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      this.shadow.rotation.x = -Math.PI / 2;
      this.shadow.position.set(this.mesh.position.x, 0.004, this.mesh.position.z);
      objectScene.add(this.shadow);
    }

    setVisible(visible) {
      this.visible = visible;
      this.mesh.visible = visible;
      this.shadow.visible = visible;
      this.waterline.visible = false;
    }

    setBuoyancy(value) {
      this.buoyancy = value;
    }

    clampToPool() {
      this.mesh.position.x = Math.min(0.95, Math.max(-0.95, this.mesh.position.x));
      this.mesh.position.z = Math.min(0.95, Math.max(-0.95, this.mesh.position.z));
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
        this.mesh.position.y = this.waterLevel;
        this.clampToPool();
        this.updateShadow();
        this.updateWaterline();
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
      this.updateShadow();
      this.updateWaterline();
    }

    updateShadow() {
      if (!this.visible) {
        this.shadow.visible = false;
        return;
      }

      this.shadow.visible = true;
      const heightAboveWater = Math.max(0, this.mesh.position.y - this.waterLevel);
      const scale = Math.max(0.35, 1.15 - heightAboveWater * 1.8);

      this.shadow.position.x = this.mesh.position.x;
      this.shadow.position.z = this.mesh.position.z;
      this.shadow.scale.set(scale, scale, 1);
      this.shadow.material.opacity = Math.max(0.04, 0.24 - heightAboveWater * 0.3);
    }

    updateWaterline() {
      if (!this.visible) {
        this.waterline.visible = false;
        return;
      }

      if (this.sphereShader) {
        this.sphereShader.uniforms.waterLevel.value = this.waterLevel;
      }

      const waterOffset = this.waterLevel - this.mesh.position.y;
      const intersectsWater = Math.abs(waterOffset) < this.radius;

      this.waterline.visible = intersectsWater;
      if (!intersectsWater) return;

      const ringRadius = Math.sqrt(this.radius * this.radius - waterOffset * waterOffset);
      this.waterline.position.set(this.mesh.position.x, this.waterLevel + 0.002, this.mesh.position.z);
      this.waterline.scale.set(ringRadius, ringRadius, 1);
    }

    draw(renderer) {
      renderer.render(objectScene, camera);
    }

  }


  class CargoShip {

    constructor() {
      this.visible = true;
      this.waterLevel = 0;
      this.draft = 0.035;
      this.buoyancy = Number(shipBuoyancySlider.value);
      this.floatY = 0;
      this.needsFloatReset = true;
      this.targetYaw = 0;
      this.previousUpdateTime = null;
      this.wavePitch = 0;
      this.waveRoll = 0;
      this.wakeEmitters = [];
      this.wakeDirection = null;
      this.wakeTurnAmount = 0;
      this.wakeExtents = {
        bow: shipWakeBowOffset,
        stern: shipWakeSternOffset,
        beam: shipWakeBeam,
      };
      this.wakeProfile = this.createWakeProfile(this.wakeExtents);
      this.group = new THREE.Group();
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
      this.group.add(this.dragTarget);

      objectScene.add(this.group);

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
          this.resizeDragTarget();

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
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

    createWakeProfile(extents) {
      const length = Math.max(0.001, extents.bow + extents.stern);
      const beam = Math.max(0.001, extents.beam);
      const lengthScale = Math.max(0.35, Math.min(2.6, length / shipWakeReferenceLength));
      const beamScale = Math.max(0.35, Math.min(2.6, beam / shipWakeReferenceBeam));
      const sizeScale = Math.sqrt(lengthScale * beamScale);

      return {
        length,
        beam,
        sizeScale,
        hullSamples: Math.max(3, Math.min(9, Math.round(shipWakeHullSamples * lengthScale))),
        trackWakeCount: Math.max(4, Math.min(14, Math.round(shipTrackWakeCount * lengthScale))),
        kelvinWakeCount: Math.max(3, Math.min(12, Math.round(wakeDropCount * lengthScale))),
        trackWakeSpacing: shipTrackWakeSpacing * Math.max(0.45, Math.min(2.1, lengthScale)),
        kelvinWakeSpacing: wakeTrailSpacing * Math.max(0.45, Math.min(2.1, lengthScale)),
        trackSideOffset: Math.max(beam * 0.32, 0.045 * beamScale),
        baseTrackRadius: Math.max(0.014, Math.min(0.065, beam * 0.14)),
        baseTurnRadius: Math.max(0.018, Math.min(0.085, beam * 0.18)),
        bowRadius: Math.max(0.014, Math.min(0.06, beam * 0.12)),
        sternRadius: Math.max(0.018, Math.min(0.08, beam * 0.18)),
      };
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
      const forwardLength = Math.max(0.001, forwardMax - forwardMin);
      const beam = Math.max(0.001, sideMax - sideMin);
      const bowEmitters = [];
      const sideEmitters = [];

      for (let i = 0; i < shipWakeGeometrySideBins; i++) {
        const binMin = sideMin + beam * i / shipWakeGeometrySideBins;
        const binMax = sideMin + beam * (i + 1) / shipWakeGeometrySideBins;
        let bestPoint = null;
        let bestForward = -Infinity;

        for (const point of usablePoints) {
          const side = point[sideAxis];
          const forward = point[forwardAxis];

          if (side < binMin || side > binMax || forward < forwardMin + forwardLength * 0.35) continue;

          if (forward > bestForward) {
            bestForward = forward;
            bestPoint = point;
          }
        }

        if (!bestPoint) continue;

        bowEmitters.push({
          forward: bestPoint[forwardAxis],
          side: bestPoint[sideAxis],
        });
      }

      for (let i = 0; i < shipWakeGeometryLengthBins; i++) {
        const binMin = forwardMin + forwardLength * i / shipWakeGeometryLengthBins;
        const binMax = forwardMin + forwardLength * (i + 1) / shipWakeGeometryLengthBins;
        let leftPoint = null;
        let rightPoint = null;
        let leftSide = Infinity;
        let rightSide = -Infinity;

        for (const point of usablePoints) {
          const forward = point[forwardAxis];
          const side = point[sideAxis];

          if (forward < binMin || forward > binMax) continue;

          if (side < leftSide) {
            leftSide = side;
            leftPoint = point;
          }

          if (side > rightSide) {
            rightSide = side;
            rightPoint = point;
          }
        }

        if (leftPoint) {
          sideEmitters.push({
            forward: leftPoint[forwardAxis],
            side: leftPoint[sideAxis],
          });
        }

        if (rightPoint && rightPoint !== leftPoint) {
          sideEmitters.push({
            forward: rightPoint[forwardAxis],
            side: rightPoint[sideAxis],
          });
        }
      }

      const centerForward = (forwardMin + forwardMax) * 0.5;
      const centerSide = (sideMin + sideMax) * 0.5;

      this.wakeExtents = {
        bow: Math.max(shipWakeBowOffset * 0.5, forwardMax - centerForward),
        stern: Math.max(shipWakeSternOffset * 0.5, centerForward - forwardMin),
        beam: Math.max(shipWakeBeam * 0.5, beam),
      };
      this.wakeProfile = this.createWakeProfile(this.wakeExtents);

      this.wakeEmitters = [
        ...bowEmitters.map((point) => ({
          forward: point.forward - centerForward,
          side: point.side - centerSide,
          radius: Math.max(0.018, this.wakeProfile.bowRadius * 0.75),
          strength: shipWakeEmitterStrength,
        })),
        ...sideEmitters.map((point) => ({
          forward: point.forward - centerForward,
          side: point.side - centerSide,
          radius: Math.max(0.015, this.wakeProfile.bowRadius * 0.58),
          strength: shipWakeEmitterStrength * 0.55,
        })),
      ];
    }

    clampToPool() {
      this.group.position.x = Math.min(0.9, Math.max(-0.9, this.group.position.x));
      this.group.position.z = Math.min(0.9, Math.max(-0.9, this.group.position.z));
      this.group.updateMatrixWorld();
    }

    moveToWaterPoint(point, wakeSpeedOverride = null) {
      const previousPoint = {
        x: this.group.position.x,
        z: this.group.position.z,
      };
      const dx = point.x - previousPoint.x;
      const dz = point.z - previousPoint.z;

      if (Math.sqrt(dx * dx + dz * dz) > 0.001) {
        this.targetYaw = Math.atan2(dx, dz) + shipMovementYawOffset;
      }

      this.group.position.x = point.x;
      this.group.position.z = point.z;
      this.clampToPool();

      emitCargoShipMovementWake(previousPoint, getVesselPoint(this), wakeSpeedOverride);
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
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });

        this._mesh = new THREE.Mesh(this._geometry, this._material);
      });
    }

    draw(renderer, texture) {
      this._material.uniforms['texture'].value = texture;

      renderer.setRenderTarget(null);
      renderer.render(this._mesh, this._camera);
    }

  }

  const waterSimulation = new WaterSimulation();
  const water = new Water();
  const caustics = new Caustics(water.geometry);
  const pool = new Pool();
  const waterVolume = new WaterVolume();
  const boundaryWalls = new BoundaryWalls();
  const floatingSphere = new FloatingSphere();
  const cargoShip = new CargoShip();
  floatingSphere.setVisible(false);
  let lastWakePoint = null;
  let shipMovementMode = shipMovementModeRandom;
  let shipAutoTarget = null;
  let shipAutoLastTime = null;
  let shipAutoNextTurnTime = 0;
  let shipAutoTurnBias = 0;
  let shipAutoTargetTurnBias = 0;
  let shipAutoTravelAngle = null;
  let shipAutoLastWakePoint = null;
  let shipCircleAngle = null;
  let simulationTime = 0;
  let previousFrameTime = null;

  const debug = new Debug();

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

  function updateWaterWaveUniforms() {
    if (!water.material) return;

    water.material.uniforms['oceanWaveStrength'].value = oceanWaveStrength;
    water.material.uniforms['oceanWaveFrequency'].value = oceanWaveFrequency;
    water.material.uniforms['oceanWaveSpeed'].value = oceanWaveSpeed;
    water.material.uniforms['oceanWaveSharpness'].value = oceanWaveSharpness;
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

  buoyancySlider.addEventListener('input', () => {
    const value = setControlValue(buoyancySlider, buoyancyValue, Number(buoyancySlider.value));
    floatingSphere.setBuoyancy(value);
  });

  shipBuoyancySlider.addEventListener('input', () => {
    const value = setControlValue(shipBuoyancySlider, shipBuoyancyValue, Number(shipBuoyancySlider.value));
    cargoShip.setBuoyancy(value);
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

  function setToggleButtonState(button, enabled) {
    button.classList.toggle('is-info', enabled);
    button.classList.toggle('is-light', !enabled);
  }

  function updateShipMovementModeButtons() {
    setToggleButtonState(shipModeRandomButton, shipMovementMode === shipMovementModeRandom);
    setToggleButtonState(shipModeCircleButton, shipMovementMode === shipMovementModeCircle);
    setToggleButtonState(shipModeStoppedButton, shipMovementMode === shipMovementModeStopped);
  }

  function setShipMovementMode(mode) {
    shipMovementMode = mode;
    resetShipAutopilotState();
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
      lastWakePoint = null;
    }
    setToggleButtonState(toggleSphereButton, floatingSphere.visible);
  });

  toggleShipButton.addEventListener('click', () => {
    cargoShip.setVisible(!cargoShip.visible);
    if (!cargoShip.visible && draggedVessel === cargoShip) {
      draggedVessel = null;
      draggedVesselOffset = { x: 0, z: 0 };
      lastWakePoint = null;
    }
    setToggleButtonState(toggleShipButton, cargoShip.visible);
  });

  shipModeRandomButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeRandom);
  });

  shipModeCircleButton.addEventListener('click', () => {
    setShipMovementMode(shipMovementModeCircle);
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
    shipWakeMinVisibleSpeed = extraFoamEnabled > 0 ? extraFoamShipWakeMinVisibleSpeed : normalShipWakeMinVisibleSpeed;

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
    return floatingSphere.visible || cargoShip.visible;
  }

  function getVesselPoint(vessel) {
    const position = vessel === floatingSphere ? floatingSphere.mesh.position : cargoShip.group.position;

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

  function emitCargoShipMovementWake(fromPoint, toPoint, wakeSpeedOverride = null) {
    if (!cargoShip.visible) return;

    if (!shipAutoLastWakePoint) {
      shipAutoLastWakePoint = { x: fromPoint.x, z: fromPoint.z };
    }

    const wakeFromPoint = shipAutoLastWakePoint;
    const wakeDx = toPoint.x - wakeFromPoint.x;
    const wakeDz = toPoint.z - wakeFromPoint.z;

    if (Math.sqrt(wakeDx * wakeDx + wakeDz * wakeDz) >= wakeMinMovement) {
      addMovementWake(cargoShip, wakeFromPoint, toPoint, wakeSpeedOverride);
      shipAutoLastWakePoint = { x: toPoint.x, z: toPoint.z };
    }
  }

  function resetShipAutopilotState() {
    shipAutoTarget = null;
    shipAutoLastTime = null;
    shipAutoNextTurnTime = 0;
    shipAutoTurnBias = 0;
    shipAutoTargetTurnBias = 0;
    shipAutoTravelAngle = null;
    shipAutoLastWakePoint = null;
    shipCircleAngle = null;
    resetShipWakeDirection();
  }

  function getShipMovementSpeedAmount(step, deltaTime) {
    return deltaTime > 0 ? clamp((step / deltaTime) / 0.35, 0, 1) : 0;
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
      shipAutoLastWakePoint = null;
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

    cargoShip.moveToWaterPoint(nextPoint, getShipMovementSpeedAmount(step, deltaTime));
  }

  function updateShipCircleMovement(deltaTime) {
    const current = getVesselPoint(cargoShip);

    if (shipCircleAngle === null) {
      shipCircleAngle = Math.atan2(current.z - shipCircleCenter.z, current.x - shipCircleCenter.x);
    }

    shipCircleAngle += shipCircleAngularSpeed * deltaTime;

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

    cargoShip.moveToWaterPoint(nextPoint, getShipMovementSpeedAmount(step, deltaTime));
  }

  function updateAutonomousShip(time) {
    if (!cargoShip.visible || draggedVessel === cargoShip || shipMovementMode === shipMovementModeStopped) {
      shipAutoLastTime = time;
      shipAutoLastWakePoint = null;
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
    const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
    const normalizedX = directionX / length;
    const normalizedZ = directionZ / length;
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

    return height * oceanWaveStrength;
  }

  function spectralHeight(pointX, pointZ, directionX, directionZ, frequency, speed, amplitude, phase, time) {
    const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
    const normalizedX = directionX / length;
    const normalizedZ = directionZ / length;
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

    return height * oceanWaveStrength;
  }

  function getTotalWaterHeightAt(x, z, time) {
    const wakeHeight = waterSimulation.getHeightAt(renderer, x, z) * wakeWaveStrength;
    return wakeHeight + getOceanHeightAt(x, z, time);
  }

  function getShipWaterSamples(time) {
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
      center: getTotalWaterHeightAt(x, z, time),
      bow: getTotalWaterHeightAt(x + forwardX * bowOffset, z + forwardZ * bowOffset, time),
      stern: getTotalWaterHeightAt(x - forwardX * sternOffset, z - forwardZ * sternOffset, time),
      left: getTotalWaterHeightAt(x - sideX * sideOffset, z - sideZ * sideOffset, time),
      right: getTotalWaterHeightAt(x + sideX * sideOffset, z + sideZ * sideOffset, time),
    };
  }

  // Main rendering loop
  function animate() {
    const now = performance.now() * 0.001;
    const realDelta = previousFrameTime === null ? 0 : Math.max(0, now - previousFrameTime);
    const deltaTime = Math.min(realDelta, maxSimulationDelta);
    previousFrameTime = now;
    simulationTime += deltaTime;
    const time = simulationTime;

    updateAutonomousShip(time);

    updateWaterBounceRects();
    updateWaveEmitters(time);
    waterSimulation.stepSimulation(renderer);
    waterSimulation.updateNormals(renderer);

    const sphereX = floatingSphere.mesh.position.x;
    const sphereZ = floatingSphere.mesh.position.z;
    floatingSphere.update(getTotalWaterHeightAt(sphereX, sphereZ, time));

    cargoShip.update(getShipWaterSamples(time), time);

    const waterTexture = waterSimulation.texture.texture;

    caustics.update(renderer, waterTexture);

    const causticsTexture = caustics.texture.texture;

    // debug.draw(renderer, causticsTexture);
    updateReflectionTexture();

    renderer.setRenderTarget(null);
    renderer.setClearColor(white, 1);
    renderer.clear();

    pool.draw(renderer, waterTexture, causticsTexture);
    boundaryWalls.draw(renderer);
    floatingSphere.draw(renderer);
    waterVolume.draw(renderer);
    water.draw(renderer, waterTexture, causticsTexture, time);

    window.requestAnimationFrame(animate);
  }

  function clampPoolCoordinate(value) {
    return Math.min(waterExtent * 0.98, Math.max(-waterExtent * 0.98, value));
  }

  function addWakeDrop(x, z, radius, strength) {
    waterSimulation.addDrop(
      renderer,
      clampPoolCoordinate(x) / waterExtent,
      clampPoolCoordinate(z) / waterExtent,
      radius / waterExtent,
      strength * objectWakeHeightScale
    );
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
    const samples = Math.max(2, emitter.samples);
    const troughOffset = emitter.troughOffset || emitter.radius * 1.5;

    for (let i = 0; i < samples; i++) {
      const t = samples === 1 ? 0.5 : i / (samples - 1);
      const sideOffset = (t - 0.5) * emitter.width;
      const edgeFade = Math.sin(t * Math.PI);
      const fade = 0.35 + edgeFade * 0.65;
      const x = emitter.origin.x + side.x * sideOffset;
      const z = emitter.origin.z + side.z * sideOffset;

      addWakeDrop(x, z, emitter.radius, emitter.strength * fade);
      addWakeDrop(
        x - direction.x * troughOffset,
        z - direction.z * troughOffset,
        emitter.radius * 1.2,
        emitter.troughStrength * fade
      );
    }
  }

  function updatePointWaveEmitter(emitter, time) {
    if (!shouldEmitWave(emitter, time)) return;

    addWakeDrop(emitter.origin.x, emitter.origin.z, emitter.radius, emitter.strength);
  }

  function addSphereWake(fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed) {
    const bowX = toPoint.x + directionX * floatingSphere.radius;
    const bowZ = toPoint.z + directionZ * floatingSphere.radius;

    addWakeDrop(bowX, bowZ, floatingSphere.radius * 0.55, wakeTroughStrength * speed);
    addWakeDrop(
      bowX + perpendicularX * floatingSphere.radius * 0.72,
      bowZ + perpendicularZ * floatingSphere.radius * 0.72,
      floatingSphere.radius * 0.44,
      wakeStrength * speed
    );
    addWakeDrop(
      bowX - perpendicularX * floatingSphere.radius * 0.72,
      bowZ - perpendicularZ * floatingSphere.radius * 0.72,
      floatingSphere.radius * 0.44,
      wakeStrength * speed
    );
  }

  function addShipGeometryWake(fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed) {
    const bowOffset = cargoShip.wakeExtents.bow;
    const sternOffset = cargoShip.wakeExtents.stern;
    const beam = cargoShip.wakeExtents.beam;
    const profile = cargoShip.wakeProfile;
    const bowX = toPoint.x + directionX * bowOffset;
    const bowZ = toPoint.z + directionZ * bowOffset;
    const sternX = toPoint.x - directionX * sternOffset;
    const sternZ = toPoint.z - directionZ * sternOffset;
    const hullLength = bowOffset + sternOffset;
    const normalizedEmitterStrength = cargoShip.wakeEmitters.length > 0
      ? 1 / Math.sqrt(cargoShip.wakeEmitters.length)
      : 1;

    if (cargoShip.wakeEmitters.length === 0) {
      addWakeDrop(bowX, bowZ, profile.bowRadius, wakeTroughStrength * speed);
      addWakeDrop(
        bowX + perpendicularX * beam * 0.48,
        bowZ + perpendicularZ * beam * 0.48,
        profile.bowRadius * 0.75,
        wakeStrength * speed
      );
      addWakeDrop(
        bowX - perpendicularX * beam * 0.48,
        bowZ - perpendicularZ * beam * 0.48,
        profile.bowRadius * 0.75,
        wakeStrength * speed
      );
    } else {
      for (let i = 0; i < profile.hullSamples; i++) {
        const t = profile.hullSamples === 1 ? 0.5 : i / (profile.hullSamples - 1);
        const hullX = bowX - directionX * hullLength * t;
        const hullZ = bowZ - directionZ * hullLength * t;
        const fade = 1 - Math.abs(t - 0.45) * 0.55;

        addWakeDrop(
          hullX,
          hullZ,
          profile.sternRadius,
          shipWakePressureStrength * speed * fade
        );
      }

      for (const emitter of cargoShip.wakeEmitters) {
        const emitterX = toPoint.x + directionX * emitter.forward + perpendicularX * emitter.side;
        const emitterZ = toPoint.z + directionZ * emitter.forward + perpendicularZ * emitter.side;
        const bowness = Math.max(0, emitter.forward / Math.max(0.001, bowOffset));
        const sideness = Math.min(1, Math.abs(emitter.side) / Math.max(0.001, beam * 0.5));
        const strength = emitter.strength * speed * normalizedEmitterStrength * (0.35 + bowness * 0.9 + sideness * 0.25);

        addWakeDrop(emitterX, emitterZ, emitter.radius, strength);
      }

      addWakeDrop(bowX, bowZ, profile.bowRadius, wakeTroughStrength * speed * 0.9);
    }

    addWakeDrop(sternX, sternZ, profile.sternRadius, wakeTroughStrength * speed * 0.45);
  }

  function getShipTurnAmount(directionX, directionZ) {
    if (!cargoShip.wakeDirection) {
      cargoShip.wakeDirection = {
        x: directionX,
        z: directionZ,
      };
      cargoShip.wakeTurnAmount = 0;
      return 0;
    }

    const cross = cargoShip.wakeDirection.x * directionZ - cargoShip.wakeDirection.z * directionX;
    const turnAmount = Math.max(-1, Math.min(1, cross * shipTurnWakeSensitivity));

    cargoShip.wakeTurnAmount = cargoShip.wakeTurnAmount * 0.68 + turnAmount * 0.32;
    cargoShip.wakeDirection.x = cargoShip.wakeDirection.x * 0.82 + directionX * 0.18;
    cargoShip.wakeDirection.z = cargoShip.wakeDirection.z * 0.82 + directionZ * 0.18;

    const directionLength = Math.sqrt(
      cargoShip.wakeDirection.x * cargoShip.wakeDirection.x +
      cargoShip.wakeDirection.z * cargoShip.wakeDirection.z
    );

    if (directionLength > 0.0001) {
      cargoShip.wakeDirection.x /= directionLength;
      cargoShip.wakeDirection.z /= directionLength;
    }

    return cargoShip.wakeTurnAmount;
  }

  function addShipTrackWake(toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed, turnAmount) {
    const sternOffset = cargoShip.wakeExtents.stern;
    const beam = cargoShip.wakeExtents.beam;
    const turnMagnitude = Math.min(1, Math.abs(turnAmount));
    const turnSign = turnAmount === 0 ? 0 : Math.sign(turnAmount);
    const sternX = toPoint.x - directionX * sternOffset;
    const sternZ = toPoint.z - directionZ * sternOffset;
    const profile = cargoShip.wakeProfile;
    const trackSideOffset = profile.trackSideOffset;

    for (let i = 0; i < profile.trackWakeCount; i++) {
      const trail = (i + 1) * profile.trackWakeSpacing;
      const fade = 1 - i / profile.trackWakeCount;
      const centerX = sternX - directionX * trail;
      const centerZ = sternZ - directionZ * trail;
      const curve = turnSign * turnMagnitude * trail * 0.42;
      const radius = profile.baseTrackRadius + i * profile.baseTrackRadius * 0.15;
      const baseStrength = shipTrackWakeStrength * speed * fade;

      addWakeDrop(
        centerX + perpendicularX * (trackSideOffset + curve),
        centerZ + perpendicularZ * (trackSideOffset + curve),
        radius,
        baseStrength * (1 + Math.max(0, turnSign) * turnMagnitude * 1.2)
      );
      addWakeDrop(
        centerX - perpendicularX * (trackSideOffset - curve),
        centerZ - perpendicularZ * (trackSideOffset - curve),
        radius,
        baseStrength * (1 + Math.max(0, -turnSign) * turnMagnitude * 1.2)
      );
      addWakeDrop(
        centerX + perpendicularX * curve * 0.35,
        centerZ + perpendicularZ * curve * 0.35,
        radius * 1.35,
        wakeTroughStrength * speed * fade * 0.42
      );
    }
  }

  function addShipTurnWake(toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed, turnAmount) {
    const turnMagnitude = Math.min(1, Math.abs(turnAmount));
    if (turnMagnitude < 0.08) return;

    const turnSign = Math.sign(turnAmount);
    const sternOffset = cargoShip.wakeExtents.stern;
    const beam = cargoShip.wakeExtents.beam;
    const profile = cargoShip.wakeProfile;
    const sternX = toPoint.x - directionX * sternOffset;
    const sternZ = toPoint.z - directionZ * sternOffset;

    for (let i = 0; i < profile.trackWakeCount; i++) {
      const trail = (i + 0.7) * profile.trackWakeSpacing;
      const fade = 1 - i / profile.trackWakeCount;
      const side = beam * 0.45 + trail * (0.18 + turnMagnitude * 0.55);
      const arcX = sternX - directionX * trail + perpendicularX * side * turnSign;
      const arcZ = sternZ - directionZ * trail + perpendicularZ * side * turnSign;
      const radius = profile.baseTurnRadius + i * profile.baseTurnRadius * 0.17;

      addWakeDrop(
        arcX,
        arcZ,
        radius,
        shipTurnWakeStrength * speed * turnMagnitude * fade
      );
    }
  }

  function addTrailingKelvinWake(vessel, fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed) {
    const originOffset = vessel === cargoShip ? cargoShip.wakeExtents.stern : floatingSphere.radius * 0.95;
    const originX = toPoint.x - directionX * originOffset;
    const originZ = toPoint.z - directionZ * originOffset;
    const turnMagnitude = vessel === cargoShip ? Math.min(1, Math.abs(cargoShip.wakeTurnAmount)) : 0;
    const wakeCount = vessel === cargoShip ? cargoShip.wakeProfile.kelvinWakeCount : wakeDropCount;
    const trailSpacing = vessel === cargoShip ? cargoShip.wakeProfile.kelvinWakeSpacing : wakeTrailSpacing;
    const baseRadius = vessel === cargoShip ? cargoShip.wakeProfile.baseTrackRadius : 0.026;
    const radiusGrowth = vessel === cargoShip ? cargoShip.wakeProfile.baseTrackRadius * 0.16 : 0.005;

    for (let i = 1; i <= wakeCount; i++) {
      const trail = i * trailSpacing;
      const spread = trail * wakeSpread;
      const fade = 1 - (i - 1) / wakeCount;
      const baseX = originX - directionX * trail;
      const baseZ = originZ - directionZ * trail;
      const radius = baseRadius + i * radiusGrowth;
      const vesselWakeScale = vessel === cargoShip ? 0.35 * (1 - turnMagnitude * 0.45) : 1;
      const crestStrength = wakeStrength * speed * fade * vesselWakeScale;
      const troughStrength = wakeTroughStrength * speed * fade * vesselWakeScale;

      addWakeDrop(
        baseX + perpendicularX * spread,
        baseZ + perpendicularZ * spread,
        radius,
        crestStrength
      );
      addWakeDrop(
        baseX - perpendicularX * spread,
        baseZ - perpendicularZ * spread,
        radius,
        crestStrength
      );
      addWakeDrop(
        baseX,
        baseZ,
        radius * 1.15,
        troughStrength
      );
    }
  }

  function addMovementWake(vessel, fromPoint, toPoint, wakeSpeedOverride = null) {
    const dx = toPoint.x - fromPoint.x;
    const dz = toPoint.z - fromPoint.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < wakeMinMovement) return;

    const directionX = dx / distance;
    const directionZ = dz / distance;
    const perpendicularX = -directionZ;
    const perpendicularZ = directionX;
    const speed = Math.min(1, distance / 0.08);
    const movementSpeed = wakeSpeedOverride === null ? speed : wakeSpeedOverride;
    const wakeSpeed = vessel === cargoShip ? Math.max(movementSpeed, shipWakeMinVisibleSpeed) : speed;

    if (vessel === cargoShip) {
      const turnAmount = getShipTurnAmount(directionX, directionZ);
      addShipGeometryWake(fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, wakeSpeed);
      addShipTrackWake(toPoint, directionX, directionZ, perpendicularX, perpendicularZ, wakeSpeed, turnAmount);
      addShipTurnWake(toPoint, directionX, directionZ, perpendicularX, perpendicularZ, wakeSpeed, turnAmount);
    } else {
      addSphereWake(fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed);
    }

    if (vessel !== cargoShip) {
      addTrailingKelvinWake(vessel, fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, wakeSpeed);
    }
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

    if (lastWakePoint && draggedVessel !== cargoShip) {
      addMovementWake(draggedVessel, lastWakePoint, targetPoint);
    }

    draggedVessel.moveToWaterPoint(targetPoint);
    lastWakePoint = getVesselPoint(draggedVessel);
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
    lastWakePoint = getVesselPoint(draggedVessel);
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
      lastWakePoint = null;
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
  }

  function onPageFocusChange() {
    resetFrameClock();
    cargoShip.requestFloatReset();
  }

  const loaded = [waterSimulation.loaded, caustics.loaded, water.loaded, pool.loaded, cargoShip.loaded, debug.loaded];

  Promise.all(loaded).then(() => {
    setControlValue(buoyancySlider, buoyancyValue, Number(buoyancySlider.value));
    setControlValue(shipBuoyancySlider, shipBuoyancyValue, Number(shipBuoyancySlider.value));
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
    setToggleButtonState(toggleSphereButton, floatingSphere.visible);
    setToggleButtonState(toggleShipButton, cargoShip.visible);
    updateShipMovementModeButtons();
    setToggleButtonState(toggleFftWavesButton, fftWavesEnabled > 0);
    setToggleButtonState(toggleWaveGeneratorButton, waveGeneratorEnabled);
    setToggleButtonState(toggleWallsButton, wallsEnabled);
    setToggleButtonState(toggleObjectFoamButton, objectFoamEnabled > 0);
    setToggleButtonState(toggleWaveFoamButton, waveFoamEnabled > 0);
    setToggleButtonState(toggleExtraFoamButton, extraFoamEnabled > 0);
    setToggleButtonState(toggleFoamTextureButton, foamMottleEnabled > 0);
    setToggleButtonState(toggleWaterTextureButton, waterImageTextureEnabled > 0);
    setToggleButtonState(toggleWireframeButton, wireframeEnabled);
    applyWireframeMode();
    updateFoamUniforms();

    canvas.addEventListener('mousemove', { handleEvent: onMouseMove });
    canvas.addEventListener('mousedown', { handleEvent: onMouseDown });
    canvas.addEventListener('wheel', { handleEvent: onWheel }, { passive: false });
    window.addEventListener('mouseup', { handleEvent: onMouseUp });
    canvas.addEventListener('contextmenu', { handleEvent: onContextMenu });
    window.addEventListener('blur', resetFrameClock);
    window.addEventListener('focus', onPageFocusChange);
    document.addEventListener('visibilitychange', onPageFocusChange);

    animate();
  });

});
