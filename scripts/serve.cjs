const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.glsl': 'text/plain', '.jpg': 'image/jpeg', '.png': 'image/png', '.glb': 'model/gltf-binary' };
http.createServer((req, res) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(p => p.startsWith('.'))) {
      res.writeHead(403).end(); return;
    }
  } catch { res.writeHead(400).end(); return; }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
}).listen(8080, '127.0.0.1', () => console.log('Water lab: http://127.0.0.1:8080'));
