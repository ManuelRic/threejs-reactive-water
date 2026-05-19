const canvas = document.getElementById('canvas');
const buoyancySlider = document.getElementById('buoyancy');
const buoyancyValue = document.getElementById('buoyancy-value');
const waveSizeSlider = document.getElementById('wave-size');
const waveSizeValue = document.getElementById('wave-size-value');
const toggleSphereButton = document.getElementById('toggle-sphere');
const toggleShipButton = document.getElementById('toggle-ship');
const toggleObjectFoamButton = document.getElementById('toggle-object-foam');
const toggleWaveFoamButton = document.getElementById('toggle-wave-foam');

const width = canvas.width;
const height = canvas.height;

// Lower values make wake waves fade sooner. Higher values let them travel farther.
const rippleDistance = 0.92;
const wakeHeightRecovery = 0.992;
const maxWakeHeight = 0.045;
let oceanWaveStrength = Number(waveSizeSlider.value);
const wakeWaveStrength = 0.75;
const foamHeightThreshold = 0.016;
const foamHeightSoftness = 0.03;
const foamFromHeightStrength = 1.25;
let objectFoamEnabled = 1;
let waveFoamEnabled = 0;
const wakeDropCount = 5;
const wakeTrailSpacing = 0.055;
const wakeSpread = 0.72;
const wakeStrength = 0.018;
const wakeTroughStrength = -0.014;
const wakeMinMovement = 0.006;
const shipWakeBowOffset = 0.3;
const shipWakeSternOffset = 0.28;
const shipWakeBeam = 0.18;
const shipWakeHullSamples = 4;
const shipWakeMinVisibleSpeed = 0.28;
const shipWakeGeometrySideBins = 11;
const shipWakeGeometryLengthBins = 6;
const shipWakePressureStrength = -0.010;
const shipWakeEmitterStrength = 0.010;
const shipModelYawOffset = 2*Math.PI;
const shipMovementYawOffset = Math.PI / 2;
const shipAutopilotSpeed = 0.24;
const shipAutopilotTurnBiasMax = 0.75;
const shipAutopilotTargetRadius = 0.12;
const shipAutopilotBounds = 0.72;

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
  const maxCameraDistance = 6.0;
  camera.position.set(0, 1.15, -3.35);
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

  const objectScene = new THREE.Scene();

  // Light direction
  const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

  const objectAmbient = new THREE.AmbientLight(0xffffff, 0.35);
  const objectLight = new THREE.DirectionalLight(0xffffff, 0.9);
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

  const targetgeometry = new THREE.PlaneGeometry(2, 2);
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
      this._render(renderer, this._updateMesh);
    }

    updateNormals(renderer) {
      this._render(renderer, this._normalMesh);
    }

    getHeightAt(renderer, x, z) {
      const pixel = new Float32Array(4);
      const px = Math.min(255, Math.max(0, Math.floor((x * 0.5 + 0.5) * 256)));
      const py = Math.min(255, Math.max(0, Math.floor((z * 0.5 + 0.5) * 256)));

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
      this.geometry = new THREE.PlaneBufferGeometry(2, 2, 200, 200);

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
              causticTex: { value: null },
              time: { value: 0 },
              oceanWaveStrength: { value: oceanWaveStrength },
              wakeWaveStrength: { value: wakeWaveStrength },
              foamHeightThreshold: { value: foamHeightThreshold },
              foamHeightSoftness: { value: foamHeightSoftness },
              foamFromHeightStrength: { value: foamFromHeightStrength },
              objectFoamEnabled: { value: objectFoamEnabled },
              waveFoamEnabled: { value: waveFoamEnabled },
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


  class Pool {

    constructor() {
      this._geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        -1, 1, -1,
        -1, 1, 1,
        1, 1, -1,
        1, 1, 1
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
        -1, -1, -1,
        -1, 0, -1,
        1, -1, -1,
        1, 0, -1,
        1, -1, -1,
        1, 0, -1,
        1, -1, 1,
        1, 0, 1,
        1, -1, 1,
        1, 0, 1,
        -1, -1, 1,
        -1, 0, 1,
        -1, -1, 1,
        -1, 0, 1,
        -1, -1, -1,
        -1, 0, -1
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
      this.targetYaw = 0;
      this.wakeEmitters = [];
      this.wakeExtents = {
        bow: shipWakeBowOffset,
        stern: shipWakeSternOffset,
        beam: shipWakeBeam,
      };
      this.group = new THREE.Group();
      this.modelRoot = new THREE.Group();
      this.group.add(this.modelRoot);
      this.group.position.set(-0.5, 0, 0.15);

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
          const scale = 0.15;

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

      this.wakeEmitters = [
        ...bowEmitters.map((point) => ({
          forward: point.forward - centerForward,
          side: point.side - centerSide,
          radius: Math.max(0.018, this.wakeExtents.beam * 0.045),
          strength: shipWakeEmitterStrength,
        })),
        ...sideEmitters.map((point) => ({
          forward: point.forward - centerForward,
          side: point.side - centerSide,
          radius: Math.max(0.015, this.wakeExtents.beam * 0.035),
          strength: shipWakeEmitterStrength * 0.55,
        })),
      ];
    }

    clampToPool() {
      this.group.position.x = Math.min(0.9, Math.max(-0.9, this.group.position.x));
      this.group.position.z = Math.min(0.9, Math.max(-0.9, this.group.position.z));
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

    update(waterLevel, time) {
      this.waterLevel = waterLevel;
      this.group.position.y = waterLevel - this.draft + Math.sin(time * 2.0) * 0.004;
      this.group.rotation.y += (this.targetYaw - this.group.rotation.y) * 0.18;
      this.modelRoot.rotation.x = Math.sin(time * 1.35 + this.group.position.z * 4.0) * 0.025;
      this.modelRoot.rotation.z = Math.sin(time * 1.6 + this.group.position.x * 3.0) * 0.018;
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
  const floatingSphere = new FloatingSphere();
  const cargoShip = new CargoShip();
  floatingSphere.setVisible(false);
  let lastWakePoint = null;
  let shipAutoTarget = null;
  let shipAutoLastTime = null;
  let shipAutoNextTurnTime = 0;
  let shipAutoTurnBias = 0;
  let shipAutoLastWakePoint = null;

  const debug = new Debug();

  buoyancySlider.addEventListener('input', () => {
    const value = Number(buoyancySlider.value);
    buoyancyValue.textContent = value.toFixed(2);
    floatingSphere.setBuoyancy(value);
  });

  waveSizeSlider.addEventListener('input', () => {
    oceanWaveStrength = Number(waveSizeSlider.value);
    waveSizeValue.textContent = oceanWaveStrength.toFixed(3);

    if (water.material) {
      water.material.uniforms['oceanWaveStrength'].value = oceanWaveStrength;
    }
  });

  function setToggleButtonState(button, enabled) {
    button.classList.toggle('is-info', enabled);
    button.classList.toggle('is-light', !enabled);
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

  function randomShipAutoTarget() {
    return {
      x: randomRange(-shipAutopilotBounds, shipAutopilotBounds),
      z: randomRange(-shipAutopilotBounds, shipAutopilotBounds),
    };
  }

  function chooseShipAutoTurn(time) {
    shipAutoTurnBias = randomRange(-shipAutopilotTurnBiasMax, shipAutopilotTurnBiasMax);
    shipAutoNextTurnTime = time + randomRange(0.9, 2.4);
  }

  function updateAutonomousShip(time) {
    if (!cargoShip.visible || draggedVessel === cargoShip) {
      shipAutoLastTime = time;
      shipAutoLastWakePoint = null;
      return;
    }

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
      return;
    }

    if (time >= shipAutoNextTurnTime) {
      chooseShipAutoTurn(time);
    }

    const previousTime = shipAutoLastTime === null ? time : shipAutoLastTime;
    const deltaTime = Math.min(0.05, Math.max(0, time - previousTime));
    shipAutoLastTime = time;

    if (deltaTime <= 0) return;

    const targetAngle = Math.atan2(dx, dz);
    const travelAngle = targetAngle + shipAutoTurnBias * Math.min(1, distance / 0.45);
    const step = Math.min(distance, shipAutopilotSpeed * deltaTime);
    const nextPoint = {
      x: current.x + Math.sin(travelAngle) * step,
      z: current.z + Math.cos(travelAngle) * step,
    };

    const wakeFromPoint = shipAutoLastWakePoint || current;
    const wakeDx = nextPoint.x - wakeFromPoint.x;
    const wakeDz = nextPoint.z - wakeFromPoint.z;

    if (Math.sqrt(wakeDx * wakeDx + wakeDz * wakeDz) >= wakeMinMovement) {
      addMovementWake(cargoShip, wakeFromPoint, nextPoint);
      shipAutoLastWakePoint = { x: nextPoint.x, z: nextPoint.z };
    }

    cargoShip.moveToWaterPoint(nextPoint);
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
    const crest = Math.sin((pointX * normalizedX + pointZ * normalizedZ) * frequency + time * speed);
    const storm = Math.min(1, Math.max(0, (oceanWaveStrength - 0.08) / 0.04));
    const easedStorm = storm * storm * (3 - 2 * storm);
    const positiveCrest = Math.max(crest, 0);
    const negativeCrest = Math.max(-crest, 0);

    return (
      crest +
      Math.pow(positiveCrest, 3) * easedStorm * 0.85 -
      Math.pow(negativeCrest, 2) * easedStorm * 0.16
    ) * amplitude;
  }

  function getOceanHeightAt(x, z, time) {
    let height = 0;

    height += gerstnerHeight(x, z, 1, 0.24, 4.2, 0.85, 0.55, time);
    height += gerstnerHeight(x, z, 0.82, 0.55, 6.8, 1.22, 0.32, time);
    height += gerstnerHeight(x, z, -0.35, 1, 10.5, 1.85, 0.18, time);
    height += gerstnerHeight(x, z, 0.2, 1, 17, 2.65, 0.08, time);
    height += gerstnerHeight(x, z, -1, 0.15, 24, 3.4, 0.045, time);

    return height * oceanWaveStrength;
  }


  // Main rendering loop
  function animate() {
    const time = performance.now() * 0.001;

    updateAutonomousShip(time);

    waterSimulation.stepSimulation(renderer);
    waterSimulation.updateNormals(renderer);

    const sphereX = floatingSphere.mesh.position.x;
    const sphereZ = floatingSphere.mesh.position.z;
    const sphereWakeHeight = waterSimulation.getHeightAt(renderer, sphereX, sphereZ) * wakeWaveStrength;
    floatingSphere.update(sphereWakeHeight + getOceanHeightAt(sphereX, sphereZ, time));

    const shipX = cargoShip.group.position.x;
    const shipZ = cargoShip.group.position.z;
    const shipWakeHeight = waterSimulation.getHeightAt(renderer, shipX, shipZ) * wakeWaveStrength;
    cargoShip.update(shipWakeHeight + getOceanHeightAt(shipX, shipZ, time), time);

    const waterTexture = waterSimulation.texture.texture;

    caustics.update(renderer, waterTexture);

    const causticsTexture = caustics.texture.texture;

    // debug.draw(renderer, causticsTexture);

    renderer.setRenderTarget(null);
    renderer.setClearColor(white, 1);
    renderer.clear();

    pool.draw(renderer, waterTexture, causticsTexture);
    floatingSphere.draw(renderer);
    waterVolume.draw(renderer);
    water.draw(renderer, waterTexture, causticsTexture, time);

    window.requestAnimationFrame(animate);
  }

  function clampPoolCoordinate(value) {
    return Math.min(0.98, Math.max(-0.98, value));
  }

  function addWakeDrop(x, z, radius, strength) {
    waterSimulation.addDrop(
      renderer,
      clampPoolCoordinate(x),
      clampPoolCoordinate(z),
      radius,
      strength
    );
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
    const bowX = toPoint.x + directionX * bowOffset;
    const bowZ = toPoint.z + directionZ * bowOffset;
    const sternX = toPoint.x - directionX * sternOffset;
    const sternZ = toPoint.z - directionZ * sternOffset;
    const hullLength = bowOffset + sternOffset;
    const normalizedEmitterStrength = cargoShip.wakeEmitters.length > 0
      ? 1 / Math.sqrt(cargoShip.wakeEmitters.length)
      : 1;

    if (cargoShip.wakeEmitters.length === 0) {
      addWakeDrop(bowX, bowZ, 0.035, wakeTroughStrength * speed);
      addWakeDrop(
        bowX + perpendicularX * beam * 0.48,
        bowZ + perpendicularZ * beam * 0.48,
        0.026,
        wakeStrength * speed
      );
      addWakeDrop(
        bowX - perpendicularX * beam * 0.48,
        bowZ - perpendicularZ * beam * 0.48,
        0.026,
        wakeStrength * speed
      );
    } else {
      for (let i = 0; i < shipWakeHullSamples; i++) {
        const t = shipWakeHullSamples === 1 ? 0.5 : i / (shipWakeHullSamples - 1);
        const hullX = bowX - directionX * hullLength * t;
        const hullZ = bowZ - directionZ * hullLength * t;
        const fade = 1 - Math.abs(t - 0.45) * 0.55;

        addWakeDrop(
          hullX,
          hullZ,
          Math.max(0.035, beam * 0.16),
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

      addWakeDrop(bowX, bowZ, Math.max(0.022, beam * 0.045), wakeTroughStrength * speed * 0.9);
    }

    addWakeDrop(sternX, sternZ, Math.max(0.035, beam * 0.09), wakeTroughStrength * speed * 0.45);
  }

  function addTrailingKelvinWake(vessel, fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed) {
    const originOffset = vessel === cargoShip ? cargoShip.wakeExtents.stern : floatingSphere.radius * 0.95;
    const originX = toPoint.x - directionX * originOffset;
    const originZ = toPoint.z - directionZ * originOffset;

    for (let i = 1; i <= wakeDropCount; i++) {
      const trail = i * wakeTrailSpacing;
      const spread = trail * wakeSpread;
      const fade = 1 - (i - 1) / wakeDropCount;
      const baseX = originX - directionX * trail;
      const baseZ = originZ - directionZ * trail;
      const radius = 0.026 + i * 0.005;
      const vesselWakeScale = vessel === cargoShip ? 0.55 : 1;
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

  function addMovementWake(vessel, fromPoint, toPoint) {
    const dx = toPoint.x - fromPoint.x;
    const dz = toPoint.z - fromPoint.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < wakeMinMovement) return;

    const directionX = dx / distance;
    const directionZ = dz / distance;
    const perpendicularX = -directionZ;
    const perpendicularZ = directionX;
    const speed = Math.min(1, distance / 0.08);
    const wakeSpeed = vessel === cargoShip ? Math.max(speed, shipWakeMinVisibleSpeed) : speed;

    if (vessel === cargoShip) {
      addShipGeometryWake(fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, wakeSpeed);
    } else {
      addSphereWake(fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, speed);
    }

    addTrailingKelvinWake(vessel, fromPoint, toPoint, directionX, directionZ, perpendicularX, perpendicularZ, wakeSpeed);
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

    if (lastWakePoint) {
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
      shipAutoTarget = null;
      shipAutoLastWakePoint = null;
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
        shipAutoTarget = null;
        shipAutoLastTime = null;
        shipAutoLastWakePoint = null;
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

  const loaded = [waterSimulation.loaded, caustics.loaded, water.loaded, pool.loaded, cargoShip.loaded, debug.loaded];

  Promise.all(loaded).then(() => {
    waveSizeValue.textContent = oceanWaveStrength.toFixed(3);
    setToggleButtonState(toggleSphereButton, floatingSphere.visible);
    setToggleButtonState(toggleShipButton, cargoShip.visible);
    setToggleButtonState(toggleObjectFoamButton, objectFoamEnabled > 0);
    setToggleButtonState(toggleWaveFoamButton, waveFoamEnabled > 0);

    canvas.addEventListener('mousemove', { handleEvent: onMouseMove });
    canvas.addEventListener('mousedown', { handleEvent: onMouseDown });
    canvas.addEventListener('wheel', { handleEvent: onWheel }, { passive: false });
    window.addEventListener('mouseup', { handleEvent: onMouseUp });
    canvas.addEventListener('contextmenu', { handleEvent: onContextMenu });

    animate();
  });

});
