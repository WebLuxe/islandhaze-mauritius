/* Island Haze — <runway-section> "Try the Look." */
(function () {
  const D = window.IH_DATA;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => RM.matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const wrapN = (v, N) => ((v % N) + N) % N;
  const wrapS = (v, N) => { v = wrapN(v, N); return v > N / 2 ? v - N : v; };
  const FEEL = { K: 95, lag: .04 };
  FEEL.C = 2 * Math.sqrt(FEEL.K);

  const ICON = {
    prev: '<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M25 7H1M7 1L1 7l6 6"/></svg>',
    next: '<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>',
    play: '<svg class="rw__i-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
    pause: '<svg class="rw__i-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z"/></svg>',
    plus: '<svg class="rw__i-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>',
    check: '<svg class="rw__i-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7"/></svg>',
    spin: '<svg class="rw__i-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    ctaArrow: '<svg class="rw__cta-arrow" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>',
    ctaSpin: '<svg class="rw__cta-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>'
  };

  /* ---------- Markup ---------- */
  function thumb(p, w) {
    if (p.image) return `<img src="${esc(p.thumb || p.image)}" loading="lazy" decoding="async" alt="" width="${w}" height="${Math.round(w * 1.25)}">`;
    return `<span class="ih-ph" style="--ph:${p.tone}"><span>${esc(p.type)}</span></span>`;
  }
  function modelImg(lk) {
    return `<img src="${lk.m640}" srcset="${lk.m640} 640w, ${lk.m1080} 1080w" sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px" loading="eager" decoding="async" width="1100" height="1956" draggable="false" data-model-image alt="${esc(lk.name)}">`;
  }
  function buildMarkup(sid) {
    const L = D.looks;
    const label = (lk, i) => `Look ${i + 1}: ${lk.name}`;
    const bodies = L.map((lk, i) => `<div class="rw__model" data-rw-model data-index="${i}" aria-hidden="true"><span class="rw__shadow"></span><div class="rw__figure" style="--rw-ar:0.5625"><div class="rw__art">${modelImg(lk)}<button type="button" class="rw__hit" data-rw-go="${i}" aria-label="${esc(label(lk, i))}" tabindex="-1"></button></div></div></div>`).join('');
    const heroes = L.map((lk, i) => {
      const pins = lk.products.map((id, j) => {
        const p = D.byId(id), n = j + 1, [x, y] = lk.pins[j];
        return `<button type="button" class="rw__pin" data-rw-pin="${n}" data-tip="${esc(p.name)}" style="left:${x}%;top:${y}%;--pi:${n}" aria-label="${n}: ${esc(p.name)}" tabindex="-1"><span class="rw__pin-dot">${n}</span></button>`;
      }).join('');
      return `<div class="rw__hero${i === 0 ? ' is-on' : ''}" data-rw-hero data-index="${i}" data-name="${esc(lk.name)}" data-label="${esc(label(lk, i))}" data-probe="${lk.m640}" aria-hidden="${i === 0 ? 'false' : 'true'}"><div class="rw__morph"><span class="rw__shadow"></span><div class="rw__figure" style="--rw-ar:0.5625"><div class="rw__art">${modelImg(lk)}<button type="button" class="rw__zoom" data-rw-zoom aria-label="View look: ${esc(lk.name)}" tabindex="-1"></button><div class="rw__pins">${pins}</div></div></div></div></div>`;
    }).join('');
    const ticks = L.map((lk, i) => `<button type="button" class="rw__tick" data-rw-tick="${i}" aria-current="${i === 0}" aria-label="${esc(label(lk, i))}"><span class="rw__tick-bar"></span><span class="rw__tick-label">${pad(i + 1)}<span class="rw__tick-name">&nbsp;&nbsp;${esc(lk.name)}</span></span></button>`).join('');
    const panels = L.map((lk, i) => {
      const prods = lk.products.map(D.byId);
      const avail = prods.filter(p => !p.soldOut);
      const full = avail.reduce((s, p) => s + p.price, 0);
      const bundle = Math.round(full * .9);
      const pieces = `${prods.length} pieces`;
      const rows = prods.map((p, j) => {
        const n = j + 1, pid = `Picker-${sid}-look_${lk.key}-${n}`, oname = `Opt-${sid}-look_${lk.key}-${n}-1`;
        const pills = p.sizes.map((s, k) => `<label class="rw__pill"><input type="radio" name="${oname}" value="${esc(s)}" data-rw-option="0"${k === 0 ? ' checked' : ''}><span class="rw__pill-label">${esc(s)}</span></label>`).join('');
        return `<li class="rw__item" data-rw-card="${n}" style="--i:${n}" data-title="${esc(p.name)}"${p.soldOut ? ' data-soldout' : ''}>` +
          (p.isNew ? '<span class="rw__tag"><span class="rw__tag-text">New</span></span>' : '') +
          `<a class="rw__media" href="${p.page}" tabindex="-1" aria-hidden="true">${thumb(p, 400)}<span class="rw__num">${n}</span></a>` +
          `<div class="rw__info"><span class="rw__type">Island Haze · ${esc(p.type)}</span><a class="rw__name" href="${p.page}">${esc(p.name)}</a><span class="rw__price"><span>${D.money(p.price)}</span>${p.soldOut ? '<span class="rw__so">Sold out</span>' : ''}</span></div>` +
          `<button type="button" class="rw__add" data-rw-add aria-expanded="false" aria-controls="${pid}" aria-label="Add to bag: ${esc(p.name)}" data-added-label="Added to bag: ${esc(p.name)}">${ICON.plus}${ICON.check}${ICON.spin}</button>` +
          `<div class="rw__picker" data-rw-picker id="${pid}" hidden>` +
            `<div class="rw__picker-head"><span class="rw__picker-thumb">${thumb(p, 160)}</span><span><span class="rw__picker-title">${esc(p.name)}</span><span class="rw__picker-price">${D.money(p.price)}</span></span><button type="button" class="rw__pick-close" data-rw-pick-close aria-label="Close size picker">${ICON.close}</button></div>` +
            `<fieldset class="rw__opt"><legend class="rw__opt-name">${esc(p.legend)}</legend><div class="rw__opt-values">${pills}</div></fieldset>` +
            `<button type="button" class="rw__confirm" data-rw-confirm><span data-rw-confirm-label data-add="Add to bag">Add to bag</span><span class="rw__sr"> — ${esc(p.name)}</span></button>` +
            `<script type="application/json" data-rw-variants>${JSON.stringify(p.variants)}</script>` +
          `</div></li>`;
      }).join('');
      return `<div class="rw__look-panel${i === 0 ? ' is-in' : ''}" data-rw-panel="${i}"${i === 0 ? '' : ' hidden'}>` +
        `<div class="rw__mhead"><span class="rw__mhead-title">${esc(lk.name)}</span><span class="rw__label">${pieces}</span></div>` +
        `<ul class="rw__items" role="list">${rows}</ul>` +
        `<div class="rw__bundle has-rule"><p class="rw__msg" data-rw-msg role="status" aria-live="polite"></p>` +
          `<div class="rw__bundle-row"><span class="rw__bundle-copy"><span class="rw__bundle-title">Complete the look</span><span class="rw__bundle-note">Bundle all ${avail.length}${avail.length < prods.length ? ' in stock' : ''} and save 10%</span></span>` +
          `<span class="rw__bundle-price"><s>${D.money(full)}</s><strong>${D.money(bundle)}</strong></span></div>` +
          `<button type="button" class="rw__cta" data-rw-all><span class="rw__cta-add">Add full look to bag</span><span class="rw__cta-m">Add full look — ${D.money(bundle)}</span><span class="rw__cta-done">Full look in your bag</span>${ICON.ctaArrow}${ICON.ctaSpin}</button>` +
        `</div><template data-rw-pieces-text>${pieces}</template></div>`;
    }).join('');

    return `<div class="rw__sticky"><div class="rw__grid">
<div class="rw__left">
  <div class="rw__head"><div class="rw__intro"><h2 class="rw__title">Try the Look.</h2><p class="rw__sub">Six Island Haze looks, styled head to toe. Tap a pin to see the piece.</p></div><span class="rw__sr" aria-live="polite" aria-atomic="true" data-rw-live></span></div>
  <div class="rw__stage" data-rw-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="Try the Look. — use arrow keys or swipe to change look">
    <div class="rw__actors" data-rw-actors>${bodies}</div>
    <div class="rw__heroes" data-rw-heroes>${heroes}</div>
    <span class="rw__sweep"></span>
    <span class="rw__cursor" data-rw-cursor><span class="rw__cursor-in"><span class="rw__cursor-label rw__cursor-drag">Drag</span><span class="rw__cursor-label rw__cursor-view">View</span></span></span>
    <span class="rw__walk"><span class="rw__walk-line"></span></span>
  </div>
  <div class="rw__controls">
    <button type="button" class="rw__icon" data-rw-prev aria-label="Previous look">${ICON.prev}</button>
    <div class="rw__ticks">${ticks}</div>
    <button type="button" class="rw__icon rw__auto" data-rw-auto aria-pressed="false" aria-label="Autoplay">${ICON.play}${ICON.pause}</button>
    <button type="button" class="rw__icon" data-rw-next aria-label="Next look">${ICON.next}</button>
  </div>
  <div class="rw__lb" data-rw-lb data-word="Look" role="region" aria-label="View look" aria-hidden="true">
    <div class="rw__lb-stage" data-rw-lb-stage></div>
    <div class="rw__lb-top"><p class="rw__lb-cap"><span class="rw__lb-kicker" data-rw-lb-kicker></span><span class="rw__lb-name" data-rw-lb-name></span></p><button type="button" class="rw__lb-close" data-rw-zoom-close aria-label="Close">${ICON.close}</button></div>
    <p class="rw__lb-hint">Tap a dot to shop the piece</p>
  </div>
</div>
<aside class="rw__panel has-rule" aria-label="In this look"><div class="rw__panel-inner">
  <div class="rw__panel-head"><h3 class="rw__panel-title">In this look</h3><span class="rw__label" data-rw-pieces>3 pieces</span></div>
  ${panels}
</div></aside>
</div></div>`;
  }

  /* ---------- Element ---------- */
  class RunwaySection extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.innerHTML = buildMarkup(this.id || 'runway');
      this.setup();
    }
    disconnectedCallback() { if (this._teardown) this._teardown(); this._ready = false; }

    setup() {
      const $ = s => this.querySelector(s), $$ = s => [...this.querySelectorAll(s)];
      const ds = this.dataset;
      const n = D.looks.length;
      this.n = n;
      this.blurOn = ds.blur !== 'false';
      this.speed = parseInt(ds.speed, 10) || 5000;
      this.style.setProperty('--rw-speed', this.speed / 1000 + 's');
      this.stage = $('[data-rw-stage]');
      this.actors = $('[data-rw-actors]');
      this.heroes = $$('[data-rw-hero]');
      this.ticks = $$('[data-rw-tick]');
      this.panels = $$('[data-rw-panel]');
      this.live = $('[data-rw-live]');
      this.piecesEl = $('[data-rw-pieces]');
      this.autoBtn = $('[data-rw-auto]');
      this.lb = $('[data-rw-lb]');
      this.lbStage = $('[data-rw-lb-stage]');
      this.cursor = $('[data-rw-cursor]');

      // Clone bodies to fill the ring.
      const orig = $$('[data-rw-model]');
      const N = n * Math.ceil(8 / n);
      for (let a = n; a < N; a++) {
        const c = orig[a % n].cloneNode(true);
        c.dataset.index = a;
        c.setAttribute('data-rw-clone', '');
        c.querySelectorAll('img').forEach(im => { im.loading = 'lazy'; });
        this.actors.appendChild(c);
      }
      this.N = N;
      this.start = reduced() ? 0 : 1.15;
      const hm = /^#look-([0-9]+)$/.exec(location.hash);
      const i0 = hm ? clamp(parseInt(hm[1], 10) - 1, 0, n - 1) : 0;
      this.index = 0; this.target = i0; this.cur = i0 - this.start; this.vel = 0;
      this.holding = true; // keep the ring parked until the section is revealed
      this.bodies = $$('[data-rw-model]').map((el, a) => ({ el, a, look: a % n, w: 0, x: 0, v: 0, g: 0, gPrev: null, trip: false, from: 0, tg: 0, blur: -1, op: -1 }));
      this.still = false;
      this.visible = false;
      this.playing = false;
      this.engaged = false;
      this.panelHover = false;
      this.zoomed = false;
      this.drag = null;
      this.mode = '';
      this.vh = 0; this.vw = 0;
      this.raf = 0; this.lastT = 0;
      this._tick = this.tick.bind(this);
      this.sheetHost = null;
      this.sheetPicker = null;

      this.classList.add('rw--js');
      this.decodeImages(this);
      this.measure();
      this.bodies.forEach(s => { s.x = s.g = wrapN(s.a - this.target, N) + this.start; s.gPrev = wrapN(s.a - this.target, N); });
      this.setIndex(0, true);
      if (i0) this.setIndex(i0);
      this.renderAll();
      this.initPickers();
      this.bind();
      this.detectFeet();
      if (ds.autoplay === 'true' && !reduced() && !(window.Shopify && Shopify.designMode)) this.play(true);
    }

    decodeImages(root) {
      root.querySelectorAll('img[data-model-image]:not(.is-decoded)').forEach(im => {
        const done = () => im.classList.add('is-decoded');
        const tryDecode = () => im.decode ? im.decode().then(done, () => { if (im.naturalWidth) done(); }) : done();
        if (im.complete && im.naturalWidth) tryDecode();
        else im.addEventListener('load', tryDecode, { once: true });
        if (im.loading !== 'lazy' && !im.complete) tryDecode();
      });
    }

    /* ----- Measure ----- */
    headerH() {
      let h = 0;
      document.querySelectorAll('.shopify-section-group-header-group, #shopify-section-header, #shopify-section-announcement-bar').forEach(el => {
        if (el.contains(this)) return;
        const cs = getComputedStyle(el);
        if (cs.display !== 'none' && cs.visibility !== 'hidden') h += el.offsetHeight;
      });
      return h;
    }
    measure() {
      const mobile = innerWidth <= 749;
      const mode = mobile ? 'classic' : 'ring';
      let frameH;
      if (mobile) {
        if (!this.vh || innerWidth !== this.vw || Math.abs(innerHeight - this.vh) >= 160) { this.vh = innerHeight; }
        frameH = this.vh * clamp(parseFloat(this.dataset.mheightVh) || 109, 50, 120) / 100;
      } else {
        this.vh = innerHeight;
        frameH = Math.max(380, innerHeight - this.headerH());
      }
      this.vw = innerWidth;
      this.style.setProperty('--rw-frame-h', Math.round(frameH) + 'px');
      const r = this.stage.getBoundingClientRect();
      this.W = r.width; this.H = r.height;
      this.mobile = mobile;
      this.fs = mode === 'ring' ? 1.08 : 1;
      const modelH = mode === 'ring' ? Math.max(200, Math.round((this.H - 34 - 18) / 1.08)) : Math.max(200, Math.round(this.H - (mobile ? 22 : 36) - 18));
      let hx, hy;
      if (mode === 'ring') { hx = .5 * this.W; hy = 34; } else if (mobile) { hx = .3 * this.W; hy = 22; } else { hx = .4 * this.W; hy = 36; }
      const st = this.stage.style;
      st.setProperty('--rw-model-h', modelH + 'px');
      st.setProperty('--rw-hx', hx + 'px');
      st.setProperty('--rw-hy', hy + 'px');
      st.setProperty('--rw-fs', this.fs);
      this.style.setProperty('--rw-ax', (hx / (this.W || 1) * 100).toFixed(2) + '%');
      this.bodies.forEach(s => { s.w = s.el.offsetWidth || modelH * .5625; });
      this.unit = mode === 'ring' ? Math.max(mobile ? 90 : 120, .3 * this.W) : Math.max(90, this.W * .32 * 1.6);
      if (mode !== this.mode) {
        const prev = this.mode;
        this.mode = mode;
        if (prev) {
          this.cur = this.target; this.vel = 0;
          this.bodies.forEach(s => { const g = wrapN(s.a - this.target, this.N); s.x = s.g = g; s.v = 0; s.trip = false; s.gPrev = g; });
          if (!mobile) this.dockAll();
          this.updateA11y();
        }
      }
      this.renderAll();
    }

    /* ----- Render ----- */
    put(s, x, bottom, scale, op, blur, z) {
      const hw = s.w * scale / 2;
      if (x + hw < -4 || x - hw > this.W + 4) op = 0;
      const st = s.el.style;
      st.transform = `translate3d(${x.toFixed(2)}px,${(-bottom).toFixed(2)}px,0) translateX(-50%) scale(${scale.toFixed(4)})`;
      const o = +op.toFixed(3);
      if (o !== s.op) { st.opacity = o; st.visibility = o < .01 ? 'hidden' : ''; st.pointerEvents = o < .5 ? 'none' : ''; s.op = o; }
      if (z !== s.z) { st.zIndex = z; s.z = z; }
      // Coarser blur steps on phones: each new blur radius re-rasterises a large image on the GPU.
      const q = this.mobile ? 2 : 10;
      const b = this.blurOn ? Math.round(blur * q) / q : 0;
      if (b !== s.blur) { st.filter = b > .05 ? `blur(${b}px)` : ''; s.blur = b; }
    }
    renderAll() { if (!this.W) return; this.mode === 'ring' ? this.renderRing() : this.renderClassic(); }
    renderRing() {
      const { W, H, N, fs } = this, mob = this.mobile;
      const cx = .5 * W, R = (mob ? .72 : .62) * W, P = (mob ? 1.9 : 1.65) * W, floor = H - 34, hor = .36 * H, step = 2 * Math.PI / N;
      for (const s of this.bodies) {
        let phi = ((s.a - this.cur) * step) % (2 * Math.PI);
        if (phi <= -Math.PI) phi += 2 * Math.PI; else if (phi > Math.PI) phi -= 2 * Math.PI;
        const z = R * (1 - Math.cos(phi)), persp = P / (P + z), sl = Math.abs(phi) / step;
        const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
        const x = cx + R * Math.sin(phi) * persp;
        const feet = hor + (floor - hor) * persp;
        const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
        let op = clamp((Math.cos(phi) + .55) / .3, 0, 1);
        if (this.still && sl < .02) op = 0;
        this.put(s, x, H - feet, scale, op, blur, Math.round(scale * 1000));
      }
    }
    renderClassic() {
      const W = this.W, m = this.mobile;
      const c = m ? { ax: .3, ay: 22, sx: .32, sy: 22, sr: .76, ex: .55, d: 4 } : { ax: .4, ay: 36, sx: .125, sy: 58, sr: .76, ex: .38, d: 5 };
      for (const s of this.bodies) {
        let k = s.x, e = -1;
        if (s.trip) {
          const span = s.tg - s.from;
          const u = clamp(Math.abs(s.x - s.from) / (Math.abs(span) || 1), 0, 1);
          if (span > 0) { if (u < .5) e = 2 * u * 1.4; else k = s.tg + 2 * (1 - u); }
          else { if (u < .5) k = s.from + 2 * u; else e = 2 * (1 - u) * 1.4; }
        } else if (k < 0) e = Math.min(-k, 1.4);
        if (e >= 0) {
          this.put(s, W * (c.ax - c.ex * e), c.ay - 22 * e, 1 + .14 * e, Math.max(0, 1 - 1.05 * e), 4 * Math.min(e, 1), 1100);
        } else {
          let op = k <= c.d - 1 ? 1 - .13 * k : Math.max(0, .61 * (c.d - k));
          if (this.still && Math.abs(k) < .02) op = 0;
          this.put(s, W * (c.ax + c.sx * k), c.ay + c.sy * k, Math.pow(c.sr, k), op, Math.min(.9 * k, 3.2), 1000 - Math.round(10 * k));
        }
      }
    }
    setStill(v) { if (this.still === v) return; this.still = v; this.classList.toggle('rw--still', v); }

    /* ----- Loop ----- */
    kick() {
      if (this.holding) return;
      if (!this.raf && this.visible && !document.hidden) { this.lastT = 0; this.raf = requestAnimationFrame(this._tick); }
    }
    tick(t) {
      this.raf = 0;
      const dt = this.lastT ? Math.min(.034, (t - this.lastT) / 1000) : 1 / 60;
      this.lastT = t;
      const { K, C } = FEEL, h = dt / 3;
      let moving = false;
      if (this.mode === 'ring') {
        if (reduced() && !this.drag) { this.cur = this.target; this.vel = 0; }
        else {
          for (let i = 0; i < 3; i++) { const acc = -K * (this.cur - this.target) - C * this.vel; this.vel += acc * h; this.cur += this.vel * h; }
          if (Math.abs(this.cur - this.target) <= .0005 && Math.abs(this.vel) <= .0005) { this.cur = this.target; this.vel = 0; } else moving = true;
        }
      } else {
        const N = this.N, dragging = !!(this.drag && this.drag.active);
        for (const s of this.bodies) {
          const goal = wrapN(s.a - this.target, N);
          if (s.gPrev !== null && Math.abs(goal - s.gPrev) > N / 2) { s.trip = true; s.from = s.x; }
          if (s.trip) s.tg = goal;
          s.gPrev = goal;
          if (reduced() && !dragging) { s.x = s.g = goal; s.v = 0; s.trip = false; continue; }
          const tau = dragging ? .016 : s.trip ? .1 : .03 + FEEL.lag * Math.min(goal, 4);
          s.g += (goal - s.g) * (1 - Math.exp(-dt / tau));
          for (let i = 0; i < 3; i++) { const acc = -K * (s.x - s.g) - C * s.v; s.v += acc * h; s.x += s.v * h; }
          if (s.trip && Math.abs(s.x - goal) < .02) s.trip = false;
          if (Math.abs(s.x - goal) < .0006 && Math.abs(s.v) < .0006 && Math.abs(s.g - goal) < .0006) { s.x = s.g = goal; s.v = 0; s.trip = false; }
          else moving = true;
        }
        this.cur = this.target;
      }
      if (this.drag && this.drag.active) moving = true;
      if (moving) { this.setStill(false); this.renderAll(); this.raf = requestAnimationFrame(this._tick); }
      else { this.lastT = 0; this.setStill(true); this.renderAll(); }
    }

    /* ----- Index ----- */
    rank(s) {
      return this.mode === 'ring' ? Math.round(wrapS(s.a - this.target, this.N)) : Math.round(wrapN(s.a - Math.round(this.target), this.N));
    }
    updateA11y() {
      const lim = this.mode === 'ring' ? 2 : 3;
      this.bodies.forEach(s => {
        const k = this.rank(s), on = k !== 0 && Math.abs(k) <= lim;
        const hit = s.el.querySelector('.rw__hit');
        hit.tabIndex = on ? 0 : -1;
        if (on) s.el.removeAttribute('aria-hidden'); else s.el.setAttribute('aria-hidden', 'true');
      });
    }
    setIndex(i, silent) {
      const old = this.index;
      this.index = i;
      this.kick();
      this.updateA11y();
      if (!silent && i === old) return;
      if (!silent) { this.closeZoom(); if (this.mobile) this.closeSheet(); }
      this.style.setProperty('--rw-progress', ((i + 1) / this.n).toFixed(3));
      this.heroes.forEach((h, j) => {
        h.classList.toggle('is-on', j === i);
        h.classList.toggle('was', j === old && j !== i);
        h.setAttribute('aria-hidden', j === i ? 'false' : 'true');
        h.querySelector('[data-rw-zoom]').tabIndex = j === i ? 0 : -1;
      });
      if (!silent && !reduced()) { this.stage.classList.remove('is-sweep'); void this.stage.offsetWidth; this.stage.classList.add('is-sweep'); }
      if (!silent) this.live.textContent = this.heroes[i].dataset.label;
      this.ticks.forEach((t, j) => { t.setAttribute('aria-current', j === i ? 'true' : 'false'); t.classList.toggle('is-past', j < i); });
      if (!silent) {
        this.panels.forEach(p => { p.classList.remove('is-in'); p.hidden = true; });
        const p = this.panels[i]; p.hidden = false; void p.offsetWidth; p.classList.add('is-in');
        const tpl = p.querySelector('[data-rw-pieces-text]');
        this.piecesEl.textContent = tpl ? tpl.innerHTML.trim() : '';
        this.piecesEl.classList.remove('is-swap'); void this.piecesEl.offsetWidth; this.piecesEl.classList.add('is-swap');
      } else {
        const tpl = this.panels[i].querySelector('[data-rw-pieces-text]');
        this.piecesEl.textContent = tpl ? tpl.innerHTML.trim() : '';
      }
      this.clearHot();
      this.restartBar();
    }
    moveTo(T) { this.target = T; this.setStill(false); this.setIndex(wrapN(T, this.n)); this.kick(); }
    next() { this.moveTo(Math.round(this.target) + 1); }
    prev() { this.moveTo(Math.round(this.target) - 1); }
    go(i) { let d = wrapN(i - this.index, this.n); if (d > this.n / 2) d -= this.n; this.moveTo(Math.round(this.target) + d); }
    get activePanel() { return this.panels[this.index]; }

    /* ----- Autoplay ----- */
    play(on) {
      this.playing = on;
      this.classList.toggle('is-playing', on);
      this.autoBtn.classList.toggle('is-playing', on);
      this.autoBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      this.restartBar();
    }
    restartBar() {
      clearTimeout(this.timer);
      this.ticks.forEach(t => t.classList.remove('is-run'));
      if (!this.playing) return;
      const t = this.ticks[this.index];
      void t.offsetWidth;
      t.classList.add('is-run');
      this.timer = setTimeout(() => {
        if (this.playing && !this.holding && this.visible && !(this.drag && this.drag.active) && !document.hidden && !this.panelHover && !this.zoomed && !this.engaged) this.next();
        else this.restartBar();
      }, this.speed);
    }
    engage() { this.engaged = true; if (this.playing) this.play(false); }

    /* ----- Hot linking ----- */
    clearHot() { this.querySelectorAll('.is-hot').forEach(e => e.classList.remove('is-hot')); }
    hot(n, scroll) {
      this.clearHot();
      const scope = this.zoomed ? this.lbStage : this.heroes[this.index];
      const pin = scope && scope.querySelector(`[data-rw-pin="${n}"]`);
      if (pin) pin.classList.add('is-hot');
      const card = this.activePanel.querySelector(`[data-rw-card="${n}"]`);
      if (!card) return;
      card.classList.add('is-hot');
      if (scroll) this.reveal(card);
    }
    reveal(card) {
      const list = card.closest('.rw__items');
      const behavior = reduced() ? 'auto' : 'smooth';
      if (list.scrollWidth > list.clientWidth + 2) {
        list.scrollTo({ left: list.scrollLeft + card.getBoundingClientRect().left - list.getBoundingClientRect().left - 20, behavior });
      } else if (list.scrollHeight > list.clientHeight + 2) {
        list.scrollTo({ top: card.offsetTop - list.offsetTop - 12, behavior });
      } else {
        const r = card.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight - 140) window.scrollBy({ top: r.top - .3 * innerHeight, behavior });
      }
    }

    /* ----- Popup ----- */
    openZoom() {
      if (this.zoomed) return;
      this.engage(); this.clearHot();
      const hero = this.heroes[this.index];
      const srcFig = hero.querySelector('.rw__figure');
      const wrap = document.createElement('div');
      wrap.className = 'rw__lb-model';
      wrap.appendChild(hero.querySelector('.rw__shadow').cloneNode(true));
      const fig = srcFig.cloneNode(true);
      fig.querySelectorAll('[data-rw-zoom]').forEach(b => b.remove());
      fig.querySelectorAll('.rw__pin').forEach(p => { p.tabIndex = 0; });
      const foot = hero.style.getPropertyValue('--rw-foot');
      if (foot) wrap.style.setProperty('--rw-foot', foot);
      wrap.appendChild(fig);
      this.lbStage.innerHTML = '';
      this.lbStage.appendChild(wrap);
      const sr = this.lbStage.getBoundingClientRect();
      const h = Math.max(160, Math.min(sr.height, sr.width / .5625));
      wrap.style.setProperty('--rw-model-h', h + 'px');
      fig.querySelectorAll('img').forEach(im => { im.loading = 'eager'; im.sizes = Math.round(h * .5625) + 'px'; im.classList.add('is-decoded'); });
      this.lb.querySelector('[data-rw-lb-kicker]').textContent = `${this.lb.dataset.word} ${pad(this.index + 1)}`;
      this.lb.querySelector('[data-rw-lb-name]').textContent = hero.dataset.name;
      this.zoomed = true;
      this.zoomFrom = srcFig;
      this.classList.add('rw--zoom');
      this.lb.setAttribute('aria-hidden', 'false');
      clearTimeout(this.zoomClearT);
      if (!reduced()) {
        const at = this.flipAt(srcFig, fig);
        wrap.style.transition = 'none';
        wrap.style.transformOrigin = '0 100%';
        wrap.style.transform = at;
        void wrap.offsetWidth;
        wrap.style.transition = '';
        wrap.style.transform = '';
      }
      this.lb.querySelector('[data-rw-zoom-close]').focus({ preventScroll: true });
    }
    flipAt(fromFig, toFig) {
      const a = fromFig.getBoundingClientRect(), b = toFig.getBoundingClientRect();
      return `translate3d(${a.left - b.left}px,${a.bottom - b.bottom}px,0) scale(${b.height ? a.height / b.height : 1})`;
    }
    closeZoom() {
      if (!this.zoomed) return;
      this.zoomed = false;
      const wrap = this.lbStage.querySelector('.rw__lb-model');
      if (wrap && !reduced() && this.zoomFrom) {
        wrap.style.transformOrigin = '0 100%';
        wrap.style.transform = this.flipAt(this.zoomFrom, wrap.querySelector('.rw__figure'));
      }
      const hadFocus = this.lb.contains(document.activeElement);
      this.classList.remove('rw--zoom');
      this.lb.setAttribute('aria-hidden', 'true');
      this.clearHot();
      this.zoomClearT = setTimeout(() => { if (!this.zoomed) this.lbStage.innerHTML = ''; }, 950);
      if (hadFocus) this.stage.focus({ preventScroll: true });
      this.restartBar();
    }

    /* ----- Pickers ----- */
    initPickers() {
      this.querySelectorAll('.rw__item').forEach(card => {
        const picker = card.querySelector('[data-rw-picker]');
        card._picker = picker;
        picker._card = card;
        try { picker._variants = JSON.parse(picker.querySelector('[data-rw-variants]').textContent); } catch (e) { picker._variants = []; }
        this.updateOptions(picker, true);
      });
    }
    updateOptions(picker, initial) {
      const card = picker._card, vs = picker._variants;
      const groups = {};
      picker.querySelectorAll('input[data-rw-option]').forEach(r => { (groups[r.dataset.rwOption] = groups[r.dataset.rwOption] || []).push(r); });
      const keys = Object.keys(groups).sort();
      const sel = keys.map(k => { const c = groups[k].find(r => r.checked); return c ? c.value : null; });
      keys.forEach((k, gi) => groups[k].forEach(r => {
        const ok = vs.some(v => v.a && v.o[gi] === r.value && sel.every((s, j) => j === gi || s === null || v.o[j] === s));
        r.closest('.rw__pill').classList.toggle('is-unavailable', !ok);
      }));
      const match = vs.find(v => v.a && v.o.every((o, j) => o === sel[j]));
      const btn = picker.querySelector('[data-rw-confirm]');
      const lbl = btn.querySelector('[data-rw-confirm-label]');
      btn.disabled = !match;
      lbl.textContent = match ? lbl.dataset.add : (this.dataset.msgSoldout || 'Sold out');
      if (match) card.dataset.selected = match.id; else delete card.dataset.selected;
      if (!initial) card.dataset.touched = '1';
    }
    togglePicker(card) {
      if (card.classList.contains('is-added') || card.classList.contains('is-loading')) return;
      if (card.classList.contains('is-picking')) { this.closePicker(card); return; }
      this.openPicker(card, true);
    }
    openPicker(card, focus) {
      const picker = card._picker, btn = card.querySelector('[data-rw-add]');
      if (this.mobile) {
        this.closeSheet();
        this.openSheet(card);
      } else {
        picker.hidden = false;
        this.reveal(card);
      }
      card.classList.add('is-picking');
      btn.setAttribute('aria-expanded', 'true');
      if (focus) { const r = picker.querySelector('input:checked') || picker.querySelector('input'); if (r) r.focus({ preventScroll: true }); }
    }
    closePicker(card, noFocus) {
      const btn = card.querySelector('[data-rw-add]');
      if (this.sheetPicker === card._picker) { this.closeSheet(noFocus); return; }
      card._picker.hidden = true;
      card.classList.remove('is-picking');
      if (!card.classList.contains('is-added')) btn.setAttribute('aria-expanded', 'false');
    }
    openSheet(card) {
      const picker = card._picker;
      const host = document.createElement('div');
      host.className = 'rw-sheet-host';
      const cs = getComputedStyle(this);
      ['--rw-panel', '--rw-text', '--rw-muted', '--rw-line', '--rw-accent', '--rw-on-accent', '--rw-btn-bg', '--rw-btn-fg', '--rw-btn-radius', '--rw-pill-radius', '--rw-bar-r', '--rw-thumb-radius', '--rw-pt-size', '--rw-price', '--rw-opt', '--rw-ease', '--rw-ease-sheet', '--rw-ease-spring']
        .forEach(v => host.style.setProperty(v, cs.getPropertyValue(v)));
      host.style.fontFamily = cs.fontFamily;
      host.style.color = cs.color;
      host.innerHTML = '<button type="button" class="rw__pick-scrim" data-rw-pick-close tabindex="-1" aria-hidden="true"></button>';
      picker._home = card;
      host.appendChild(picker);
      picker.hidden = false;
      document.body.appendChild(host);
      host.addEventListener('click', this._onClick);
      host.addEventListener('change', this._onChange);
      host.addEventListener('keydown', this._onKey);
      this.sheetHost = host;
      this.sheetPicker = picker;
      this.classList.add('rw--picking');
      requestAnimationFrame(() => host.classList.add('is-open'));
    }
    closeSheet(noFocus) {
      const picker = this.sheetPicker, host = this.sheetHost;
      if (!picker) return;
      const card = picker._card;
      picker.hidden = true;
      card.appendChild(picker);
      host.remove();
      this.sheetHost = this.sheetPicker = null;
      this.classList.remove('rw--picking');
      card.classList.remove('is-picking');
      const btn = card.querySelector('[data-rw-add]');
      if (!card.classList.contains('is-added')) btn.setAttribute('aria-expanded', 'false');
      if (!noFocus && !card.classList.contains('is-added')) btn.focus({ preventScroll: true });
    }
    dockAll() {
      this.closeSheet(true);
      this.querySelectorAll('.rw__item.is-picking').forEach(c => { c._picker.hidden = false; });
    }

    /* ----- Adding ----- */
    async confirm(picker) {
      const card = picker._card;
      card.dataset.touched = '1';
      const id = Number(card.dataset.selected);
      if (!id || card.classList.contains('is-loading') || card.classList.contains('is-added')) return;
      const msg = this.activePanel.querySelector('[data-rw-msg]');
      msg.textContent = '';
      card.classList.add('is-loading');
      try {
        await window.IHBag.add([{ id, quantity: 1 }]);
        this.markAdded(card);
        this.checkComplete(card.closest('[data-rw-panel]'));
      } catch (e) {
        card.classList.remove('is-loading');
        card.closest('[data-rw-panel]').querySelector('[data-rw-msg]').textContent = (e && e.message) || this.dataset.msgError;
      }
    }
    markAdded(card) {
      card.classList.remove('is-loading');
      this.closePicker(card, true);
      card.classList.add('is-added');
      card.classList.remove('is-picking');
      const btn = card.querySelector('[data-rw-add]');
      btn.setAttribute('aria-label', btn.dataset.addedLabel);
      btn.removeAttribute('aria-expanded');
      if (navigator.vibrate && this.mobile && !reduced()) try { navigator.vibrate(12); } catch (e) {}
    }
    checkComplete(panel) {
      const cards = [...panel.querySelectorAll('.rw__item')].filter(c => !c.hasAttribute('data-soldout'));
      if (cards.length >= 2 && cards.every(c => c.classList.contains('is-added'))) {
        panel.classList.add('is-complete');
        panel.querySelector('[data-rw-msg]').textContent = '';
      }
    }
    async addAll(panel) {
      const cta = panel.querySelector('[data-rw-all]');
      if (panel.classList.contains('is-complete') || cta.classList.contains('is-loading')) return;
      const msg = panel.querySelector('[data-rw-msg]');
      msg.textContent = '';
      const cards = [...panel.querySelectorAll('.rw__item')].filter(c => !c.classList.contains('is-added') && !c.hasAttribute('data-soldout'));
      const ready = cards.filter(c => c.dataset.variantId || (c.dataset.touched && c.dataset.selected));
      const pending = cards.filter(c => !ready.includes(c));
      if (ready.length) {
        cta.classList.add('is-loading');
        ready.forEach(c => c.classList.add('is-loading'));
        try {
          await window.IHBag.add(ready.map(c => ({ id: Number(c.dataset.variantId || c.dataset.selected), quantity: 1 })));
          ready.forEach(c => this.markAdded(c));
        } catch (e) {
          ready.forEach(c => c.classList.remove('is-loading'));
          msg.textContent = (e && e.message) || this.dataset.msgError;
        }
        cta.classList.remove('is-loading');
      }
      if (pending.length) {
        (this.mobile ? pending.slice(0, 1) : pending).forEach((c, i) => { if (!c.classList.contains('is-picking')) this.openPicker(c, i === 0); });
        if (!this.mobile) this.reveal(pending[0]);
        msg.textContent = (this.dataset.msgChoose || 'Pick a size for: [items]').replace('[items]', pending.map(c => c.dataset.title).join(', '));
      }
      this.checkComplete(panel);
    }

    /* ----- Events ----- */
    bind() {
      const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); this._offs.push(() => t.removeEventListener(ev, fn, opt)); };
      this._offs = [];
      this._onClick = e => this.onClick(e);
      this._onChange = e => {
        const r = e.target.closest('input[data-rw-option]');
        if (!r) return;
        this.engage();
        this.updateOptions(r.closest('[data-rw-picker]'), false);
      };
      this._onKey = e => {
        if (e.key !== 'Escape') return;
        if (this.sheetPicker) { e.preventDefault(); this.closeSheet(); return; }
        if (this.zoomed) { e.preventDefault(); this.closeZoom(); }
      };
      on(this, 'click', this._onClick);
      on(this, 'change', this._onChange);
      on(this, 'keydown', this._onKey);
      on(this, 'click', e => { if (this.suppressUntil && performance.now() < this.suppressUntil) { e.preventDefault(); e.stopPropagation(); } }, true);

      // Panel engagement / hover
      const panel = this.querySelector('.rw__panel');
      on(panel, 'click', e => { if (e.target.closest('button, a, input, select, label')) this.engage(); }, true);
      on(panel, 'pointerenter', e => { if (e.pointerType === 'mouse') this.panelHover = true; });
      on(panel, 'pointerleave', e => { if (e.pointerType === 'mouse') { this.panelHover = false; this.restartBar(); } });
      on(panel, 'pointerover', e => {
        if (e.pointerType !== 'mouse') return;
        const c = e.target.closest('.rw__item');
        if (c && !c.classList.contains('is-hot')) this.hot(c.dataset.rwCard, false);
      });
      on(panel, 'pointerout', e => {
        const c = e.target.closest('.rw__item');
        if (c && !c.contains(e.relatedTarget)) this.clearHot();
      });

      // Stage keyboard
      on(this.stage, 'keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
      });

      // Wheel
      let acc = 0, lockUntil = 0;
      on(this.stage, 'wheel', e => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        if (performance.now() < lockUntil) return;
        acc += e.deltaX;
        if (Math.abs(acc) > 45) { acc > 0 ? this.next() : this.prev(); acc = 0; lockUntil = performance.now() + 520; }
      }, { passive: false });

      // Pointer drag
      on(this.stage, 'pointerdown', e => {
        if (this.zoomed) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this.drag = { x: e.clientX, y: e.clientY, t: this.target, id: e.pointerId, active: false, samples: [{ x: e.clientX, time: performance.now() }], type: e.pointerType };
      });
      on(this.stage, 'pointermove', e => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        if (e.pointerType === 'mouse' && !(e.buttons & 1)) { this.endDrag(e); return; }
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (!d.active) {
          if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
            d.active = true;
            this.classList.add('is-dragging');
            try { this.stage.setPointerCapture(e.pointerId); } catch (_) {}
          } else if (Math.abs(dy) > 10) { this.drag = null; return; }
          else return;
        }
        d.samples.push({ x: e.clientX, time: performance.now() });
        if (d.samples.length > 6) d.samples.shift();
        this.target = d.t - dx / this.unit;
        this.setStill(false);
        this.kick();
      });
      const up = e => this.endDrag(e);
      on(this.stage, 'pointerup', up);
      on(this.stage, 'pointercancel', up);

      // Custom cursor
      const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (fine && this.cursor) {
        this.classList.add('rw--cursor');
        const cur = { x: 0, y: 0, tx: 0, ty: 0, raf: 0, on: false };
        const step = () => {
          const f = reduced() ? 1 : .18;
          cur.x += (cur.tx - cur.x) * f; cur.y += (cur.ty - cur.y) * f;
          this.cursor.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`;
          cur.raf = Math.hypot(cur.tx - cur.x, cur.ty - cur.y) > .2 ? requestAnimationFrame(step) : 0;
        };
        on(this.stage, 'pointermove', e => {
          if (e.pointerType !== 'mouse') return;
          const r = this.stage.getBoundingClientRect();
          cur.tx = e.clientX - r.left; cur.ty = e.clientY - r.top;
          if (!cur.on) { cur.on = true; cur.x = cur.tx; cur.y = cur.ty; this.cursor.classList.add('is-on'); }
          const dragging = this.drag && this.drag.active;
          const t = e.target;
          this.cursor.classList.toggle('is-view', !dragging && !!t.closest('.rw__hero.is-on .rw__zoom, .rw__lb-model'));
          this.cursor.classList.toggle('is-link', !dragging && !!t.closest('.rw__pin, .rw__hit, .rw__lb-close'));
          if (!cur.raf) cur.raf = requestAnimationFrame(step);
        });
        on(this.stage, 'pointerleave', () => { cur.on = false; this.cursor.classList.remove('is-on', 'is-link', 'is-view'); });
        this._offs.push(() => cancelAnimationFrame(cur.raf));
      } else if (this.cursor) { this.cursor.remove(); this.cursor = null; }

      // Resize
      let rt = 0;
      on(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(() => { this.measure(); this.kick(); }, 120); });
      if ('ResizeObserver' in window) {
        this.ro = new ResizeObserver(() => { const r = this.stage.getBoundingClientRect(); if (Math.abs(r.width - this.W) > .5 || Math.abs(r.height - this.H) > .5) { this.measure(); this.kick(); } });
        this.ro.observe(this.stage);
      }
      on(document, 'visibilitychange', () => { if (!document.hidden) { this.kick(); this.restartBar(); } });

      // Visibility for the loop
      this.io = new IntersectionObserver(es => { es.forEach(en => { this.visible = en.isIntersecting; if (this.visible) this.kick(); }); }, { threshold: 0 });
      this.io.observe(this);
      // Intro reveal (waits for the site intro curtain to start lifting)
      const release = () => { this.holding = false; this.lastT = 0; this.kick(); this.restartBar(); };
      const beginReveal = () => {
        const r = this.getBoundingClientRect();
        if (reduced() || (r.top < innerHeight * .78 && r.bottom > 0)) { void this.offsetWidth; this.classList.add('is-revealed'); release(); return; }
        this.io2 = new IntersectionObserver(es => {
          if (es.some(en => en.isIntersecting)) {
            this.io2.disconnect();
            void this.offsetWidth;
            this.classList.add("is-revealed");
            release();
          }
        }, { threshold: 0, rootMargin: '0px 0px -22% 0px' });
        this.io2.observe(this);
      };
      if (window.IHIntro && window.IHIntro.active) on(window, 'ih:intro-done', beginReveal, { once: true });
      else beginReveal();

      // Deep links: #look-N (from look cards, product pages, shared links)
      const lookFromHash = h => { const m = /^#look-([0-9]+)$/.exec(h || ''); return m ? clamp(parseInt(m[1], 10) - 1, 0, this.n - 1) : -1; };
      const jump = i => {
        if (i < 0) return;
        this.go(i);
        const top = this.getBoundingClientRect().top + scrollY - (this.mobile ? 0 : this.headerH());
        window.scrollTo({ top: Math.max(0, top), behavior: reduced() ? 'auto' : 'smooth' });
      };
      on(document, 'click', e => {
        const a = e.target.closest('a[href^="#look-"]');
        if (!a) return;
        e.preventDefault();
        history.replaceState(null, '', a.getAttribute('href'));
        jump(lookFromHash(a.getAttribute('href')));
      });
      on(window, 'hashchange', () => jump(lookFromHash(location.hash)));

      this._teardown = () => {
        cancelAnimationFrame(this.raf); this.raf = 0;
        clearTimeout(this.timer); clearTimeout(rt); clearTimeout(this.zoomClearT);
        this.io && this.io.disconnect(); this.io2 && this.io2.disconnect(); this.ro && this.ro.disconnect();
        this._offs.forEach(f => f());
        this.closeSheet(true);
      };
    }
    endDrag(e) {
      const d = this.drag;
      if (!d || (e && e.pointerId !== d.id)) return;
      this.drag = null;
      if (!d.active) return;
      this.classList.remove('is-dragging');
      try { this.stage.releasePointerCapture(d.id); } catch (_) {}
      this.suppressUntil = performance.now() + 60;
      const s = d.samples, a = s[0], b = s[s.length - 1];
      const vx = b.time > a.time ? (b.x - a.x) / (b.time - a.time) : 0;
      const dx = (e ? e.clientX : b.x) - d.x;
      const sign = -1, from = Math.round(d.t);
      if (this.mobile) {
        if (Math.abs(dx) > 30 || Math.abs(vx) > .3) this.moveTo(from + sign * (dx > 0 ? 1 : -1));
        else this.moveTo(from);
      } else {
        let i = Math.round(this.target + sign * vx * 160 / this.unit);
        if (i === from && Math.abs(vx) > .3) i = from + (vx > 0 ? sign : -sign);
        this.moveTo(clamp(i, from - 2, from + 2));
      }
    }
    onClick(e) {
      const t = e.target;
      let el;
      if ((el = t.closest('[data-rw-pick-close]'))) { this.closeSheet(); return; }
      if (t.closest('[data-rw-zoom-close]')) { this.closeZoom(); return; }
      if (this.zoomed && (t === this.lb || t === this.lbStage)) { this.closeZoom(); return; }
      if (t.closest('[data-rw-zoom]')) { this.openZoom(); return; }
      if (t.closest('[data-rw-next]')) { this.next(); return; }
      if (t.closest('[data-rw-prev]')) { this.prev(); return; }
      if ((el = t.closest('[data-rw-tick]'))) { this.go(+el.dataset.rwTick); return; }
      if (t.closest('[data-rw-auto]')) { if (!this.playing) this.engaged = false; this.play(!this.playing); return; }
      if ((el = t.closest('[data-rw-pin]'))) { this.engage(); this.hot(el.dataset.rwPin, true); return; }
      if ((el = t.closest('[data-rw-go]'))) {
        const body = this.bodies.find(s => s.el === el.closest('[data-rw-model]'));
        const k = body ? (this.mode === 'ring' ? Math.round(wrapS(body.a - this.target, this.N)) : this.rank(body)) : 0;
        if (k !== 0 && Math.abs(k) < this.N / 2) this.moveTo(Math.round(this.target) + k);
        else if (k === 0) this.openZoom();
        return;
      }
      if ((el = t.closest('[data-rw-confirm]'))) { this.confirm(el.closest('[data-rw-picker]')); return; }
      if ((el = t.closest('[data-rw-add]'))) { this.togglePicker(el.closest('.rw__item')); return; }
      if ((el = t.closest('[data-rw-all]'))) { this.addAll(el.closest('[data-rw-panel]')); return; }
    }

    /* ----- Feet detection ----- */
    detectFeet() {
      this.heroes.forEach(hero => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const w = 48, h = Math.max(1, Math.round(w * img.naturalHeight / img.naturalWidth));
            const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
            const cx = cv.getContext('2d', { willReadFrequently: true });
            cx.drawImage(img, 0, 0, w, h);
            const px = cx.getImageData(0, 0, w, h).data;
            let last = -1;
            for (let y = h - 1; y >= 0 && last < 0; y--) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 40) { last = y; break; }
            if (last < 0) return;
            const f = clamp((h - 1 - last) / h, 0, .4).toFixed(4);
            const i = +hero.dataset.index;
            hero.style.setProperty('--rw-foot', f);
            this.bodies.filter(s => s.look === i).forEach(s => s.el.style.setProperty('--rw-foot', f));
          } catch (e) { /* tainted canvas: keep offset 0 */ }
        };
        img.src = hero.dataset.probe;
      });
    }
  }

  if (!customElements.get('runway-section')) customElements.define('runway-section', RunwaySection);
})();
