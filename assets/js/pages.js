/* Island Haze — Shop filters, product pages and the bag page. */
(function () {
  const D = window.IH_DATA;
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const withTransition = (fn, els) => {
    if (!document.startViewTransition || RM.matches) { fn(); return; }
    els.forEach((el, i) => { el.style.viewTransitionName = 'c' + i; });
    const t = document.startViewTransition(fn);
    t.finished.finally(() => els.forEach(el => { el.style.viewTransitionName = ''; }));
  };

  /* ---------- Shop ---------- */
  const grid = document.querySelector('[data-grid]');
  if (grid) {
    const cards = [...grid.querySelectorAll('.card')];
    const chips = [...document.querySelectorAll('[data-filter]')];
    const stockBtn = document.querySelector('[data-instock]');
    const sortSel = document.querySelector('[data-sort]');
    const countEl = document.querySelector('[data-count]');
    const empty = document.querySelector('[data-empty]');
    const params = new URLSearchParams(location.search);
    const state = {
      cat: D.cats.some(c => c[0] === params.get('cat')) ? params.get('cat') : 'all',
      inStock: params.get('stock') === 'in',
      sort: ['featured', 'price-asc', 'price-desc', 'name'].includes(params.get('sort')) ? params.get('sort') : 'featured'
    };
    const apply = animate => {
      const run = () => {
        chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === state.cat)));
        stockBtn.setAttribute('aria-pressed', String(state.inStock));
        sortSel.value = state.sort;
        const sorted = [...cards].sort((a, b) => {
          if (state.sort === 'price-asc') return a.dataset.price - b.dataset.price || a.dataset.order - b.dataset.order;
          if (state.sort === 'price-desc') return b.dataset.price - a.dataset.price || a.dataset.order - b.dataset.order;
          if (state.sort === 'name') return a.querySelector('.card__name').textContent.localeCompare(b.querySelector('.card__name').textContent);
          return a.dataset.order - b.dataset.order;
        });
        let shown = 0;
        sorted.forEach(c => {
          const ok = (state.cat === 'all' || c.dataset.cat === state.cat) && (!state.inStock || c.dataset.stock === 'in');
          c.hidden = !ok;
          if (ok) { shown++; c.classList.add('in'); }
          grid.appendChild(c);
        });
        countEl.textContent = shown + (shown === 1 ? ' piece' : ' pieces');
        empty.hidden = shown > 0;
      };
      if (animate) withTransition(run, cards); else run();
      const q = new URLSearchParams();
      if (state.cat !== 'all') q.set('cat', state.cat);
      if (state.inStock) q.set('stock', 'in');
      if (state.sort !== 'featured') q.set('sort', state.sort);
      const qs = q.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    };
    chips.forEach(c => c.addEventListener('click', () => { state.cat = c.dataset.filter; apply(true); }));
    stockBtn.addEventListener('click', () => { state.inStock = !state.inStock; apply(true); });
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; apply(true); });
    document.querySelector('[data-reset]').addEventListener('click', () => { state.cat = 'all'; state.inStock = false; state.sort = 'featured'; apply(true); });
    apply(false);
  }

  /* ---------- Product page ---------- */
  const pdp = document.querySelector('.pdp');
  if (pdp) {
    const p = D.byId(pdp.dataset.product);
    const btn = pdp.querySelector('[data-add]');
    const msg = pdp.querySelector('[data-msg]');
    const qtyOut = pdp.querySelector('[data-qty-val]');
    let qty = 1;
    const sel = () => pdp.querySelector('input[name="size"]:checked');
    const label = () => {
      if (p.soldOut) { btn.textContent = 'Sold out'; btn.disabled = true; return; }
      const s = sel();
      btn.disabled = !s;
      btn.textContent = s ? `Add to bag — ${D.money(p.price * qty)}` : 'Select a size';
    };
    pdp.addEventListener('change', e => { if (e.target.name === 'size') { msg.textContent = ''; label(); } });
    pdp.querySelectorAll('[data-qty]').forEach(b => b.addEventListener('click', () => {
      qty = Math.max(1, Math.min(10, qty + Number(b.dataset.qty)));
      qtyOut.textContent = qty;
      label();
    }));
    btn.addEventListener('click', async () => {
      const s = sel();
      if (!s) { msg.textContent = 'Pick a size first.'; return; }
      btn.classList.add('is-loading');
      try {
        await window.IHBag.add([{ id: Number(s.value), quantity: qty }]);
        btn.classList.add('is-done');
        btn.textContent = 'Added to your bag ✓';
        msg.innerHTML = '<a class="u" href="bag.html">View your styling bag</a>';
        setTimeout(() => { btn.classList.remove('is-done'); label(); }, 2200);
      } catch (e) {
        msg.textContent = (e && e.message) || 'Couldn’t add to bag. Please try again.';
      }
      btn.classList.remove('is-loading');
    });
    label();
  }

  /* ---------- Bag page ---------- */
  const listEl = document.querySelector('[data-bag-list]');
  if (listEl) {
    const thumb = p => p.image ? `<img src="${esc(p.thumb || p.image)}" alt="" width="120" height="150" loading="lazy" decoding="async">` : `<span class="ih-ph" style="--ph:${p.tone}" aria-hidden="true"><span>${esc(p.type)}</span></span>`;
    const render = () => {
      const rows = window.IHBag.list();
      document.querySelector('[data-bag-count]').textContent = window.IHBag.count();
      document.querySelector('[data-bag-total]').textContent = D.money(window.IHBag.total());
      document.querySelectorAll('[data-export-bag], [data-clear-bag]').forEach(b => { b.disabled = !rows.length; });
      if (!rows.length) {
        listEl.innerHTML = '<div class="bag-empty"><p>Your styling bag is empty.</p><div class="row-btns"><a class="btn" href="./">Try the Look</a><a class="btn btn--ghost" href="shop.html">Shop all</a></div></div>';
        return;
      }
      listEl.innerHTML = rows.map(r => `<article class="bag-line" data-id="${r.id}">
        <a class="bag-line__media" href="${r.product.page}">${thumb(r.product)}</a>
        <div class="bag-line__info"><span class="card__type">${esc(r.product.type)}</span><a class="bag-line__name" href="${r.product.page}">${esc(r.product.name)}</a><span class="bag-line__meta">${esc(r.product.legend)} ${esc(r.size)} · ${D.money(r.product.price)}</span>
          <a class="bag-line__ext" href="${r.product.url}" target="_blank" rel="noopener noreferrer">Buy on islandhaze.mu ↗</a></div>
        <div class="qty"><button type="button" data-step="-1" aria-label="Decrease quantity of ${esc(r.product.name)}">−</button><output>${r.quantity}</output><button type="button" data-step="1" aria-label="Increase quantity of ${esc(r.product.name)}">+</button></div>
        <span class="bag-line__sum">${D.money(r.product.price * r.quantity)}</span>
        <button type="button" class="bag-remove" data-rm aria-label="Remove ${esc(r.product.name)}">×</button>
      </article>`).join('');
    };
    listEl.addEventListener('click', e => {
      const line = e.target.closest('.bag-line');
      if (!line) return;
      const id = Number(line.dataset.id);
      const step = e.target.closest('[data-step]');
      if (step) { const r = window.IHBag.list().find(x => x.id === id); if (r) window.IHBag.setQty(id, r.quantity + Number(step.dataset.step)); }
      else if (e.target.closest('[data-rm]')) {
        if (RM.matches) window.IHBag.remove(id);
        else { line.classList.add('is-out'); setTimeout(() => window.IHBag.remove(id), 320); }
      }
    });
    document.querySelector('[data-clear-bag]').addEventListener('click', () => { if (confirm('Clear every piece from your styling bag?')) window.IHBag.clear(); });
    window.addEventListener('ih:bag', render);
    render();
  }
})();
