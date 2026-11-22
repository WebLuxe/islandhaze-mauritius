/* Island Haze — local "styling bag" shared by every page. */
(function () {
  const KEY = 'islandhaze-styling-bag-v1';
  const D = window.IH_DATA;
  let entries = load();
  let toastTimer = 0;

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(e => e && Number.isSafeInteger(e.id) && Number.isSafeInteger(e.quantity) && e.quantity >= 1 && e.quantity <= 20).slice(0, 50);
    } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (e) {} }

  let catalogPromise = null;
  function catalog() {
    if (!catalogPromise) {
      catalogPromise = Promise.resolve().then(() => {
        if (!D || !Array.isArray(D.items)) throw new Error('The product list could not load.');
        const ok = D.items.every(i => typeof i.id === 'string' && typeof i.name === 'string' && Number.isFinite(i.price) && i.price >= 0 &&
          Array.isArray(i.variants) && i.variants.every(v => Number.isSafeInteger(v.id) && typeof v.a === 'boolean' && Array.isArray(v.o) && v.o.every(o => typeof o === 'string')));
        if (!ok) throw new Error('The product list is unavailable.');
        return D.items;
      });
    }
    return catalogPromise;
  }
  function findVariant(items, id) {
    for (const p of items) { const v = p.variants.find(x => x.id === id); if (v) return { p, v }; }
    return null;
  }

  async function add(list) {
    const items = await catalog();
    for (const it of list) {
      const m = findVariant(items, it.id);
      if (!m || !m.v.a) throw new Error('Please choose an available size.');
    }
    for (const it of list) {
      const e = entries.find(x => x.id === it.id);
      if (e) e.quantity = Math.min(20, e.quantity + 1);
      else entries.push({ id: it.id, quantity: 1 });
    }
    entries = entries.slice(0, 50);
    save(); render();
    toast(list.length > 1 ? 'Look saved to your styling bag' : 'Piece saved to your styling bag');
  }

  function count() { return entries.reduce((s, e) => s + e.quantity, 0); }

  function toast(msg) {
    const el = document.getElementById('bag-status');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2500);
  }

  function thumb(p) {
    if (p.image) return `<img src="${p.image}" alt="${esc(p.name)}" width="60" height="80">`;
    return `<span class="ih-ph" style="--ph:${p.tone}" aria-hidden="true"><span>${esc(p.type)}</span></span>`;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  async function render() {
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count(); });
    const box = document.getElementById('bag-items');
    if (!box) return;
    const items = await catalog().catch(() => []);
    const totalEl = document.getElementById('bag-total');
    const exp = document.getElementById('export-bag');
    if (!entries.length) {
      box.innerHTML = '<p class="bag-note">Your styling bag is empty. Choose a size beside a piece to save it.</p>';
      totalEl.textContent = '';
      exp.disabled = true;
      return;
    }
    let total = 0;
    box.innerHTML = entries.map(e => {
      const m = findVariant(items, e.id);
      if (!m) return '';
      const url = new URL(m.p.url);
      if (url.hostname !== D.shopHost) throw new Error('Unexpected product link.');
      total += m.p.price * e.quantity;
      return `<div class="bag-row">${thumb(m.p)}<div><h3>${esc(m.p.name)}</h3><p>${esc(m.p.legend)} ${esc(m.v.o[0])} · Quantity ${e.quantity} · ${D.money(m.p.price)}</p><a href="${url.href}" target="_blank" rel="noopener noreferrer">View on islandhaze.mu ↗</a></div><button type="button" class="bag-remove" data-remove="${e.id}" aria-label="Remove ${esc(m.p.name)}">×</button></div>`;
    }).join('');
    totalEl.textContent = 'Reference subtotal ' + D.money(total);
    exp.disabled = false;
  }

  function exportList() {
    catalog().then(items => {
      const parts = ['ISLAND HAZE — STYLING SHORTLIST', 'Reference prices; no order or payment has been placed.', ''];
      entries.forEach(e => {
        const m = findVariant(items, e.id);
        if (m) parts.push(`${m.p.name} · ${m.p.legend} ${m.v.o[0]} · Quantity ${e.quantity}\n${m.p.url}`);
      });
      const blob = new Blob([parts.join('\n\n')], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'islandhaze-outfit-shortlist.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }

  function wire() {
    const dlg = document.getElementById('bag-dialog');
    const open = document.getElementById('open-bag');
    if (open && dlg) open.addEventListener('click', async () => { await render(); dlg.showModal(); });
    const close = document.getElementById('close-bag');
    if (close) close.addEventListener('click', () => dlg.close());
    if (dlg) {
      dlg.addEventListener('click', e => {
        const rm = e.target.closest('[data-remove]');
        if (rm) { entries = entries.filter(x => x.id !== Number(rm.dataset.remove)); save(); render(); return; }
        const r = dlg.getBoundingClientRect();
        if (e.target === dlg && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dlg.close();
      });
    }
    const exp = document.getElementById('export-bag');
    if (exp) exp.addEventListener('click', exportList);
    window.addEventListener('storage', e => { if (e.key === KEY) { entries = load(); render(); } });
    render();
  }

  window.IHBag = { add, count, toast, render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
