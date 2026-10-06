// Index-only LOD: reuses the loaded model's vertices, UVs, textures and materials.
// No extra glTF, duplicate textures, runtime simplification or effect on contacts.
import { NodeIO } from '@gltf-transform/core';
import { MeshoptSimplifier } from 'meshoptimizer';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

await MeshoptSimplifier.ready;
const document = await new NodeIO().read(fileURLToPath(new URL('../models/cargo_03.optimized.glb', import.meta.url)));
const lods = {};
let before = 0, after = 0;
for (const node of document.getRoot().listNodes()) {
  const primitives = node.getMesh()?.listPrimitives();
  if (!primitives || primitives.length !== 1) continue;
  const p = primitives[0], positions = p.getAttribute('POSITION').getArray();
  const indices = new Uint32Array(p.getIndices().getArray());
  const target = Math.max(12, Math.floor(indices.length * .08 / 3) * 3);
  const [simplified] = MeshoptSimplifier.simplify(indices, positions, 3, target, .025, ['Permissive']);
  lods[node.getName()] = {
    vertices: positions.length / 3, originalIndices: indices.length, indices: Array.from(simplified),
  };
  before += indices.length / 3;
  after += simplified.length / 3;
}
await writeFile(new URL('../models/cargo_03.reflection-indices.json', import.meta.url), JSON.stringify(lods));
console.log(JSON.stringify({ before, after, reduction: 1 - after / before }));
