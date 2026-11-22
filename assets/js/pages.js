(function () {
  const el = document.querySelector('[data-stores]');
  if (!el || !window.IH_DATA) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  el.innerHTML = IH_DATA.stores.map(s => {
    const tel = s.phone ? s.phone.replace(/\(.*\)/, '').replace(/[^+\d]/g, '') : '';
    return `<article class="store"><h2>${esc(s.name)}</h2><p>${esc(s.area)}</p><p>${esc(s.hours)}</p>${s.phone ? `<p><a href="tel:${tel}">${esc(s.phone)}</a></p>` : ''}</article>`;
  }).join('');
})();
