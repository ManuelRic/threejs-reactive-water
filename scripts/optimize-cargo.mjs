import { NodeIO } from '@gltf-transform/core';
import { weld, simplify, dedup, prune, flatten, join } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import { fileURLToPath } from 'node:url';
const io = new NodeIO();
const document = await io.read(fileURLToPath(new URL('../models/cargo_03.glb', import.meta.url)));
const triangles = () => document.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((n, p) => n + (p.getIndices()?.getCount() || p.getAttribute('POSITION').getCount()) / 3, 0), 0);
const before = triangles();
await document.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: .06, error: .003 }),
  dedup(), flatten(), join(), prune());
await io.write(fileURLToPath(new URL('../models/cargo_03.optimized.glb', import.meta.url)), document);
console.log(JSON.stringify({ before, after: triangles(), reduction: 1 - triangles() / before,
  meshes: document.getRoot().listMeshes().length,
  primitives: document.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().length, 0) }));
