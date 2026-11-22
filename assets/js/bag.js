/* Island Haze — local "styling bag" shared by every page (localStorage). */
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
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (e) {}
    render();
    window.dispatchEvent(new CustomEvent('ih:bag'));
  }

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
  function findVariant(id) {
    for (const p of D.items) { const v = p.variants.find(x => x.id === id); if (v) return { p, v }; }
    return null;
  }

  async function add(list) {
    await catalog();
    for (const it of list) {
      const m = findVariant(it.id);
      if (!m || !m.v.a) throw new Error('Please choose an available size.');
    }
    for (const it of list) {
      const e = entries.find(x => x.id === it.id);
      if (e) e.quantity = Math.min(20, e.quantity + (it.quantity || 1));
      else entries.push({ id: it.id, quantity: Math.min(20, it.quantity || 1) });
    }
    entries = entries.slice(0, 50);
    save();
    toast(list.length > 1 ? 'Look saved to your styling bag' : 'Piece saved to your styling bag');
  }
  function setQty(id, q) {
    const e = entries.find(x => x.id === id);
    if (!e) return;
    if (q < 1) entries = entries.filter(x => x.id !== id);
    else e.quantity = Math.min(20, q);
    save();
  }
  function remove(id) { entries = entries.filter(x => x.id !== id); save(); }
  function clear() { entries = []; save(); }
  function list() {
    return entries.map(e => { const m = findVariant(e.id); return m ? { ...e, product: m.p, size: m.v.o[0] } : null; }).filter(Boolean);
  }
  function count() { return entries.reduce((s, e) => s + e.quantity, 0); }
  function total() { return list().reduce((s, r) => s + r.product.price * r.quantity, 0); }

  function toast(msg) {
    const el = document.getElementById('bag-status');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2500);
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function thumb(p, w, h) {
    if (p.image) return `<img src="${esc(p.image)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;
    return `<span class="ih-ph" style="--ph:${p.tone}" aria-hidden="true"><span>${esc(p.type)}</span></span>`;
  }

  function render() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      if (el.textContent !== String(n)) {
        el.textContent = n;
        el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump');
      }
    });
    const box = document.getElementById('bag-items');
    if (!box) return;
    const rows = list();
    const totalEl = document.getElementById('bag-total');
    const exp = document.getElementById('export-bag');
    if (!rows.length) {
      box.innerHTML = '<p class="bag-note">Your styling bag is empty. Choose a size beside a piece to save it.</p>';
      totalEl.textContent = '';
      exp.disabled = true;
      return;
    }
    box.innerHTML = rows.map(r => {
      const url = new URL(r.product.url);
      if (url.hostname !== D.shopHost) throw new Error('Unexpected product link.');
      return `<div class="bag-row">${thumb(r.product, 60, 80)}<div><h3><a href="${r.product.page}">${esc(r.product.name)}</a></h3><p>${esc(r.product.legend)} ${esc(r.size)} · Quantity ${r.quantity} · ${D.money(r.product.price)}</p><a href="${url.href}" target="_blank" rel="noopener noreferrer">View on islandhaze.mu ↗</a></div><button type="button" class="bag-remove" data-remove="${r.id}" aria-label="Remove ${esc(r.product.name)}">×</button></div>`;
    }).join('');
    totalEl.textContent = 'Reference subtotal ' + D.money(total());
    exp.disabled = false;
  }

  function exportList() {
    const parts = ['ISLAND HAZE — STYLING SHORTLIST', 'Reference prices; no order or payment has been placed.', ''];
    list().forEach(r => parts.push(`${r.product.name} · ${r.product.legend} ${r.size} · Quantity ${r.quantity}\n${r.product.url}`));
    parts.push('Reference subtotal: ' + D.money(total()));
    const blob = new Blob([parts.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'islandhaze-outfit-shortlist.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function wire() {
    const dlg = document.getElementById('bag-dialog');
    const open = document.getElementById('open-bag');
    if (open && dlg) open.addEventListener('click', () => { render(); dlg.showModal(); });
    const close = document.getElementById('close-bag');
    if (close) close.addEventListener('click', () => dlg.close());
    if (dlg) {
      dlg.addEventListener('click', e => {
        const rm = e.target.closest('[data-remove]');
        if (rm) { remove(Number(rm.dataset.remove)); return; }
        const r = dlg.getBoundingClientRect();
        if (e.target === dlg && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dlg.close();
      });
    }
    document.querySelectorAll('[data-export-bag], #export-bag').forEach(b => b.addEventListener('click', exportList));
    const refresh = () => { entries = load(); render(); window.dispatchEvent(new CustomEvent('ih:bag')); };
    window.addEventListener('storage', e => { if (e.key === KEY) refresh(); });
    window.addEventListener('pageshow', e => { if (e.persisted) refresh(); });
    document.addEventListener('prerenderingchange', refresh);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { const before = JSON.stringify(entries); entries = load(); if (JSON.stringify(entries) !== before) refresh(); } });
    render();
  }

  window.IHBag = { add, setQty, remove, clear, list, count, total, toast, render, exportList };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
