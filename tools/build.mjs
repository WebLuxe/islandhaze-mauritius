// Builds every static page from one layout + assets/js/data.js.
// Run:  node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
const D = ctx.window.IH_DATA;
const V = Date.now().toString(36); // cache-busting version for local assets

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const A = p => `assets/${p}?v=${V}`;
const ARROW = '<svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>';
const EXT = '<span aria-hidden="true">↗</span>';

const NAV = [
  ['home', './', 'Looks'],
  ['shop', 'shop.html', 'Shop'],
  ['stores', 'stores.html', 'Stores'],
  ['about', 'about.html', 'About']
];

function header(key) {
  const links = NAV.map(([k, href, label]) =>
    `<a href="${href}"${k === key ? ' aria-current="page"' : ''}>${label}${k === key ? '<span class="nav-ind" aria-hidden="true"></span>' : ''}</a>`).join('');
  return `<header class="site-header shopify-section-group-header-group">
  <a href="./" class="brand" aria-label="Island Haze home">ISLAND HAZE<small>MAURITIUS</small></a>
  <nav class="site-nav" aria-label="Main navigation">${links}<a href="https://islandhaze.mu/" target="_blank" rel="noopener noreferrer">islandhaze.mu ${EXT}</a></nav>
  <button id="open-bag" type="button" aria-label="Open styling bag">
    <svg width="22" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 8h16l1 16H3L4 8zM8 8V6a4 4 0 0 1 8 0v2"/></svg>
    <span data-cart-count>0</span>
  </button>
  <button id="open-menu" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu-dialog"><span></span><span></span></button>
</header>`;
}

function menu(key) {
  const links = NAV.map(([k, href, label], i) =>
    `<a href="${href}" style="--i:${i}"${k === key ? ' aria-current="page"' : ''}><span class="menu-num">0${i + 1}</span>${label}</a>`).join('');
  return `<dialog id="menu-dialog" class="menu" aria-label="Menu">
  <div class="menu-top"><span class="brand">ISLAND HAZE</span><button type="button" class="menu-close" data-close-menu aria-label="Close menu">×</button></div>
  <nav class="menu-links">${links}</nav>
  <div class="menu-foot"><a href="https://islandhaze.mu/" target="_blank" rel="noopener noreferrer">Shop islandhaze.mu ${EXT}</a><a href="https://www.instagram.com/island.haze/" target="_blank" rel="noopener noreferrer">Instagram ${EXT}</a></div>
</dialog>`;
}

const INTRO_WORD = w => [...w].map((c, i) => `<span class="ih-intro__l" style="--i:${i}">${c}</span>`).join('');
const intro = `<div class="ih-intro" aria-hidden="true">
  <div class="ih-intro__haze"><i></i><i></i><i></i></div>
  <div class="ih-intro__mark"><span class="ih-intro__line">${INTRO_WORD('ISLAND')}</span><span class="ih-intro__line ih-intro__line--2">${INTRO_WORD('HAZE')}</span></div>
  <div class="ih-intro__foot"><span>Mauritius</span><span class="ih-intro__bar"></span><span>Since 2008</span></div>
</div>`;

const footer = `<footer class="site-footer">
  <div class="foot-brand"><span class="brand">ISLAND HAZE</span><p>Colourful, fun streetwear for the young at heart. Mauritius, since 2008.</p></div>
  <nav class="foot-col" aria-label="Explore"><h2>Explore</h2><a href="./">Try the Look</a><a href="shop.html">Shop all</a><a href="bag.html">Styling bag</a></nav>
  <nav class="foot-col" aria-label="Visit"><h2>Visit</h2><a href="stores.html">Stores</a><a href="about.html">About</a><a href="https://islandhaze.mu/" target="_blank" rel="noopener noreferrer">islandhaze.mu ${EXT}</a></nav>
  <nav class="foot-col" aria-label="Follow"><h2>Follow</h2><a href="https://www.instagram.com/island.haze/" target="_blank" rel="noopener noreferrer">Instagram ${EXT}</a><a href="https://www.facebook.com/islandhaze.mu" target="_blank" rel="noopener noreferrer">Facebook ${EXT}</a></nav>
  <p class="foot-note">Prices are for reference. Buy in store or on islandhaze.mu. Stand-in photos via <a href="about.html#credits">Unsplash</a>.</p>
</footer>`;

const dialogs = `<dialog id="bag-dialog" aria-labelledby="bag-title">
  <div class="bag-heading"><h2 id="bag-title">Your styling bag</h2><button id="close-bag" type="button" aria-label="Close styling bag">×</button></div>
  <p class="bag-note">A local outfit shortlist. No payment or order is collected here. Open a piece on islandhaze.mu to buy it.</p>
  <div id="bag-items"></div>
  <p id="bag-total"></p>
  <div class="bag-actions"><a class="btn btn--ghost" href="bag.html">View bag</a><button id="export-bag" type="button">Download shortlist</button></div>
</dialog>
<div id="bag-status" role="status" aria-live="polite"></div>`;

const SPEC = JSON.stringify({
  prerender: [{ where: { and: [{ or: [{ href_matches: '*.html' }, { href_matches: './' }] }, { not: { selector_matches: '[target=_blank], [download]' } }] }, eagerness: 'moderate' }],
  prefetch: [{ where: { and: [{ or: [{ href_matches: '*.html' }, { href_matches: './' }] }, { not: { selector_matches: '[target=_blank], [download]' } }] }, eagerness: 'eager' }]
});

function page({ file, key, title, desc, head = '', body, scripts = [] }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23151413'/%3E%3Ctext x='16' y='21' font-family='Arial' font-size='13' font-weight='700' fill='%23fff' text-anchor='middle'%3EIH%3C/text%3E%3C/svg%3E">
<script>document.documentElement.classList.add('js');if(!('CSSViewTransitionRule' in window)){var h=document.documentElement;h.classList.add('no-xvt');var sh=function(){h.classList.add('is-shown')};document.prerendering?document.addEventListener('prerenderingchange',sh,{once:true}):sh()}try{if(!sessionStorage.getItem('ih-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.prerendering){document.documentElement.classList.add('ih-intro-on')}sessionStorage.setItem('ih-intro','1')}catch(e){}</script>
<link rel="preconnect" href="https://reel-ref-try-the-look.vercel.app" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preload" href="https://reel-ref-try-the-look.vercel.app/assets/inter-600.woff2" as="font" type="font/woff2" crossorigin>
${head}<link rel="stylesheet" href="${A('css/site.css')}">
<script src="${A('js/data.js')}" defer></script>
<script src="${A('js/bag.js')}" defer></script>
<script src="${A('js/site.js')}" defer></script>
${scripts.map(s => `<script src="${A('js/' + s)}" defer></script>`).join('\n')}
<script type="speculationrules">${SPEC}</script>
</head>
<body data-page="${key}">
${intro}
<a class="skip" href="#main">Skip to content</a>
${header(key)}
${body}
${footer}
${menu(key)}
${dialogs}
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, file), html);
  console.log('wrote', file);
}

/* ---------- Shared fragments ---------- */
const tile = (p, w, h, eager, sizes = '(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw') => p.image
  ? `<img src="${esc(p.image)}"${p.srcset ? ` srcset="${esc(p.srcset)}" sizes="${sizes}"` : ''} alt="${esc(p.name)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
  : `<span class="ih-ph" style="--ph:${p.tone}" role="img" aria-label="${esc(p.name)}"><span>${esc(p.type)}</span></span>`;

const card = (p, i = 0) => `<a class="card" href="${p.page}" data-card="${p.id}" data-cat="${p.cat}" data-price="${p.price}" data-stock="${p.soldOut ? 'out' : 'in'}" data-order="${i}" style="--ci:${i}">
  <span class="card__media" data-vt-media>${tile(p, 600, 750)}${p.isNew ? '<span class="card__tag">New</span>' : ''}${p.soldOut ? '<span class="card__tag card__tag--out">Sold out</span>' : ''}</span>
  <span class="card__meta"><span class="card__type">${esc(p.type)}</span><span class="card__name">${esc(p.name)}</span><span class="card__price">${D.money(p.price)}</span></span>
</a>`;

const looksWith = id => D.looks.map((l, i) => ({ l, i })).filter(x => x.l.products.includes(id));

/* ---------- Home ---------- */
const runwayAttrs = fs.readFileSync(path.join(ROOT, 'tools/runway-attrs.txt'), 'utf8').trim();
const newIn = [...D.items].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || (a.soldOut ? 1 : 0) - (b.soldOut ? 1 : 0));
page({
  file: 'index.html', key: 'home',
  title: 'Try the Look — Island Haze Mauritius',
  desc: 'Six Island Haze looks, styled head to toe. Explore the runway, isolate a look, and tap a pin to see the piece.',
  head: `<link rel="preload" as="image" href="https://reel-ref-try-the-look.vercel.app/assets/model-1-640.webp" fetchpriority="high">
<link rel="stylesheet" href="${A('css/runway.css')}">\n`,
  scripts: ['runway.js'],
  body: `<main id="main">
  <runway-section ${runwayAttrs}></runway-section>
  <section class="home-sec" aria-labelledby="new-in">
    <div class="sec-head"><h2 id="new-in">New in &amp; essentials</h2><a class="link-arrow" href="shop.html">Shop all ${ARROW}</a></div>
    <div class="rail">${newIn.map(card).join('')}</div>
  </section>
  <section class="home-sec" aria-labelledby="the-looks">
    <div class="sec-head"><h2 id="the-looks">The looks</h2><span class="sec-note">Six outfits, one island</span></div>
    <div class="looks-grid">${D.looks.map((l, i) => `<a class="look-card" href="#look-${i + 1}" data-look="${i}" style="--ci:${i}">
      <span class="look-card__media"><img src="${l.m640}" alt="" width="640" height="1138" loading="lazy" decoding="async"></span>
      <span class="look-card__meta"><span class="look-card__num">0${i + 1}</span><span class="look-card__name">${esc(l.name)}</span><span class="look-card__desc">${esc(l.description)}</span></span>
    </a>`).join('')}</div>
  </section>
  <section class="home-sec home-stores" aria-labelledby="visit">
    <div class="haze-band" aria-hidden="true"><img src="${esc(D.scenes.island.src)}" alt="" loading="lazy" decoding="async" width="1600" height="700"></div>
    <div class="home-stores__in">
      <p class="page-kicker">Four stores across the island</p>
      <h2 id="visit">Come try it on.</h2>
      <p>${D.stores.map(s => esc(s.name)).join(' · ')}</p>
      <a class="btn" href="stores.html">Find a store ${ARROW}</a>
    </div>
  </section>
</main>`
});

/* ---------- Shop ---------- */
page({
  file: 'shop.html', key: 'shop',
  title: 'Shop — Island Haze Mauritius',
  desc: 'Shop Island Haze tees, shirts, denim, cargos and outerwear. Prices in Mauritian rupees.',
  scripts: ['pages.js'],
  body: `<main id="main" class="page page--wide">
  <p class="page-kicker">Island Haze · Shop</p>
  <h1 class="reveal">Shop the haze.</h1>
  <div class="shop-bar">
    <div class="chips" role="group" aria-label="Filter by category">
      <button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>
      ${D.cats.map(([k, l]) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="false">${l}</button>`).join('')}
      <button type="button" class="chip chip--toggle" data-instock aria-pressed="false">In stock only</button>
    </div>
    <label class="sort"><span>Sort</span><select data-sort>
      <option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name A–Z</option>
    </select></label>
  </div>
  <p class="shop-count" data-count aria-live="polite">${D.items.length} pieces</p>
  <div class="grid" data-grid>${D.items.map(card).join('')}</div>
  <p class="shop-empty" data-empty hidden>Nothing here right now. <button type="button" class="link-btn" data-reset>Clear filters</button></p>
</main>`
});

/* ---------- Product pages ---------- */
D.items.forEach(p => {
  const cat = D.cats.find(c => c[0] === p.cat);
  const inLooks = looksWith(p.id);
  const related = D.items.filter(x => x.id !== p.id).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat)).slice(0, 4);
  page({
    file: p.page, key: 'shop',
    title: `${p.name} — ${p.type} · Island Haze`,
    desc: `${p.name}, ${p.type.toLowerCase()} by Island Haze Mauritius. ${D.money(p.price)}.`,
    scripts: ['pages.js'],
    body: `<main id="main" class="page page--wide pdp" data-product="${p.id}">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="shop.html">Shop</a><span aria-hidden="true">/</span><a href="shop.html?cat=${p.cat}">${cat ? cat[1] : ''}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
  <div class="pdp__grid">
    <div class="pdp__media" style="view-transition-name:product-media">${tile(p, 1000, 1250, true, '(min-width: 900px) 50vw, 100vw')}${p.isNew ? '<span class="card__tag">New</span>' : ''}</div>
    <div class="pdp__info">
      <p class="page-kicker">Island Haze · ${esc(p.type)}</p>
      <h1 class="pdp__name">${esc(p.name)}</h1>
      <p class="pdp__price">${D.money(p.price)}${p.soldOut ? ' <span class="pdp__so">Sold out</span>' : ''}</p>
      <fieldset class="pdp__opt"${p.soldOut ? ' disabled' : ''}><legend>${esc(p.legend)}</legend><div class="pills">
        ${p.variants.map(v => `<label class="ih-pill"><input type="radio" name="size" value="${v.id}"${v.a ? '' : ' disabled'}><span>${esc(v.o[0])}</span></label>`).join('')}
      </div></fieldset>
      <div class="pdp__qty"><span>Quantity</span><div class="qty"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button><output data-qty-val>1</output><button type="button" data-qty="1" aria-label="Increase quantity">+</button></div></div>
      <button type="button" class="btn btn--block" data-add${p.soldOut ? ' disabled' : ' disabled'}>${p.soldOut ? 'Sold out' : 'Select a size'}</button>
      <a class="btn btn--ghost btn--block" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.soldOut ? 'Check stock' : 'Buy'} on islandhaze.mu ${EXT}</a>
      <p class="pdp__msg" data-msg role="status" aria-live="polite"></p>
      <dl class="pdp__facts">
        <div><dt>Category</dt><dd>${cat ? cat[1] : ''}</dd></div>
        <div><dt>${esc(p.legend)}s</dt><dd>${p.sizes.join(' · ')}</dd></div>
        <div><dt>Availability</dt><dd>${p.soldOut ? 'Sold out online — ask in store' : 'In stock'}</dd></div>
        <div><dt>In store</dt><dd><a href="stores.html">Riche Terre · Flacq · Cascavelle · Grand Baie</a></dd></div>
      </dl>
      ${p.credit ? `<p class="pdp__credit">Stand-in photo by <a href="${esc(p.credit.url)}" target="_blank" rel="noopener noreferrer">${esc(p.credit.name)}</a> on <a href="${esc(p.credit.unsplash)}" target="_blank" rel="noopener noreferrer">Unsplash</a></p>` : ''}
      ${inLooks.length ? `<div class="pdp__looks"><h2>Styled in</h2><div>${inLooks.map(({ l, i }) => `<a href="./#look-${i + 1}" class="mini-look"><img src="${l.m640}" alt="" width="64" height="114" loading="lazy" decoding="async"><span><b>0${i + 1}</b> ${esc(l.name)}</span></a>`).join('')}</div></div>` : ''}
    </div>
  </div>
  <section class="related" aria-labelledby="related"><div class="sec-head"><h2 id="related">You may also like</h2><a class="link-arrow" href="shop.html">Shop all ${ARROW}</a></div>
    <div class="grid grid--4">${related.map(card).join('')}</div></section>
</main>`
  });
});

/* ---------- Bag ---------- */
page({
  file: 'bag.html', key: 'bag',
  title: 'Styling bag — Island Haze',
  desc: 'Your Island Haze outfit shortlist.',
  scripts: ['pages.js'],
  body: `<main id="main" class="page page--wide bagpage">
  <p class="page-kicker">Your shortlist</p>
  <h1 class="reveal">Styling bag.</h1>
  <div class="bagpage__grid">
    <div class="bagpage__list" data-bag-list></div>
    <aside class="bagpage__sum">
      <h2>Summary</h2>
      <div class="sum-row"><span>Pieces</span><span data-bag-count>0</span></div>
      <div class="sum-row sum-row--total"><span>Reference subtotal</span><span data-bag-total>Rs 0</span></div>
      <p class="bag-note">No payment is taken here. Buy each piece on islandhaze.mu, or bring your shortlist to any Island Haze store.</p>
      <button type="button" class="btn btn--block" data-export-bag>Download shortlist ${ARROW}</button>
      <a class="btn btn--ghost btn--block" href="stores.html">Find a store</a>
      <button type="button" class="link-btn" data-clear-bag>Clear bag</button>
    </aside>
  </div>
</main>`
});

/* ---------- Stores ---------- */
page({
  file: 'stores.html', key: 'stores',
  title: 'Stores — Island Haze Mauritius',
  desc: 'Find an Island Haze store in Mauritius: Riche Terre, Cœur de Ville Flacq, Cascavelle and La Croisette Grand Baie.',
  body: `<main id="main" class="page">
  <p class="page-kicker">Island Haze · Mauritius</p>
  <h1 class="reveal">Find a store.</h1>
  <p class="page-lede">Try the looks in person at an Island Haze store. Hours come from each mall’s listing, so check before you travel.</p>
  <div class="store-grid">${D.stores.map((s, i) => {
    const tel = s.phone ? s.phone.replace(/\(.*\)/, '').replace(/[^+\d]/g, '') : '';
    return `<article class="store" style="--ci:${i}"><span class="store__num">0${i + 1}</span><h2>${esc(s.name)}</h2><p>${esc(s.area)}</p><p>${esc(s.hours)}</p>${s.phone ? `<p><a href="tel:${tel}">${esc(s.phone)}</a></p>` : ''}<p><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent('Island Haze ' + s.name + ' Mauritius')}" target="_blank" rel="noopener noreferrer">Directions ${EXT}</a></p></article>`;
  }).join('')}</div>
  <a class="btn" href="https://islandhaze.mu/" target="_blank" rel="noopener noreferrer">Shop online at islandhaze.mu ${ARROW}</a>
</main>`
});

/* ---------- About ---------- */
page({
  file: 'about.html', key: 'about',
  title: 'About — Island Haze Mauritius',
  desc: 'Island Haze has dressed young Mauritius since 2008 with colourful, fun and affordable urban streetwear.',
  body: `<main id="main" class="page">
  <p class="page-kicker">Since 2008</p>
  <h1 class="reveal">Colourful, fun, made for the island.</h1>
  <p class="page-lede">Island Haze launched in 2008 for a young audience, with a colourful and fun style. It is an urban clothing brand for teenagers, trend-setters and the young at heart, offering quality, affordable and edgy streetwear in Mauritius.</p>
  <div class="haze-band haze-band--about" aria-hidden="true"><img src="${esc(D.scenes.palms.src)}" alt="" loading="lazy" decoding="async" width="1600" height="600"></div>
  <div class="cols">
    <div><h2>What we make</h2><p>T-shirts with a message, floral dresses and casual streetwear, from beach dresses and boho-chic tops to classic polos, swimwear and jackets.</p></div>
    <div><h2>Where to find us</h2><p>Riche Terre Mall, Cœur de Ville Flacq, Cascavelle Mall and La Croisette in Grand Baie, or online at islandhaze.mu.</p></div>
    <div><h2>Follow the haze</h2><p>New drops land first on <a class="u" href="https://www.instagram.com/island.haze/" target="_blank" rel="noopener noreferrer">@island.haze</a>.</p></div>
  </div>
  <a class="btn" href="./">Try the Look ${ARROW}</a>
  <section class="credits" aria-labelledby="credits"><h2 id="credits">Photo credits</h2>
    <p>Product and island photos are stand-ins from <a class="u" href="https://unsplash.com/?utm_source=island_haze_site&amp;utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a> until Island Haze product shots are in. They are not Island Haze garments.</p>
    <ul>${D.items.filter(p => p.credit).map(p => `<li>${esc(p.name)}: <a href="${esc(p.credit.url)}" target="_blank" rel="noopener noreferrer">${esc(p.credit.name)}</a></li>`).join('')}<li>Island &amp; palms: <a href="${esc(D.scenes.island.url)}" target="_blank" rel="noopener noreferrer">${esc(D.scenes.island.name)}</a></li></ul>
  </section>
</main>`
});

/* ---------- 404 ---------- */
page({
  file: '404.html', key: '404',
  head: '<base href="/islandhaze-mauritius/">\n',
  title: 'Not found — Island Haze',
  desc: 'This page drifted off into the haze.',
  body: `<main id="main" class="page page--center">
  <p class="page-kicker">404</p>
  <h1 class="reveal">Lost in the haze.</h1>
  <p class="page-lede">That page doesn’t exist. Try the looks or browse the shop.</p>
  <div class="row-btns"><a class="btn" href="./">Try the Look ${ARROW}</a><a class="btn btn--ghost" href="shop.html">Shop</a></div>
</main>`
});
