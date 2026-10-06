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
    this.heading = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
    this.shape = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 2), 2);
    this.frame.setUsage(THREE.DynamicDrawUsage);
    this.wave.setUsage(THREE.DynamicDrawUsage);
    this.heading.setUsage(THREE.DynamicDrawUsage);
    this.shape.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('packetFrame', this.frame);
    geometry.setAttribute('packetWave', this.wave);
    geometry.setAttribute('packetHeading', this.heading);
    geometry.setAttribute('packetShape', this.shape);
    geometry.maxInstancedCount = 0;
    const material = new THREE.RawShaderMaterial({
      uniforms: { waterSize: { value: size } },
      vertexShader: `precision highp float;
        attribute vec3 position; attribute vec4 packetFrame; attribute vec4 packetWave;
        attribute vec4 packetHeading; attribute vec2 packetShape;
        uniform vec2 waterSize;
        varying vec2 local, point; varying vec4 wave, heading; varying vec3 shape;
        varying float phaseValue;
        void main() {
          vec2 n = normalize(packetWave.xy), t = vec2(-n.y, n.x);
          local = position.xy * vec2(packetFrame.z, packetWave.w) * 3.0;
          point = packetFrame.xy + n * local.x + t * local.y;
          wave = packetWave; heading = packetHeading;
          shape = vec3(packetFrame.z, packetShape); phaseValue = packetFrame.w;
          gl_Position = vec4(point / waterSize * 2.0, 0.0, 1.0); }`,
      fragmentShader: `precision highp float;
        varying vec2 local, point; varying vec4 wave, heading; varying vec3 shape;
        varying float phaseValue;
        void main() {
          vec2 q = local / vec2(shape.x, wave.w);
          float r2 = dot(q, q);
          if (r2 >= 9.0) discard;
          vec2 delta = heading.xy - point;
          float behind = dot(delta, heading.zw);
          float lateral = abs(dot(delta, vec2(-heading.w, heading.z)));
          float halfWidth = shape.z * .5 + max(0.0, behind) * .35355339059;
          float causal = smoothstep(0.0, shape.y, behind) *
            (1.0 - smoothstep(halfWidth, halfWidth + shape.z * .35, lateral));
          if (causal <= 0.0) discard;
          float envelope = exp(-r2) * (1.0-smoothstep(6.25,9.0,r2)) * causal;
          float h = wave.z * envelope * cos(length(wave.xy) * local.x + phaseValue);
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
      this.wave.setXYZW(count, current.nx * current.k, current.nz * current.k, current.amplitude, current.crossWidth);
      this.heading.setXYZW(count, current.headX, current.headZ, current.fx, current.fz);
      this.shape.setXY(count, current.frontSoftness, current.beam);
      count++;
    }
    this.packets.length = keep;
    this.frame.needsUpdate = true;
    this.wave.needsUpdate = true;
    this.heading.needsUpdate = true;
    this.shape.needsUpdate = true;
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
