// Servidor local só para ver o site no computador: node tools/serve-local.js  (porta 3000)
// Na Vercel / GitHub Pages ele não é usado: o site é 100% estático (pasta site/).
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const SITE = path.join(__dirname, '..', 'site');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};
const TEXT = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.svg']);

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(SITE, rel));
  if (!file.startsWith(SITE + path.sep)) { res.writeHead(403); return res.end('Proibido'); }
  fs.readFile(file, (err, raw) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Página não encontrada'); }
    const ext = path.extname(file).toLowerCase();
    const h = { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-cache', vary: 'Accept-Encoding' };
    let body = raw;
    if (TEXT.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { body = zlib.gzipSync(raw); h['content-encoding'] = 'gzip'; }
    h['content-length'] = body.length;
    res.writeHead(200, h); res.end(req.method === 'HEAD' ? undefined : body);
  });
}).listen(PORT, () => console.log(`BioMake no ar: http://localhost:${PORT}`));
