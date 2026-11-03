(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ================= DADOS ================= */
  var STORES = [
    { slug: 'petrolina', city: 'Petrolina', uf: 'PE', img: 'img/petrolina.webp',
      units: [
        { name: 'Loja 2', addr: 'Av. Barão do Rio Branco, 844 — Centro', map: 'Av. Barão do Rio Branco, 844, Centro, Petrolina - PE' },
        { name: 'Loja 1', addr: 'Av. dos Guararapes', map: 'Av. dos Guararapes, Petrolina - PE' }
      ] },
    { slug: 'afranio', city: 'Afrânio', uf: 'PE', img: 'img/afranio.webp',
      units: [{ name: '', addr: 'Rua José dos Operários, 284', map: 'Rua José dos Operários, 284, Afrânio - PE' }],
      ref: 'Em frente à NDL', phone: '87988298359', ig: 'biomakeafranio' },
    { slug: 'capim-grosso', city: 'Capim Grosso', uf: 'BA', img: 'img/capim-grosso.webp',
      units: [{ name: '', addr: 'Av. Otaviano Ferreira — Praça Central', map: 'Av. Otaviano Ferreira, Capim Grosso - BA' }],
      ref: 'Antigo prédio da Coelba', phone: '74999693712', ig: 'biomake.cg' },
    { slug: 'santana-do-sobrado', city: 'Santana do Sobrado', uf: 'BA', img: 'img/santana-do-sobrado.webp',
      units: [{ name: '', addr: 'Travessa Belo Jardim — Praça Principal', map: 'Travessa Belo Jardim, Santana do Sobrado - BA' }],
      ref: 'Nos pontos comerciais do Gavião', phone: '', ig: 'biomakecn' },
    { slug: 'cajazeiras', city: 'Cajazeiras', uf: 'PB', img: 'img/cajazeiras.webp',
      units: [{ name: '', addr: 'Engenheiro Carlos Pires de Sá, 288 — Centro', map: 'Engenheiro Carlos Pires de Sá, 288, Centro, Cajazeiras - PB' }],
      ref: 'Em frente ao CEDIC', phone: '83981732355', ig: 'biomakecz' }
  ];

  var BRANDS = [
    { name: 'Ruby Rose', cls: 'bt-ruby', tint: 'rgba(255,120,170,.32)', html: 'Ruby Rose' },
    { name: 'Mahav', cls: 'bt-mahav', tint: 'rgba(170,120,255,.32)', html: 'Mahav' },
    { name: 'Fenzza', cls: 'bt-fenzza', tint: 'rgba(250,213,79,.3)', html: 'Fenzza' },
    { name: 'Dermachem', cls: 'bt-derma', tint: 'rgba(110,235,200,.26)', html: 'derma<b>chem</b>' },
    { name: 'Dapop', cls: 'bt-dapop', tint: 'rgba(255,120,220,.32)', html: 'Dapop' },
    { name: 'Playboy', cls: 'bt-play', tint: 'rgba(255,255,255,.2)', html: 'Playboy' }
  ];

  var FALLBACK_PROMOS = [{
    id: 'seed', title: 'Qualquer produto por R$ 10,00', desc: 'Maquiagens, acessórios e muito mais. Em todas as lojas BioMake.',
    highlight: 'R$ 10,00', store: 'all', until: '', theme: 'gold', active: true
  }];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmtPhone(d) { return d.length === 11 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7) : d; }
  function mapUrl(q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
  function waUrl(d) { return 'https://wa.me/55' + d + '?text=' + encodeURIComponent('Olá! Vim pelo site da BioMake 💜'); }
  function scenePause(p) { if (window.BioScene) BioScene.pause(p); }   // com uma janela aberta o 3D fica parado (poupa bateria)
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ================= NAVEGAÇÃO (barra de abas) ================= */
  var VIEWS = ['inicio', 'lojas', 'marcas', 'promocoes'];
  var current = null;
  function go(name, opts) {
    if (VIEWS.indexOf(name) < 0) name = 'inicio';
    opts = opts || {};
    if (name !== current) {
      $$('.view').forEach(function (v) { v.classList.toggle('active', v.dataset.view === name); });
      $$('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.go === name); });
      $('#tabInd').style.setProperty('--i', VIEWS.indexOf(name));
      current = name;
      window.scrollTo(0, 0);
      if (window.BioScene) BioScene.setView(name);
      try { history.replaceState(null, '', '#' + name); } catch (e) { }
      document.title = name === 'inicio' ? 'BioMake — Qualquer produto por R$ 10,00' : $('#view-' + name + ' h1').textContent + ' · BioMake';
    }
    if (opts.focusStore) {
      setTimeout(function () {
        var c = $('[data-store="' + opts.focusStore + '"]'); if (!c) return;
        var y = c.getBoundingClientRect().top + window.scrollY - 90; window.scrollTo({ top: y, behavior: 'smooth' });
        c.animate([{ boxShadow: '0 0 0 0 rgba(250,213,79,.9)' }, { boxShadow: '0 0 0 14px rgba(250,213,79,0)' }], { duration: 1100 });
      }, 120);
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (!b) return;
    if (b.tagName === 'A') e.preventDefault();
    go(b.dataset.go, { focusStore: b.dataset.store });
  });
  window.addEventListener('scroll', function () { $('#topbar').classList.toggle('scrolled', window.scrollY > 24); }, { passive: true });

  /* ================= RENDER: lojas / marcas ================= */
  function renderStores() {
    var grid = $('#storeGrid'), rail = $('#homeRail');
    STORES.forEach(function (s) {
      // cartão da página Lojas
      var card = el('article', 'store tilt'); card.dataset.store = s.slug;
      var photo = el('div', 'photo'), img = el('img'); img.src = s.img; img.alt = 'Fachada da BioMake ' + s.city; img.loading = 'lazy'; img.width = 640; img.height = 1138;
      photo.appendChild(img); photo.appendChild(el('span', 'uf', s.uf)); card.appendChild(photo);
      var body = el('div', 'body'); body.appendChild(el('h3', '', s.city));
      s.units.forEach(function (u) {
        var box = el('div');
        if (u.name) box.appendChild(el('div', 'unit', u.name));
        box.appendChild(el('p', '', u.addr)); body.appendChild(box);
      });
      if (s.ref) body.appendChild(el('p', 'ref', 'Ref.: ' + s.ref));
      var act = el('div', 'actions');
      if (s.phone) { var w = el('a', 'btn small wa', 'WhatsApp'); w.href = waUrl(s.phone); w.target = '_blank'; w.rel = 'noopener'; act.appendChild(w); }
      if (s.ig) { var ig = el('a', 'btn small glass', '@' + s.ig); ig.href = 'https://instagram.com/' + s.ig; ig.target = '_blank'; ig.rel = 'noopener'; act.appendChild(ig); }
      s.units.forEach(function (u) {
        var m = el('a', 'btn small glass', s.units.length > 1 ? 'Mapa · ' + u.name : 'Como chegar'); m.href = mapUrl(u.map); m.target = '_blank'; m.rel = 'noopener'; act.appendChild(m);
      });
      body.appendChild(act);
      if (s.phone) { var ph = el('p', 'ref', fmtPhone(s.phone)); body.insertBefore(ph, act); }
      card.appendChild(body); card.appendChild(el('span', 'glare')); grid.appendChild(card);

      // cartão do carrossel da home
      var rc = el('button', 'rail-card'); rc.dataset.go = 'lojas'; rc.dataset.store = s.slug; rc.setAttribute('aria-label', 'Ver loja de ' + s.city);
      var ri = el('img'); ri.src = s.img; ri.alt = ''; ri.loading = 'lazy'; ri.width = 640; ri.height = 1138; rc.appendChild(ri);
      var cap = el('div', 'cap'); cap.appendChild(el('b', '', s.city)); cap.appendChild(el('span', '', s.uf === 'PE' ? 'Pernambuco' : s.uf === 'BA' ? 'Bahia' : 'Paraíba'));
      rc.appendChild(cap); rail.appendChild(rc);
    });
  }
  function renderBrands() {
    var grid = $('#brandGrid'), strip = $('#brandStrip');
    BRANDS.forEach(function (b) {
      var t = el('div', 'brand-tile tilt ' + b.cls); t.style.setProperty('--tint', b.tint);
      var s = el('span'); s.innerHTML = b.html; t.appendChild(s); t.appendChild(el('span', 'glare')); t.setAttribute('aria-label', b.name);
      grid.appendChild(t);
      strip.appendChild(el('span', '', b.name));
    });
  }

  /* ================= EFEITOS: tilt 3D, parallax, reveal ================= */
  function bindTilt(root) {
    root.addEventListener('pointermove', function (e) {
      var t = e.target.closest('.tilt'); if (!t || e.pointerType === 'touch') return;
      var r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      t.classList.add('live');
      t.style.setProperty('--ry', ((px - .5) * 14).toFixed(2) + 'deg');
      t.style.setProperty('--rx', ((.5 - py) * 14).toFixed(2) + 'deg');
      t.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); t.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    root.addEventListener('pointerout', function (e) {
      var t = e.target.closest('.tilt'); if (!t || t.contains(e.relatedTarget)) return;
      t.classList.remove('live'); t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg');
    });
  }
  bindTilt(document);
  // o cartão de preço da home também recebe o brilho
  (function () { var pc = $('.price-card'); if (pc) pc.appendChild(el('span', 'glare')); })();

  var stage = $('#stage'), av = $('#avatar');
  if (stage) {
    window.addEventListener('pointermove', function (e) {
      if (current !== 'inicio' || e.pointerType === 'touch') return;
      var nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
      av.style.setProperty('--px', (nx * 26).toFixed(1) + 'px'); av.style.setProperty('--py', (ny * 16).toFixed(1) + 'px'); av.style.setProperty('--pr', (nx * 3).toFixed(2) + 'deg');
    }, { passive: true });
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('in'); io.unobserve(x.target);
      if (x.target.contains($('#priceNum'))) countUp();
    });
  }, { threshold: .15 }) : null;
  function watchReveals() { $$('.reveal:not(.in)').forEach(function (n) { io ? io.observe(n) : n.classList.add('in'); }); }
  var counted = false;
  function countUp() {
    if (counted) return; counted = true;
    var n = $('#priceNum'), to = +n.dataset.to, t0 = performance.now();
    (function step(t) {
      var p = Math.min((t - t0) / 1300, 1), e = 1 - Math.pow(1 - p, 4);
      n.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ================= PROMOÇÕES ================= */
  var promos = [], filter = 'all', apiOk = true;
  var pin = ''; try { pin = sessionStorage.getItem('bm_pin') || ''; } catch (e) { }
  var storeName = function (slug) { var s = STORES.filter(function (x) { return x.slug === slug; })[0]; return s ? s.city : 'Todas as lojas'; };
  function fmtDate(iso) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }

  function loadPromos() {
    return fetch('/api/promos', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (d) { promos = d.promos; apiOk = true; })
      .catch(function () { promos = FALLBACK_PROMOS; apiOk = false; })
      .then(function () { $('#openAdmin').hidden = !apiOk; renderChips(); renderPromos(); var n = promos.length; $('#promoBadge').hidden = !n; $('#promoBadge').textContent = n; $('#promoDot').hidden = !n; });
  }
  function renderChips() {
    var box = $('#promoChips'); box.innerHTML = '';
    [{ slug: 'all', city: 'Todas' }].concat(STORES).forEach(function (s) {
      var c = el('button', 'chip' + (filter === s.slug ? ' on' : ''), s.city); c.type = 'button'; c.setAttribute('role', 'tab');
      c.onclick = function () { filter = s.slug; renderChips(); renderPromos(); };
      box.appendChild(c);
    });
  }
  function renderPromos() {
    var list = $('#promoList'); list.innerHTML = '';
    var items = promos.filter(function (p) { return filter === 'all' || p.store === 'all' || p.store === filter; });
    if (!items.length) { list.appendChild(el('div', 'empty', 'Nenhuma promoção para esta loja agora. Volte logo — sempre tem novidade! 💜')); return; }
    items.forEach(function (p) {
      var c = el('article', 'promo t-' + (p.theme || 'gold') + ' reveal');
      c.appendChild(el('span', 'tag', storeName(p.store)));
      if (p.highlight) c.appendChild(el('div', 'hl', p.highlight));
      c.appendChild(el('h3', '', p.title));
      if (p.desc) c.appendChild(el('p', '', p.desc));
      c.appendChild(el('div', 'meta', p.until ? 'Válida até ' + fmtDate(p.until) : 'Por tempo indeterminado'));
      var sh = el('button', 'share', 'Compartilhar no WhatsApp'); sh.type = 'button';
      sh.onclick = function () {
        var txt = '*' + p.title + '*' + (p.highlight ? ' — ' + p.highlight : '') + (p.desc ? '\n' + p.desc : '') + '\nBioMake: ' + location.origin;
        window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      };
      c.appendChild(sh); list.appendChild(c);
    });
    watchReveals();
  }

  /* ---------- área da loja (cadastro) ---------- */
  var sheet = $('#sheet');
  function openSheet() {
    sheet.hidden = false; document.body.style.overflow = 'hidden'; scenePause(true);
    if (pin) tryLogin(pin, true); else { $('#loginForm').hidden = false; $('#adminPanel').hidden = true; setTimeout(function () { $('#pin').focus(); }, 300); }
  }
  function closeSheet() { sheet.hidden = true; document.body.style.overflow = ''; scenePause(false); }
  $('#openAdmin').onclick = openSheet;
  sheet.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

  function api(path, method, body) {
    var h = { 'x-pin': pin }; if (body) h['content-type'] = 'application/json';
    return fetch(path, { method: method || 'GET', headers: h, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var er = new Error(d.error || 'Erro'); er.status = r.status; throw er; } return d; });
    });
  }
  function tryLogin(p, silent) {
    pin = p;
    return api('/api/check').then(function () {
      try { sessionStorage.setItem('bm_pin', pin); } catch (e) { }
      $('#loginForm').hidden = true; $('#adminPanel').hidden = false; $('#loginErr').hidden = true; fillStoreSelect(); loadAdmin();
    }).catch(function (err) {
      pin = ''; try { sessionStorage.removeItem('bm_pin'); } catch (e) { }
      $('#loginForm').hidden = false; $('#adminPanel').hidden = true;
      if (!silent) {
        var m = $('#loginErr'); m.hidden = false;
        m.textContent = err.status === 401 ? 'Senha incorreta.' : err.status === 429 ? 'Muitas tentativas. Aguarde um minuto.' : 'Servidor não conectado. Abra o site pelo servidor da BioMake (veja o LEIA-ME).';
      }
    });
  }
  $('#loginForm').addEventListener('submit', function (e) { e.preventDefault(); tryLogin($('#pin').value); $('#pin').value = ''; });
  $('#logout').onclick = function () { pin = ''; try { sessionStorage.removeItem('bm_pin'); } catch (e) { } closeSheet(); toast('Você saiu da área da loja'); };

  function fillStoreSelect() {
    var s = $('#pStore'); if (s.options.length) return;
    [{ slug: 'all', city: 'Todas as lojas' }].concat(STORES).forEach(function (x) { var o = el('option', '', x.city); o.value = x.slug; s.appendChild(o); });
  }
  var editing = null;
  function resetForm() {
    editing = null; $('#promoForm').reset(); $('#pId').value = ''; $('#pActive').checked = true; $('#pSave').textContent = 'Cadastrar promoção'; $('#pCancel').hidden = true;
  }
  $('#pCancel').onclick = resetForm;
  function loadAdmin() {
    api('/api/promos?all=1').then(function (d) {
      var box = $('#adminList'); box.innerHTML = '';
      if (!d.promos.length) box.appendChild(el('p', 'muted', 'Nenhuma promoção cadastrada ainda.'));
      d.promos.forEach(function (p) {
        var expired = p.until && p.until < new Date().toISOString().slice(0, 10);
        var it = el('div', 'a-item' + (!p.active || expired ? ' off' : ''));
        var left = el('div'); left.appendChild(el('b', '', (p.highlight ? p.highlight + ' · ' : '') + p.title));
        left.appendChild(el('small', '', storeName(p.store) + ' · ' + (p.until ? 'até ' + fmtDate(p.until) : 'sem prazo') + (expired ? ' · EXPIRADA' : !p.active ? ' · pausada' : '')));
        it.appendChild(left);
        var ac = el('div', 'a-actions');
        var ed = el('button', '', 'Editar'), tg = el('button', '', p.active ? 'Pausar' : 'Ativar'), dl = el('button', 'del', 'Excluir');
        ed.onclick = function () {
          editing = p.id; $('#pId').value = p.id; $('#pTitle').value = p.title; $('#pDesc').value = p.desc || ''; $('#pHighlight').value = p.highlight || '';
          $('#pUntil').value = p.until || ''; $('#pStore').value = p.store; $('#pTheme').value = p.theme; $('#pActive').checked = p.active;
          $('#pSave').textContent = 'Salvar alterações'; $('#pCancel').hidden = false; $('.sheet').scrollTo({ top: 0, behavior: 'smooth' });
        };
        tg.onclick = function () { api('/api/promos/' + p.id, 'PUT', { active: !p.active }).then(function () { loadAdmin(); loadPromos(); toast(p.active ? 'Promoção pausada' : 'Promoção ativada'); }).catch(function (e) { toast(e.message); }); };
        dl.onclick = function () { if (!confirm('Excluir "' + p.title + '"?')) return; api('/api/promos/' + p.id, 'DELETE').then(function () { loadAdmin(); loadPromos(); toast('Promoção excluída'); }).catch(function (e) { toast(e.message); }); };
        ac.appendChild(ed); ac.appendChild(tg); ac.appendChild(dl); it.appendChild(ac); box.appendChild(it);
      });
    }).catch(function () { pin = ''; $('#loginForm').hidden = false; $('#adminPanel').hidden = true; });
  }
  $('#promoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var body = { title: $('#pTitle').value.trim(), desc: $('#pDesc').value.trim(), highlight: $('#pHighlight').value.trim(), until: $('#pUntil').value, store: $('#pStore').value, theme: $('#pTheme').value, active: $('#pActive').checked };
    var req = editing ? api('/api/promos/' + editing, 'PUT', body) : api('/api/promos', 'POST', body);
    req.then(function () { toast(editing ? 'Promoção atualizada ✓' : 'Promoção cadastrada ✓'); resetForm(); loadAdmin(); loadPromos(); }).catch(function (er) { toast(er.message); });
  });

  /* ================= WHATSAPP ================= */
  var waSheet = $('#waSheet');
  function renderWa() {
    var box = $('#waList');
    STORES.filter(function (s) { return s.phone; }).forEach(function (s) {
      var a = el('a', 'wa-row'); a.href = waUrl(s.phone); a.target = '_blank'; a.rel = 'noopener';
      var t = el('span', 'wa-txt'); t.appendChild(el('b', '', s.city + ' · ' + s.uf)); t.appendChild(el('small', '', fmtPhone(s.phone)));
      a.appendChild(t); a.appendChild(el('span', 'wa-go', 'Chamar ›')); box.appendChild(a);
    });
  }
  function toggleWa(open) { waSheet.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; scenePause(open); }
  document.addEventListener('click', function (e) { if (e.target.closest('[data-wa]')) toggleWa(true); });
  waSheet.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) toggleWa(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !waSheet.hidden) toggleWa(false); });

  /* ================= INICIALIZAÇÃO ================= */
  renderStores(); renderBrands(); renderWa();
  $('#year').textContent = new Date().getFullYear();
  var first = (location.hash || '').replace('#', '');
  go(VIEWS.indexOf(first) >= 0 ? first : 'inicio');
  watchReveals();
  loadPromos();
})();
