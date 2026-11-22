/* Island Haze — shared site data.
 * Product names, prices and links come from islandhaze.mu (as indexed Nov 2026).
 * `verified: true`  = price read from the product/category listing.
 * `verified: false` = price estimated from the category range — confirm before launch.
 * `image: null`     = no product photo yet. Drop the real photo URL/path in and it replaces
 *                     the colour placeholder tile everywhere (panel, size sheet, bag).
 * Model figures reuse the reference runway cut-outs until Island Haze look shots are shot.
 */
(function () {
  const MODEL = 'https://reel-ref-try-the-look.vercel.app/assets/';
  const SHOP = 'https://islandhaze.mu/';
  const APPAREL = ['S', 'M', 'L', 'XL'];
  const WAIST = ['30', '32', '34', '36'];

  const items = [
    { id: 'tropez-coloured', name: 'Tropez Coloured', type: 'T-shirt', price: 800, verified: true,
      url: SHOP + 'tropez-colourede1028529.html', legend: 'Size', sizes: APPAREL, tone: '#f4b23e', image: null },
    { id: 'abelneer-denim', name: 'Abelneer Denim', type: 'Denim', price: 1600, verified: true,
      url: SHOP + 'men.html', legend: 'Waist', sizes: WAIST, tone: '#6f8fb8', image: null },
    { id: 'jaffa-cargo', name: 'Jaffa Cargo', type: 'Cargo pant', price: 1600, verified: true,
      url: SHOP + 'jaffa-cargoe1025027.html', legend: 'Waist', sizes: WAIST, tone: '#8a7a56', image: null },
    { id: 'denim-hoodie-jacket', name: 'Denim Hoodie Jacket', type: 'Outerwear', price: 1600, verified: false,
      url: SHOP + 'denim-hoodie-jacket', legend: 'Size', sizes: APPAREL, tone: '#3f5e86', image: null, isNew: true },
    { id: 'azuri-stripe', name: 'Azuri Stripe', type: 'Shirt', price: 1200, verified: false,
      url: SHOP + 'azuri-stripee1025844.html', legend: 'Size', sizes: APPAREL, tone: '#4fb3c9', image: null, isNew: true },
    { id: 'bahamas-gauze', name: 'Bahamas Gauze', type: 'Gauze shirt', price: 1100, verified: false,
      url: SHOP + 'bahamas-gauzee1026310.html', legend: 'Size', sizes: APPAREL, tone: '#e9dcc3', image: null },
    { id: 'boxette-moment', name: 'Boxette Moment', type: 'Oversize T-shirt', price: 1000, verified: false, soldOut: true,
      url: SHOP + 'boxette-momente1026278.html', legend: 'Size', sizes: APPAREL, tone: '#232323', image: null },
    { id: 'cocoon-freedom', name: 'Cocoon Freedom', type: 'Oversize hoodie', price: 1600, verified: false, soldOut: true,
      url: SHOP + 'cocoon-freedome1018746.html', legend: 'Size', sizes: APPAREL, tone: '#f2d43a', image: null }
  ];

  // Shop categories.
  const CAT = { 'tropez-coloured': 'tops', 'azuri-stripe': 'tops', 'bahamas-gauze': 'tops', 'boxette-moment': 'tops',
    'abelneer-denim': 'bottoms', 'jaffa-cargo': 'bottoms', 'denim-hoodie-jacket': 'outerwear', 'cocoon-freedom': 'outerwear' };
  const CATS = [['tops', 'Tops'], ['bottoms', 'Bottoms'], ['outerwear', 'Outerwear']];

  // Variant ids: stable synthetic integers (product position × 100 + size position).
  items.forEach((p, pi) => {
    p.cat = CAT[p.id];
    p.page = 'product-' + p.id + '.html';
    p.variants = p.sizes.map((s, si) => ({ id: 910000 + (pi + 1) * 100 + si + 1, a: !p.soldOut, o: [s] }));
  });

  // Pin heights by garment family (% of figure box).
  const PIN = { top: [50, 30], bottom: [47, 62], outer: [44, 40] };

  const looks = [
    { key: 'pl01', name: 'Port Louis Edit', m: 1, description: 'A clean stripe and easy denim for the capital.',
      pieces: [['azuri-stripe', 'top'], ['abelneer-denim', 'bottom'], ['tropez-coloured', 'outer']] },
    { key: 'gb02', name: 'Grand Baie Sundown', m: 5, description: 'A bright tee and relaxed denim for the north coast.',
      pieces: [['tropez-coloured', 'top'], ['abelneer-denim', 'bottom'], ['bahamas-gauze', 'outer']] },
    { key: 'fq03', name: 'Flacq Market', m: 4, description: 'Light gauze, cargo pockets and a denim layer.',
      pieces: [['bahamas-gauze', 'top'], ['jaffa-cargo', 'bottom'], ['denim-hoodie-jacket', 'outer']] },
    { key: 'rt04', name: 'Riche Terre Nights', m: 6, description: 'Black oversize, washed denim, hood up.',
      pieces: [['boxette-moment', 'top'], ['abelneer-denim', 'bottom'], ['denim-hoodie-jacket', 'outer']] },
    { key: 'cv05', name: 'Cascavelle Weekend', m: 3, description: 'Stripes, cargos and a cocoon hoodie.',
      pieces: [['azuri-stripe', 'top'], ['jaffa-cargo', 'bottom'], ['cocoon-freedom', 'outer']] },
    { key: 'ih06', name: 'Island Haze Classic', m: 2, description: 'The everyday uniform, since 2008.',
      pieces: [['tropez-coloured', 'top'], ['jaffa-cargo', 'bottom'], ['denim-hoodie-jacket', 'outer']] }
  ].map(l => ({
    ...l,
    m640: MODEL + 'model-' + l.m + '-640.webp',
    m1080: MODEL + 'original-look-' + l.m + '.webp',
    products: l.pieces.map(p => p[0]),
    pins: l.pieces.map(p => PIN[p[1]])
  }));

  const stores = [
    { name: 'Riche Terre Mall', area: 'Riche Terre, Port Louis', phone: null, hours: 'Mon–Thu 09:30–20:30 (mall listing)' },
    { name: 'Cœur de Ville Flacq', area: 'Centre de Flacq', phone: '+230 460 1763', hours: 'Mon–Sat 09:30–19:30 · Sun 09:30–15:00' },
    { name: 'Cascavelle Mall', area: 'Rivière Noire road, Uniciti', phone: '+230 452 9336', hours: 'Mon–Thu 09:30–19:00 · Fri–Sat 09:30–20:00 · Sun 09:30–15:00' },
    { name: 'La Croisette', area: 'Chemin Vingt Pieds, Grand Baie', phone: '+230 209 2000 (mall)', hours: 'Mon–Sat 09:30–20:30 · Sun 09:30–16:00' }
  ];

  window.IH_DATA = {
    source: SHOP,
    shopHost: 'islandhaze.mu',
    looks, items, stores, cats: CATS,
    byId: id => items.find(i => i.id === id),
    money: n => 'Rs ' + Math.round(n).toLocaleString('en-US')
  };
})();
