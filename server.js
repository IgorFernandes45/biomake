// Servidor da BioMake: entrega o site e guarda as promoções (sem dependências externas).
// Uso:  node server.js          (porta 3000)
// Senha da equipe: variável BIOMAKE_PIN (sem ela, uma senha aleatória é gerada e mostrada no console).
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PIN = process.env.BIOMAKE_PIN || crypto.randomBytes(6).toString('hex'); // sem senha definida: gera uma aleatória a cada início
const SITE = path.join(__dirname, 'site');
const DATA_DIR = path.join(__dirname, 'data');
const DB = path.join(DATA_DIR, 'promos.json');

const STORES = ['all', 'petrolina', 'afranio', 'capim-grosso', 'santana-do-sobrado', 'cajazeiras'];
const THEMES = ['gold', 'pink', 'violet', 'white'];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8'
};

/* ---------- armazenamento ---------- */
function seed() {
  return [{
    id: 'seed', title: 'Qualquer produto por R$ 10,00', desc: 'Maquiagens, acessórios e muito mais. Em todas as lojas BioMake.',
    highlight: 'R$ 10,00', store: 'all', until: '', theme: 'gold', active: true, createdAt: new Date().toISOString()
  }];
}
function load() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch { fs.mkdirSync(DATA_DIR, { recursive: true }); const s = seed(); save(s); return s; }
}
function save(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, DB);
}
function todayRecife() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife' }).format(new Date()); // YYYY-MM-DD
}

/* ---------- segurança ---------- */
const fails = new Map(); // ip -> {n, t}
function authed(req) {
  const given = Buffer.from(String(req.headers['x-pin'] || ''));
  const real = Buffer.from(PIN);
  return given.length === real.length && crypto.timingSafeEqual(given, real);
}
function rateLimited(ip) {
  const f = fails.get(ip);
  return f && Date.now() - f.t < 60000 && f.n >= 5;
}
function noteFail(ip) {
  const f = fails.get(ip);
  if (!f || Date.now() - f.t >= 60000) fails.set(ip, { n: 1, t: Date.now() });
  else f.n++;
}

/* ---------- validação ---------- */
const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
function clean(b, partial) {
  const out = {};
  if (!partial || 'title' in b) out.title = str(b.title, 60);
  if (!partial || 'desc' in b) out.desc = str(b.desc, 240);
  if (!partial || 'highlight' in b) out.highlight = str(b.highlight, 24);
  if (!partial || 'until' in b) { const u = str(b.until, 10); out.until = /^\d{4}-\d{2}-\d{2}$/.test(u) ? u : ''; }
  if (!partial || 'store' in b) out.store = STORES.includes(b.store) ? b.store : 'all';
  if (!partial || 'theme' in b) out.theme = THEMES.includes(b.theme) ? b.theme : 'gold';
  if (!partial || 'active' in b) out.active = b.active !== false;
  if ('title' in out && !out.title) return null;
  return out;
}

/* ---------- http ---------- */
function send(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 20000) { reject(new Error('grande')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch (e) { reject(e); } });
  });
}

async function handleApi(req, res, url) {
  const ip = req.socket.remoteAddress;
  const isPublicGet = req.method === 'GET' && url.pathname === '/api/promos' && !url.searchParams.get('all');
  if (isPublicGet) {
    const today = todayRecife();
    return send(res, 200, { promos: load().filter(p => p.active && (!p.until || p.until >= today)) });
  }
  if (rateLimited(ip)) return send(res, 429, { error: 'Muitas tentativas. Aguarde um minuto.' });
  if (!authed(req)) { noteFail(ip); return send(res, 401, { error: 'Senha incorreta.' }); }
  fails.delete(ip);

  if (req.method === 'GET' && url.pathname === '/api/check') return send(res, 200, { ok: true });
  if (req.method === 'GET' && url.pathname === '/api/promos') return send(res, 200, { promos: load() });

  let body = {};
  if (req.method === 'POST' || req.method === 'PUT') {
    try { body = await readBody(req); } catch { return send(res, 400, { error: 'Dados inválidos.' }); }
  }
  if (req.method === 'POST' && url.pathname === '/api/promos') {
    const p = clean(body, false);
    if (!p) return send(res, 400, { error: 'Informe o título da promoção.' });
    const list = load(); const item = { id: crypto.randomUUID(), ...p, createdAt: new Date().toISOString() };
    list.unshift(item); save(list); return send(res, 201, { promo: item });
  }
  const m = url.pathname.match(/^\/api\/promos\/([\w-]+)$/);
  if (m) {
    const list = load(), i = list.findIndex(p => p.id === m[1]);
    if (i < 0) return send(res, 404, { error: 'Promoção não encontrada.' });
    if (req.method === 'PUT') {
      const p = clean(body, true);
      if (!p) return send(res, 400, { error: 'Título não pode ficar vazio.' });
      list[i] = { ...list[i], ...p }; save(list); return send(res, 200, { promo: list[i] });
    }
    if (req.method === 'DELETE') { list.splice(i, 1); save(list); return send(res, 200, { ok: true }); }
  }
  send(res, 404, { error: 'Rota não encontrada.' });
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(SITE, rel));
  if (!file.startsWith(SITE + path.sep) && file !== SITE) { res.writeHead(403); return res.end('Proibido'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Página não encontrada'); }
    const ext = path.extname(file).toLowerCase();
    const cache = ext === '.html' ? 'no-cache' : (['.js', '.css'].includes(ext) ? 'no-cache' : 'public, max-age=604800');
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'content-length': st.size, 'cache-control': cache, 'x-content-type-options': 'nosniff' });
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url).catch(() => send(res, 500, { error: 'Erro interno.' }));
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res, url);
}).listen(PORT, () => {
  console.log(`BioMake no ar: http://localhost:${PORT}`);
  if (!process.env.BIOMAKE_PIN) console.log(`⚠  BIOMAKE_PIN não definida. Senha temporária desta execução: ${PIN}`);
});
