const canvas = document.getElementById('canvas');
const buoyancySlider = document.getElementById('buoyancy');
const buoyancyValue = document.getElementById('buoyancy-value');

const width = canvas.width;
const height = canvas.height;

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
  camera.position.set(0, 1.15, -3.35);
  camera.lookAt(cameraTarget);
  cameraSpherical.setFromVector3(camera.position.clone().sub(cameraTarget));

  function updateCameraFromOrbit() {
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
  let isDraggingSphere = false;
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
              delta: { value: [1 / 256, 1 / 256] },  // TODO: Remove this useless uniform and hardcode it in shaders?
              texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: normalFragmentShader,
        });

        const updateMaterial = new THREE.RawShaderMaterial({
          uniforms: {
              delta: { value: [1 / 256, 1 / 256] },  // TODO: Remove this useless uniform and hardcode it in shaders?
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

    draw(renderer, waterTexture, causticsTexture) {
      this.material.uniforms['water'].value = waterTexture;
      this.material.uniforms['causticTex'].value = causticsTexture;

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
        -1, -1, -1,
        -1, -1, 1,
        -1, 1, -1,
        -1, 1, 1,
        1, -1, -1,
        1, 1, -1,
        1, -1, 1,
        1, 1, 1,
        -1, -1, -1,
        1, -1, -1,
        -1, -1, 1,
        1, -1, 1,
        -1, 1, -1,
        -1, 1, 1,
        1, 1, -1,
        1, 1, 1,
        -1, -1, -1,
        -1, 1, -1,
        1, -1, -1,
        1, 1, -1,
        -1, -1, 1,
        1, -1, 1,
        -1, 1, 1,
        1, 1, 1
      ]);
      const indices = new Uint32Array([
        0, 1, 2,
        2, 1, 3,
        4, 5, 6,
        6, 5, 7,
        12, 13, 14,
        14, 13, 15,
        16, 17, 18,
        18, 17, 19,
        20, 21, 22,
        22, 21, 23
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


  class FloatingSphere {

    constructor() {
      this.radius = 0.14;
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

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(-0.5, this.radius * 0.25, 0.15);
      objectScene.add(this.mesh);

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

      this.updateShadow();
      this.clampToPool();
    }

    updateShadow() {
      const heightAboveWater = Math.max(0, this.mesh.position.y - this.waterLevel);
      const scale = Math.max(0.35, 1.15 - heightAboveWater * 1.8);

      this.shadow.position.x = this.mesh.position.x;
      this.shadow.position.z = this.mesh.position.z;
      this.shadow.scale.set(scale, scale, 1);
      this.shadow.material.opacity = Math.max(0.04, 0.24 - heightAboveWater * 0.3);
    }

    draw(renderer) {
      renderer.render(objectScene, camera);
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
  const floatingSphere = new FloatingSphere();

  const debug = new Debug();

  buoyancySlider.addEventListener('input', () => {
    const value = Number(buoyancySlider.value);
    buoyancyValue.textContent = value.toFixed(2);
    floatingSphere.setBuoyancy(value);
  });


  // Main rendering loop
  function animate() {
    waterSimulation.stepSimulation(renderer);
    waterSimulation.updateNormals(renderer);
    floatingSphere.update(waterSimulation.getHeightAt(
      renderer,
      floatingSphere.mesh.position.x,
      floatingSphere.mesh.position.z
    ));

    const waterTexture = waterSimulation.texture.texture;

    caustics.update(renderer, waterTexture);

    const causticsTexture = caustics.texture.texture;

    // debug.draw(renderer, causticsTexture);

    renderer.setRenderTarget(null);
    renderer.setClearColor(white, 1);
    renderer.clear();

    pool.draw(renderer, waterTexture, causticsTexture);
    floatingSphere.draw(renderer);
    water.draw(renderer, waterTexture, causticsTexture);

    window.requestAnimationFrame(animate);
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

    if (!isDraggingSphere) return;

    const point = getPointerWaterPoint(event);
    if (!point) return;

    floatingSphere.moveToWaterPoint(point);
    waterSimulation.addDrop(renderer, floatingSphere.mesh.position.x, floatingSphere.mesh.position.z, 0.03, 0.04);
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

    const point = getPointerWaterPoint(event);
    if (!point) return;

    event.preventDefault();
    isDraggingSphere = true;
    floatingSphere.moveToWaterPoint(point);
    waterSimulation.addDrop(renderer, floatingSphere.mesh.position.x, floatingSphere.mesh.position.z, 0.03, 0.04);
  }

  function onMouseUp(event) {
    if (event.button === 2) {
      isRotatingPool = false;
    }

    if (event.button === 0) {
      isDraggingSphere = false;
    }
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  const loaded = [waterSimulation.loaded, caustics.loaded, water.loaded, pool.loaded, debug.loaded];

  Promise.all(loaded).then(() => {
    canvas.addEventListener('mousemove', { handleEvent: onMouseMove });
    canvas.addEventListener('mousedown', { handleEvent: onMouseDown });
    window.addEventListener('mouseup', { handleEvent: onMouseUp });
    canvas.addEventListener('contextmenu', { handleEvent: onContextMenu });

    animate();
  });

});
