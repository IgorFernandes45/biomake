(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var desktop = window.matchMedia && matchMedia('(min-width:900px) and (hover:hover)').matches;   // só aqui tem inclinação 3D e brilho do mouse

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

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmtPhone(d) { return d.length === 11 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7) : d; }
  function mapUrl(q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
  function waUrl(d) { return 'https://wa.me/55' + d + '?text=' + encodeURIComponent('Olá! Vim pelo site da BioMake 💜'); }

  /* ================= NAVEGAÇÃO (barra de abas) ================= */
  var VIEWS = ['inicio', 'lojas', 'marcas'];
  var current = null;
  function go(name, opts) {
    if (VIEWS.indexOf(name) < 0) name = 'inicio';
    opts = opts || {};
    if (name !== current) {
      $$('.view').forEach(function (v) { v.classList.toggle('active', v.dataset.view === name); });
      $$('.tab[data-go]').forEach(function (t) { t.classList.toggle('active', t.dataset.go === name); });
      $('#tabInd').style.setProperty('--i', VIEWS.indexOf(name));
      current = name;
      window.scrollTo(0, 0);
      if (window.BioScene) BioScene.setView(name);
      try { history.replaceState(null, '', '#' + name); } catch (e) { }
      document.title = name === 'inicio' ? 'BioMake — Qualquer produto por R$ 10,00' : $('#view-' + name + ' h1').textContent + ' · BioMake';
      watchReveals();
    }
    if (opts.focusStore) {
      setTimeout(function () {
        var c = $('[data-store="' + opts.focusStore + '"]'); if (!c) return;
        window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - 84, behavior: 'smooth' });
      }, 80);
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (!b) return;
    if (b.tagName === 'A') e.preventDefault();
    go(b.dataset.go, { focusStore: b.dataset.store });
  });
  var topbar = $('#topbar'), scrolledOn = false;
  window.addEventListener('scroll', function () {
    var s = window.scrollY > 24; if (s !== scrolledOn) { scrolledOn = s; topbar.classList.toggle('scrolled', s); }
  }, { passive: true });

  /* ================= RENDER: lojas / marcas ================= */
  function tiltable(node) { if (desktop) { node.classList.add('tilt'); node.appendChild(el('span', 'glare')); } }
  function renderStores() {
    var grid = $('#storeGrid'), rail = $('#homeRail');
    var gf = document.createDocumentFragment(), rf = document.createDocumentFragment();
    STORES.forEach(function (s) {
      // cartão da página Lojas
      var card = el('article', 'store'); card.dataset.store = s.slug;
      var photo = el('div', 'photo'), img = el('img'); img.src = s.img; img.alt = 'Fachada da BioMake ' + s.city; img.loading = 'lazy'; img.decoding = 'async'; img.width = 640; img.height = 1138;
      photo.appendChild(img); photo.appendChild(el('span', 'uf', s.uf)); card.appendChild(photo);
      var body = el('div', 'body'); body.appendChild(el('h3', '', s.city));
      s.units.forEach(function (u) {
        var box = el('div');
        if (u.name) box.appendChild(el('div', 'unit', u.name));
        box.appendChild(el('p', '', u.addr)); body.appendChild(box);
      });
      if (s.ref) body.appendChild(el('p', 'ref', 'Ref.: ' + s.ref));
      if (s.phone) body.appendChild(el('p', 'phone', fmtPhone(s.phone)));
      var act = el('div', 'actions');
      if (s.phone) { var w = el('a', 'btn wa', 'WhatsApp'); w.href = waUrl(s.phone); w.target = '_blank'; w.rel = 'noopener'; act.appendChild(w); }
      s.units.forEach(function (u) {
        var m = el('a', 'btn small glass', s.units.length > 1 ? 'Mapa · ' + u.name : 'Como chegar'); m.href = mapUrl(u.map); m.target = '_blank'; m.rel = 'noopener'; act.appendChild(m);
      });
      if (s.ig) { var ig = el('a', 'btn small glass', 'Instagram'); ig.href = 'https://instagram.com/' + s.ig; ig.target = '_blank'; ig.rel = 'noopener'; act.appendChild(ig); }
      var n = act.children.length - (s.phone ? 1 : 0);
      if (n % 2 === 1) act.lastElementChild.classList.add('only');
      body.appendChild(act); card.appendChild(body); tiltable(card); gf.appendChild(card);

      // cartão do carrossel da home
      var rc = el('button', 'rail-card'); rc.dataset.go = 'lojas'; rc.dataset.store = s.slug; rc.setAttribute('aria-label', 'Ver loja de ' + s.city);
      var ri = el('img'); ri.src = s.img; ri.alt = ''; ri.loading = 'lazy'; ri.decoding = 'async'; ri.width = 640; ri.height = 1138; rc.appendChild(ri);
      var cap = el('div', 'cap'); cap.appendChild(el('b', '', s.city)); cap.appendChild(el('span', '', s.uf === 'PE' ? 'Pernambuco' : s.uf === 'BA' ? 'Bahia' : 'Paraíba'));
      rc.appendChild(cap); rf.appendChild(rc);
    });
    grid.appendChild(gf); rail.appendChild(rf);
  }
  function renderBrands() {
    var grid = $('#brandGrid'), strip = $('#brandStrip');
    var gf = document.createDocumentFragment(), sf = document.createDocumentFragment();
    BRANDS.forEach(function (b) {
      var t = el('div', 'brand-tile ' + b.cls); t.style.setProperty('--tint', b.tint);
      var s = el('span'); s.innerHTML = b.html; t.appendChild(s); t.setAttribute('aria-label', b.name); tiltable(t);
      gf.appendChild(t); sf.appendChild(el('span', '', b.name));
    });
    grid.appendChild(gf); strip.appendChild(sf);
  }

  /* ================= EFEITOS (só computador com mouse) ================= */
  if (desktop) {
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest('.tilt'); if (!t) return;
      var r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      t.classList.add('live');
      t.style.setProperty('--ry', ((px - .5) * 14).toFixed(2) + 'deg');
      t.style.setProperty('--rx', ((.5 - py) * 14).toFixed(2) + 'deg');
      t.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); t.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest('.tilt'); if (!t || t.contains(e.relatedTarget)) return;
      t.classList.remove('live'); t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg');
    });
    (function () { var pc = $('.price-card'); if (pc) pc.appendChild(el('span', 'glare')); })();
    var av = $('#avatar');
    window.addEventListener('pointermove', function (e) {
      if (current !== 'inicio') return;
      var nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
      av.style.setProperty('--px', (nx * 26).toFixed(1) + 'px'); av.style.setProperty('--py', (ny * 16).toFixed(1) + 'px'); av.style.setProperty('--pr', (nx * 3).toFixed(2) + 'deg');
    }, { passive: true });
  } else {
    var pcard = $('.price-card'); if (pcard) pcard.classList.remove('tilt');
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('in'); io.unobserve(x.target);
      if (x.target.contains($('#priceNum'))) countUp();
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' }) : null;
  function watchReveals() { $$('.reveal:not(.in)').forEach(function (n) { io ? io.observe(n) : n.classList.add('in'); }); }
  var counted = false;
  function countUp() {
    if (counted) return; counted = true;
    var n = $('#priceNum'), to = +n.dataset.to, t0 = performance.now();
    (function step(t) {
      var p = Math.min((t - t0) / 1100, 1), e = 1 - Math.pow(1 - p, 4);
      n.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ================= WHATSAPP ================= */
  var waSheet = $('#waSheet');
  function renderWa() {
    var box = $('#waList');
    STORES.filter(function (s) { return s.phone; }).forEach(function (s) {
      var a = el('a', 'wa-row'); a.href = waUrl(s.phone); a.target = '_blank'; a.rel = 'noopener';
      var t = el('span', 'wa-txt'); t.appendChild(el('b', '', s.city + ' · ' + s.uf)); t.appendChild(el('small', '', fmtPhone(s.phone)));
      a.appendChild(t); a.appendChild(el('span', 'wa-go', 'Chamar')); box.appendChild(a);
    });
  }
  function toggleWa(open) {
    waSheet.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
    if (window.BioScene) BioScene.pause(open);   // com a janela aberta o 3D fica parado (poupa bateria)
  }
  document.addEventListener('click', function (e) { if (e.target.closest('[data-wa]')) toggleWa(true); });
  waSheet.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) toggleWa(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !waSheet.hidden) toggleWa(false); });

  /* ================= INICIALIZAÇÃO ================= */
  renderStores(); renderBrands(); renderWa();
  $('#year').textContent = new Date().getFullYear();
  var first = (location.hash || '').replace('#', '');
  go(VIEWS.indexOf(first) >= 0 ? first : 'inicio');
  watchReveals();
})();
