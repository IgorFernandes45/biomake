/* Cena 3D de maquiagens (Three.js r128) — objetos procedurais, sem arquivos externos */
(function () {
  var canvas = document.getElementById('gl');
  if (!canvas || !window.THREE) { if (canvas) canvas.remove(); return; }
  var T = THREE;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // celular / aparelho simples: menos pixels, menos polígonos, materiais mais baratos e 30 quadros por segundo
  var mobile = window.innerWidth < 900 || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
  var lowEnd = mobile || (navigator.hardwareConcurrency || 8) <= 4;
  var SEG = lowEnd ? .5 : 1;
  function seg(n) { return Math.max(12, Math.round(n * SEG)); }

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !mobile, alpha: true, powerPreference: mobile ? 'default' : 'high-performance' });
  } catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  var scene = new T.Scene();
  var FOV = 35, CAM_Z = 14;
  var camera = new T.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAM_Z;

  /* ---------- ambiente (reflexos) ---------- */
  (function env() {
    var c = document.createElement('canvas'); c.width = lowEnd ? 512 : 1024; c.height = lowEnd ? 256 : 512;
    var g = c.getContext('2d'); g.scale(c.width / 1024, c.height / 512);
    var bg = g.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0, '#7b3aa8'); bg.addColorStop(.5, '#2a0a3d'); bg.addColorStop(1, '#12031f');
    g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
    function box(x, y, w, h, col, blur) { g.save(); g.shadowColor = col; g.shadowBlur = blur; g.fillStyle = col; g.fillRect(x, y, w, h); g.restore(); }
    box(120, 60, 220, 120, '#ffffff', 60);
    box(620, 40, 260, 90, '#fff1c4', 60);
    box(420, 200, 120, 200, '#ff8fcf', 50);
    box(860, 220, 90, 160, '#ffd76b', 40);
    box(0, 230, 90, 140, '#b57bff', 40);
    var tex = new T.CanvasTexture(c);
    tex.mapping = T.EquirectangularReflectionMapping;
    tex.encoding = T.sRGBEncoding;
    var pm = new T.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(tex).texture;
    tex.dispose(); pm.dispose();
  })();

  scene.add(new T.HemisphereLight(0xffe9ff, 0x2a0a3d, 0.7));
  var key = new T.DirectionalLight(0xfff0d0, 1.6); key.position.set(4, 6, 8); scene.add(key);
  var rim = new T.PointLight(0xff5fb0, 2.2, 40); rim.position.set(-8, -2, 6); scene.add(rim);
  if (!lowEnd) { var rim2 = new T.PointLight(0x9a6bff, 1.6, 40); rim2.position.set(8, 3, -2); scene.add(rim2); }

  /* ---------- materiais ---------- */
  function std(color, metal, rough, extra) {
    var m = new T.MeshStandardMaterial({ color: color, metalness: metal, roughness: rough, envMapIntensity: 1.25 });
    if (extra) Object.assign(m, extra);
    return m;
  }
  function phys(color, rough, extra) {
    if (lowEnd) {   // sem verniz (clearcoat): bem mais leve e visualmente parecido
      var l = new T.MeshStandardMaterial({ color: color, metalness: .35, roughness: Math.max(rough, .12), envMapIntensity: 1.3 });
      if (extra) Object.assign(l, extra);
      return l;
    }
    var m = new T.MeshPhysicalMaterial({ color: color, metalness: 0.05, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 });
    if (extra) Object.assign(m, extra);
    return m;
  }
  var M = {
    gold: std(0xf6c944, 1, 0.2),
    goldDark: std(0xb98516, 1, 0.35),
    chrome: std(0xffffff, 1, 0.04),
    purple: phys(0x6a1b9a, 0.22),
    deepPurple: phys(0x3d0f58, 0.25),
    pink: phys(0xe8508f, 0.2),
    black: phys(0x16061f, 0.2),
    cream: std(0xf7dcc4, 0, 0.9),
    powder: std(0xf2a7c3, 0, 0.95)
  };

  function mesh(geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; }
  function cyl(rt, rb, h, mat, x, y, z, sg) { return mesh(new T.CylinderGeometry(rt, rb, h, seg(sg || 48)), mat, x, y, z); }
  function lathe(points, mat, sg) {
    return new T.Mesh(new T.LatheGeometry(points.map(function (p) { return new T.Vector2(p[0], p[1]); }), seg(sg || 48)), mat);
  }

  /* ---------- objetos ---------- */
  function lipstick(color) {
    var g = new T.Group();
    g.add(cyl(.44, .44, 1.1, M.gold, 0, -.6, 0));
    g.add(cyl(.46, .46, .1, M.purple, 0, -.02, 0));
    g.add(cyl(.35, .35, .5, M.goldDark, 0, .28, 0));
    var bg = new T.CylinderGeometry(.31, .31, .9, seg(40), 6);
    var p = bg.attributes.position;
    for (var i = 0; i < p.count; i++) {
      if (p.getY(i) > .44) p.setY(i, .45 + p.getX(i) * .6 + p.getZ(i) * .02);
      else if (p.getY(i) > .3) { var k = (p.getY(i) - .3) / .15; p.setX(i, p.getX(i) * (1 - .06 * k)); }
    }
    bg.computeVertexNormals();
    var bullet = new T.Mesh(bg, phys(color, .18));
    bullet.position.y = .98; g.add(bullet);
    g.position.y = -.1;
    var w = new T.Group(); w.add(g); return w;
  }

  function brush() {
    var g = new T.Group();
    g.add(lathe([[.001, -1.35], [.07, -1.33], [.13, -1.1], [.15, -.6], [.12, .1], [.1, .35], [.001, .35]], M.purple, 40));
    g.add(cyl(.15, .12, .62, M.gold, 0, .62, 0, 40));
    g.add(cyl(.155, .155, .05, M.goldDark, 0, .4, 0, 40));
    g.add(lathe([[.001, .92], [.12, .93], [.27, 1.12], [.3, 1.34], [.2, 1.66], [.08, 1.86], [.001, 1.92]], M.powder, 40));
    g.position.y = -.25;
    var w = new T.Group(); w.add(g); return w;
  }

  function compact() {
    var g = new T.Group();
    g.add(cyl(1.05, 1.08, .34, M.gold, 0, 0, 0, 64));
    g.add(cyl(.86, .86, .06, M.deepPurple, 0, .18, 0, 64));
    g.add(cyl(.74, .74, .1, M.powder, 0, .2, 0, 64));
    var ring = mesh(new T.TorusGeometry(.8, .03, 8, seg(64)), M.gold, 0, .24, 0); ring.rotation.x = Math.PI / 2; g.add(ring);
    var lid = new T.Group();
    lid.add(cyl(1.08, 1.08, .16, M.purple, 0, .08, 0, 64));
    lid.add(cyl(.86, .86, .03, M.chrome, 0, -.01, 0, 64));
    var rim = mesh(new T.TorusGeometry(1.07, .045, 8, seg(64)), M.gold, 0, .08, 0); rim.rotation.x = Math.PI / 2; lid.add(rim);
    var heart = heartMesh(.28, M.gold); heart.rotation.x = -Math.PI / 2; heart.position.y = .18; lid.add(heart);
    var hinge = new T.Group(); hinge.position.set(0, .18, -1.05); lid.position.set(0, 0, 1.05);
    hinge.add(lid); hinge.rotation.x = -1.95; g.add(hinge);
    g.rotation.x = .25; g.position.y = -.35;
    var w = new T.Group(); w.add(g); return w;
  }

  function polish() {
    var g = new T.Group();
    g.add(cyl(.62, .66, 1.1, phys(0xd81b78, .08, { transparent: true, opacity: .96 }), 0, -.25, 0, 48));
    g.add(cyl(.46, .5, .88, phys(0xff6fb1, .08), 0, -.22, 0, 48));
    g.add(cyl(.22, .26, .18, M.gold, 0, .39, 0, 32));
    g.add(cyl(.2, .2, .16, M.goldDark, 0, .5, 0, 32));
    g.add(cyl(.2, .2, 1.1, M.black, 0, 1.12, 0, 32));
    g.add(cyl(.215, .215, .06, M.gold, 0, .6, 0, 32));
    g.position.y = -.35;
    var w = new T.Group(); w.add(g); return w;
  }

  function palette() {
    var g = new T.Group();
    g.add(mesh(new T.BoxGeometry(2.2, .24, 1.5), M.gold, 0, 0, 0));
    g.add(mesh(new T.BoxGeometry(2.08, .26, 1.38), M.deepPurple, 0, .01, 0));
    var cols = [0xe7b8a0, 0xc2185b, 0x7b1fa2, 0xffd54f, 0xff7fb6, 0x4a148c];
    cols.forEach(function (c, i) {
      var x = -.7 + (i % 3) * .7, z = i < 3 ? -.32 : .32;
      g.add(cyl(.28, .28, .06, std(c, .55, .35), x, .14, z, 40));
    });
    var lid = new T.Group();
    lid.add(mesh(new T.BoxGeometry(2.2, .14, 1.5), M.purple, 0, .07, 0));
    lid.add(mesh(new T.BoxGeometry(1.7, .03, 1.1), M.chrome, 0, -.01, 0));
    var h = heartMesh(.3, M.gold); h.rotation.x = -Math.PI / 2; h.position.y = .16; lid.add(h);
    var hinge = new T.Group(); hinge.position.set(0, .12, -.75); lid.position.set(0, 0, .75);
    hinge.add(lid); hinge.rotation.x = -1.75; g.add(hinge);
    g.rotation.x = .35; g.position.y = -.2;
    var w = new T.Group(); w.add(g); return w;
  }

  function heartShape() {
    var s = new T.Shape(), x = 0, y = 0;
    s.moveTo(x + .25, y + .25);
    s.bezierCurveTo(x + .25, y + .25, x + .2, y, x, y);
    s.bezierCurveTo(x - .3, y, x - .3, y + .35, x - .3, y + .35);
    s.bezierCurveTo(x - .3, y + .55, x - .1, y + .77, x + .25, y + .95);
    s.bezierCurveTo(x + .6, y + .77, x + .8, y + .55, x + .8, y + .35);
    s.bezierCurveTo(x + .8, y + .35, x + .8, y, x + .5, y);
    s.bezierCurveTo(x + .35, y, x + .25, y + .25, x + .25, y + .25);
    return s;
  }
  function heartMesh(scale, mat, depth) {
    var geo = new T.ExtrudeGeometry(heartShape(), { depth: depth || .22, bevelEnabled: true, bevelThickness: .08, bevelSize: .07, bevelSegments: lowEnd ? 3 : 6, curveSegments: lowEnd ? 12 : 24 });
    geo.center(); geo.rotateZ(Math.PI); geo.scale(scale, scale, scale);   // o contorno original vem de cabeça para baixo
    var m = new T.Mesh(geo, mat); return m;
  }
  function bigHeart() {
    var h = heartMesh(2.6, std(0xf0b400, .75, .28, { emissive: new T.Color(0x7a4c00), emissiveIntensity: .5 }), .35);
    var w = new T.Group(); w.add(h); return w;
  }

  /* ---------- partículas douradas ---------- */
  var sparkTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,240,170,1)'); gr.addColorStop(.25, 'rgba(250,213,79,.8)'); gr.addColorStop(1, 'rgba(250,213,79,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  })();
  var N = mobile ? 40 : 130;
  var sp = new Float32Array(N * 3), sv = new Float32Array(N);
  for (var i = 0; i < N; i++) { sp[i * 3] = (Math.random() - .5) * 26; sp[i * 3 + 1] = (Math.random() - .5) * 16; sp[i * 3 + 2] = (Math.random() - .5) * 10 - 2; sv[i] = .15 + Math.random() * .4; }
  var sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
  var sparks = new T.Points(sg, new T.PointsMaterial({ map: sparkTex, size: .34, transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true }));
  scene.add(sparks);

  /* ---------- montagem ---------- */
  var root = new T.Group(); scene.add(root);
  var defs = [
    { n: 'heart',  make: bigHeart,                        spin: 0, tilt: 0, sway: .55 },
    { n: 'lipA',   make: function () { return lipstick(0xe0245e); }, spin: .6, tilt: .12 },
    { n: 'lipB',   make: function () { return lipstick(0x8a1c7c); }, spin: -.5, tilt: -.1 },
    { n: 'brush',  make: brush,                           spin: .45, tilt: .1 },
    { n: 'compact',make: compact,                         spin: .35, tilt: .05 },
    { n: 'polish', make: polish,                          spin: -.55, tilt: 0 },
    { n: 'palette',make: palette,                         spin: .3, tilt: .05 }
  ];
  var objs = {}, heartOp = 1;
  defs.forEach(function (d, i) {
    var wrap = new T.Group(), model = d.make();
    wrap.add(model); root.add(wrap);
    objs[d.n] = { wrap: wrap, model: model, def: d, phase: i * 1.7,
      cur: { x: 0, y: 0, z: -6, s: .01, rz: 0 }, tgt: { x: 0, y: 0, z: -6, s: 1, rz: 0 } };
  });

  /* ---------- layouts por tela (frações da metade visível) ---------- */
  var view = 'inicio', wide = true, hw = 7, hh = 4.4, unit = .9;
  var h0 = (location.hash || '').slice(1); if (h0 === 'lojas' || h0 === 'marcas' || h0 === 'promocoes') view = h0;
  var L = {
    inicio_wide: {
      heart:  [.64,  .02, -4.5, 1.15, 0],
      lipA:   [.12,  .5, .5, 1.0, .5],
      lipB:   [.95,  .42, -.5, .95, -.4],
      brush:  [.04, -.42, 1, 1.0, .55],
      compact:[.93, -.5, 1, 1.1, 0],
      polish: [.30, -.70, 1.5, .85, .2],
      palette:[.74,  .78, -1.5, .9, -.15]
    },
    inicio_narrow: {
      heart:  [0, -.3, -4.5, 1.0, 0],
      lipA:   [-.86, -.12, 1, .85, .45],
      lipB:   [.88, -.18, 1, .8, -.4],
      brush:  [-.8, -.62, 1.5, .82, .5],
      compact:[.78, -.62, 1.5, .9, 0],
      polish: [-.45, -.95, 2, .6, .2],
      palette:[.5, -.96, 2, .65, -.15]
    },
    outros_wide: [
      { heart: [.8, .62, -10, .42, 0], lipA: [-.96, -.2, -2, .7, .5], lipB: [.96, -.45, -2, .7, -.4], brush: [.94, .5, -3, .7, .5], compact: [-.93, -.7, -2, .75, 0], polish: [.68, -.95, -3, .55, .2], palette: [-.7, -.95, -3, .6, -.15] },
      { heart: [-.8, -.7, -10, .42, 0], lipA: [.96, .3, -2, .7, -.5], lipB: [-.96, -.35, -2, .7, .4], brush: [-.62, -.95, -3, .7, .4], compact: [.92, -.6, -2, .75, 0], polish: [.55, .9, -3, .55, .2], palette: [-.95, -.85, -3, .6, .15] },
      { heart: [.85, -.6, -10, .42, 0], lipA: [-.95, -.5, -2, .7, .5], lipB: [.95, .55, -2, .7, -.4], brush: [-.97, -.1, -3, .7, .6], compact: [.96, -.1, -2, .75, 0], polish: [.0, -.97, -3, .55, .2], palette: [.55, -.95, -3, .6, .1] }
    ],
    outros_narrow: [
      { heart: [.8, .7, -10, .5, 0], lipA: [-.95, -.1, -2, .5, .5], lipB: [.95, -.5, -2, .45, -.4], brush: [.95, .55, -3, .45, .5], compact: [-.95, -.7, -2, .5, 0], polish: [.6, -.97, -3, .38, .2], palette: [-.6, -.97, -3, .4, -.1] },
      { heart: [-.8, -.7, -10, .5, 0], lipA: [.95, .3, -2, .5, -.5], lipB: [-.95, -.2, -2, .45, .4], brush: [-.6, -.97, -3, .45, .4], compact: [.95, -.6, -2, .5, 0], polish: [.55, .9, -3, .38, .2], palette: [-.95, -.9, -3, .4, .1] },
      { heart: [.85, -.6, -10, .5, 0], lipA: [-.95, -.5, -2, .5, .5], lipB: [.95, .55, -2, .45, -.4], brush: [-.95, -.1, -3, .45, .6], compact: [.95, -.1, -2, .5, 0], polish: [0, -.98, -3, .38, .2], palette: [.5, -.97, -3, .4, .1] }
    ]
  };
  var variant = { lojas: 0, marcas: 1, promocoes: 2 };

  function layoutFor() {
    if (view === 'inicio') return L[wide ? 'inicio_wide' : 'inicio_narrow'];
    return L[wide ? 'outros_wide' : 'outros_narrow'][variant[view] || 0];
  }
  function applyLayout() {
    var lay = layoutFor();
    Object.keys(objs).forEach(function (k) {
      var a = lay[k], o = objs[k];
      o.tgt.x = a[0] * hw; o.tgt.y = a[1] * hh; o.tgt.z = a[2]; o.tgt.s = a[3] * unit * (k === 'heart' ? (wide ? 2.0 : 1.7) : 1); o.tgt.rz = a[4];
    });
  }

  var W = 0, H = 0;
  function resize() {
    var w = window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    if (w === W && h === H) return;   // a barra de endereço do celular mexe só na altura da janela: não recria nada
    W = w; H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    hh = Math.tan(FOV * Math.PI / 360) * CAM_Z; hw = hh * camera.aspect;
    unit = Math.max(.3, Math.min(hh * .14, hw * .2));
    wide = w >= 900;   // mesmo ponto de quebra do layout em CSS
    applyLayout();
  }
  window.addEventListener('resize', resize);
  resize();
  // posição inicial já no alvo, só a escala "nasce"
  Object.keys(objs).forEach(function (k) { var o = objs[k]; o.cur.x = o.tgt.x; o.cur.y = o.tgt.y; o.cur.z = o.tgt.z - 3; o.cur.s = .01; o.cur.rz = o.tgt.rz; });

  /* ---------- interação ---------- */
  var mx = 0, my = 0, tx = 0, ty = 0, scrollY = 0;
  window.addEventListener('pointermove', function (e) { tx = (e.clientX / W) * 2 - 1; ty = (e.clientY / H) * 2 - 1; }, { passive: true });
  window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 30)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 40));
    }, { passive: true });
  }

  var clock = new T.Clock(), running = true, paused = false, acc = 0, shown = false, minDt = lowEnd ? 1 / 30 - .004 : 0;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) clock.getDelta(); });

  var tNow = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (!running || paused) return;
    acc += clock.getDelta();
    if (acc < minDt) return;
    tick(Math.min(acc, .05)); acc = 0;
    if (!shown) { shown = true; canvas.classList.add('on'); }
  }
  function tick(dt) {
    tNow += dt; var t = tNow;
    var k = 1 - Math.exp(-dt * 3.2);
    mx += (tx - mx) * (1 - Math.exp(-dt * 4)); my += (ty - my) * (1 - Math.exp(-dt * 4));
    root.rotation.y = mx * .16; root.rotation.x = my * .08;
    var pxToWorld = (2 * hh) / H;
    var idx = 0;
    Object.keys(objs).forEach(function (n) {
      var o = objs[n], c = o.cur, g = o.tgt, d = o.def;
      c.x += (g.x - c.x) * k; c.y += (g.y - c.y) * k; c.z += (g.z - c.z) * k; c.s += (g.s - c.s) * k; c.rz += (g.rz - c.rz) * k;
      var par = (n === 'heart' ? .1 : .32 + (idx % 3) * .16);
      var sy = scrollY * pxToWorld * par;
      var bob = reduce ? 0 : Math.sin(t * .9 + o.phase) * .16;
      o.wrap.position.set(c.x + mx * (n === 'heart' ? -.3 : .5) * (idx % 2 ? 1 : -1), c.y + bob + sy, c.z);
      o.wrap.scale.setScalar(Math.max(c.s, .001));
      o.wrap.rotation.z = c.rz;
      if (d.sway) o.model.rotation.y = reduce ? 0 : Math.sin(t * .55 + o.phase) * d.sway;
      else if (!reduce) o.model.rotation.y += dt * d.spin;
      o.model.rotation.x = d.tilt + Math.sin(t * .7 + o.phase) * .06 + my * .1;
      idx++;
    });
    if (!reduce) {
      var p = sg.attributes.position;
      for (var i = 0; i < N; i++) {
        var y = p.array[i * 3 + 1] + sv[i] * dt;
        if (y > 8.5) y = -8.5;
        p.array[i * 3 + 1] = y;
      }
      p.needsUpdate = true;
    }
    // o coração some ao descer a página (não atrapalha a leitura) e fica discreto nas outras telas
    var hm = objs.heart.model.children[0].material;
    var hTarget = view === 'inicio' ? Math.max(0, 1 - scrollY / (H * .7)) : .4;
    heartOp += (hTarget - heartOp) * k;
    hm.transparent = true; hm.depthWrite = false; hm.opacity = heartOp; objs.heart.wrap.visible = heartOp > .02;
    sparks.position.y = scrollY * pxToWorld * .15;
    renderer.render(scene, camera);
  }
  frame();

  window.BioScene = {
    setView: function (v) { view = v; applyLayout(); },
    tick: tick,
    pause: function (p) { paused = !!p; if (!p) { clock.getDelta(); acc = 0; } },
    _d: { scene: scene, objs: objs, camera: camera, renderer: renderer }
  };
})();
