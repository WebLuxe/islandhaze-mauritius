/* Island Haze — shared behaviour: intro, menu, page-transition hooks, scroll reveals. */
(function () {
  const html = document.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Intro ---------- */
  const intro = document.querySelector('.ih-intro');
  // The curtain starts lifting: release the page underneath so its own entrance plays as it is uncovered.
  function introDone() {
    if (window.__ihIntroDone) return;
    window.__ihIntroDone = true;
    if (intro) intro.classList.add('is-leaving');
    html.classList.remove('ih-intro-on');
    window.dispatchEvent(new CustomEvent('ih:intro-done'));
  }
  window.IHIntro = { get active() { return html.classList.contains('ih-intro-on') && !window.__ihIntroDone; } };
  if (html.classList.contains('ih-intro-on') && intro) {
    intro.addEventListener('animationstart', e => { if (/^ih-intro-(out|skip)$/.test(e.animationName)) introDone(); });
    intro.addEventListener('animationend', e => { if (/^ih-intro-(out|skip)$/.test(e.animationName)) intro.remove(); });
    const skip = () => { intro.classList.add('is-skip'); };
    ['pointerdown', 'wheel', 'touchstart'].forEach(ev => intro.addEventListener(ev, skip, { passive: true, once: true }));
    window.addEventListener('keydown', skip, { once: true });
    setTimeout(introDone, 2150); // matches the CSS exit delay
    setTimeout(() => { introDone(); intro.remove(); }, 4200); // safety net
  } else {
    window.__ihIntroDone = true;
    if (intro) intro.remove();
  }

  /* ---------- Mobile menu ---------- */
  const menu = document.getElementById('menu-dialog');
  const menuBtn = document.getElementById('open-menu');
  if (menu && menuBtn) {
    const close = () => { if (!menu.open) return; menu.classList.add('is-closing'); setTimeout(() => { menu.classList.remove('is-closing'); menu.close(); }, RM.matches ? 0 : 280); };
    menuBtn.addEventListener('click', () => { menu.showModal(); menuBtn.setAttribute('aria-expanded', 'true'); });
    menu.addEventListener('close', () => menuBtn.setAttribute('aria-expanded', 'false'));
    menu.addEventListener('cancel', e => { e.preventDefault(); close(); });
    menu.addEventListener('click', e => {
      if (e.target.closest('[data-close-menu]') || e.target === menu) close();
      else if (e.target.closest('a')) menu.close();
    });
  }

  /* ---------- Page transitions (cross-document View Transitions) ---------- */
  const clearNames = () => document.querySelectorAll('[data-vt-media]').forEach(m => { m.style.viewTransitionName = ''; });
  // Morph the clicked product card into the product page image.
  document.addEventListener('click', e => {
    const a = e.target.closest('a.card');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    clearNames();
    document.querySelectorAll('.pdp__media').forEach(m => { m.style.viewTransitionName = 'none'; });
    const m = a.querySelector('[data-vt-media]');
    if (m) m.style.viewTransitionName = 'product-media';
  });
  // Coming back from a product page: morph the image back into its card.
  window.addEventListener('pagereveal', e => {
    if (!e.viewTransition || document.querySelector('.pdp')) return;
    let from = '';
    try { from = (window.navigation && navigation.activation && navigation.activation.from && navigation.activation.from.url) || ''; } catch (_) {}
    const m = from.match(/product-([\w-]+)\.html/);
    if (!m) return;
    const card = document.querySelector(`a.card[data-card="${m[1]}"]`);
    if (!card) return;
    card.classList.add('in');
    const media = card.querySelector('[data-vt-media]');
    media.style.viewTransitionName = 'product-media';
    e.viewTransition.finished.finally(() => { media.style.viewTransitionName = ''; });
  });
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    clearNames();
    document.querySelectorAll('.pdp__media').forEach(m => { m.style.viewTransitionName = 'product-media'; });
  });

  /* ---------- Scroll reveals ---------- */
  const targets = document.querySelectorAll('.reveal, .card, .look-card, .store, .sec-head, .cols > div, .page-lede, .home-stores__in');
  if (!('IntersectionObserver' in window) || RM.matches) targets.forEach(t => t.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px' });
    const start = () => targets.forEach(t => io.observe(t));
    if (window.IHIntro.active) window.addEventListener('ih:intro-done', start, { once: true }); else start();
  }

  /* ---------- Header state ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    let ticking = false;
    const upd = () => { header.classList.toggle('is-scrolled', scrollY > 8); ticking = false; };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }
})();
