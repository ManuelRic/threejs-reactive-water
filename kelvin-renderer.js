/* One instanced draw to a bounded wake texture, independent of hull polygons. */
class KelvinWakeField {
  constructor(THREE, size, resolution = 256, capacity = 2048) {
    this.packets = [];
    this.active = [];
    this.capacity = capacity;
    this.resolution = resolution;
    this.target = new THREE.WebGLRenderTarget(resolution, resolution, {
      type: THREE.FloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      depthBuffer: false, stencilBuffer: false,
    });
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,1,0]), 3));
    geometry.setIndex([0,1,2, 0,2,3]);
    this.frame = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
    this.wave = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
    this.frame.setUsage(THREE.DynamicDrawUsage);
    this.wave.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('packetFrame', this.frame);
    geometry.setAttribute('packetWave', this.wave);
    geometry.maxInstancedCount = 0;
    const material = new THREE.RawShaderMaterial({
      uniforms: { waterSize: { value: size } },
      vertexShader: `precision highp float;
        attribute vec3 position; attribute vec4 packetFrame; attribute vec4 packetWave;
        uniform vec2 waterSize; varying float phaseValue; varying vec2 offset; varying vec4 wave;
        void main() { offset = position.xy * packetFrame.z * 3.0;
          wave = packetWave; phaseValue = packetFrame.w;
          gl_Position = vec4((packetFrame.xy + offset) / waterSize * 2.0, 0.0, 1.0); }`,
      fragmentShader: `precision highp float;
        varying float phaseValue; varying vec2 offset; varying vec4 wave;
        void main() { float r2 = dot(offset, offset) / (wave.w * wave.w);
          if (r2 >= 9.0) discard;
          float envelope = exp(-r2) * clamp(9.0-r2,0.0,1.0);
          // Frame alpha packs phase, wave alpha packs width. Direction*k in xy.
          float h = wave.z * envelope * cos(dot(offset, wave.xy) + phaseValue);
          gl_FragColor = vec4(h, 0.0, 0.0, 0.0); }`,
      transparent: true, blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation,
      depthTest: false, depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.camera = new THREE.Camera();
  }
  clear() { this.packets.length = 0; this.active.length = 0; }
  remove(owner) { this.packets = this.packets.filter(packet => packet.owner !== owner); }
  add(packets) {
    this.packets.push(...packets);
    if (this.packets.length > this.capacity) this.packets.splice(0, this.packets.length - this.capacity);
  }
  update(renderer, time, lifetime) {
    let count = 0, keep = 0;
    this.active.length = 0;
    for (const packet of this.packets) {
      const current = KelvinWake.evolve(packet, time, lifetime);
      if (!current) continue;
      this.packets[keep++] = packet;
      this.active.push(current);
      this.frame.setXYZW(count, current.x, current.z, current.width, current.phase);
      this.wave.setXYZW(count, current.nx * current.k, current.nz * current.k, current.amplitude, current.width);
      count++;
    }
    this.packets.length = keep;
    this.frame.needsUpdate = true;
    this.wave.needsUpdate = true;
    this.mesh.geometry.maxInstancedCount = count;
    const previous = renderer.getRenderTarget();
    const color = renderer.getClearColor().clone(), alpha = renderer.getClearAlpha();
    renderer.setRenderTarget(this.target);
    renderer.setClearColor(0, 0);
    renderer.clear();
    if (count) renderer.render(this.mesh, this.camera);
    renderer.setRenderTarget(previous);
    renderer.setClearColor(color, alpha);
  }
  sample(x, z) { return this.active.reduce((sum, packet) => sum + KelvinWake.height(packet, x, z), 0); }
}
