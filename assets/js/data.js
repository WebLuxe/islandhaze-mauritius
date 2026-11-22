/* Island Haze — shared site data.
 * Product names, prices and links come from islandhaze.mu (as indexed Nov 2026).
 * `verified: true`  = price read from the product/category listing.
 * `verified: false` = price estimated from the category range — confirm before launch.
 * `photo`           = stand-in Unsplash photo (credited) until Island Haze product shots exist.
 *                     Set `image` to a real photo URL to override it everywhere.
 * Model figures reuse the reference runway cut-outs until Island Haze look shots are shot.
 */
(function () {
  const MODEL = 'https://reel-ref-try-the-look.vercel.app/assets/';
  const SHOP = 'https://islandhaze.mu/';
  const APPAREL = ['S', 'M', 'L', 'XL'];
  const WAIST = ['30', '32', '34', '36'];
  // Unsplash stand-in photos, cropped 4:5 on Unsplash's CDN at the size each slot needs.
  const UQ = '?ixlib=rb-4.1.0&auto=format&fit=crop&crop=entropy&q=70';
  const U = (ph, name, user) => ({ base: 'https://images.unsplash.com/photo-' + ph + UQ, name, user });
  const sized = (ph, w) => ph.base + '&w=' + w + '&h=' + Math.round(w * 1.25);
  const UTM = '?utm_source=island_haze_site&utm_medium=referral';

  const items = [
    { id: 'tropez-coloured', name: 'Tropez Coloured', type: 'T-shirt', price: 800, verified: true,
      url: SHOP + 'tropez-colourede1028529.html', legend: 'Size', sizes: APPAREL, tone: '#f4b23e', photo: U('1416339698674-4f118dd3388b', 'Jeff Sheldon', 'ugmonk') },
    { id: 'abelneer-denim', name: 'Abelneer Denim', type: 'Denim', price: 1600, verified: true,
      url: SHOP + 'men.html', legend: 'Waist', sizes: WAIST, tone: '#6f8fb8', photo: U('1696967648017-8a8d41bef9e8', 'Roozbeh Eslami', 'roozbeheslami') },
    { id: 'jaffa-cargo', name: 'Jaffa Cargo', type: 'Cargo pant', price: 1600, verified: true,
      url: SHOP + 'jaffa-cargoe1025027.html', legend: 'Waist', sizes: WAIST, tone: '#8a7a56', photo: U('1766575696324-5b65330f23c2', 'sammy swae', 'sammyswae') },
    { id: 'denim-hoodie-jacket', name: 'Denim Hoodie Jacket', type: 'Outerwear', price: 1600, verified: false,
      url: SHOP + 'denim-hoodie-jacket', legend: 'Size', sizes: APPAREL, tone: '#3f5e86', photo: U('1570730915174-a8acdab39f71', 'Wassim Chouak', 'ynwasso'), isNew: true },
    { id: 'azuri-stripe', name: 'Azuri Stripe', type: 'Shirt', price: 1200, verified: false,
      url: SHOP + 'azuri-stripee1025844.html', legend: 'Size', sizes: APPAREL, tone: '#4fb3c9', photo: U('1763403006901-9a3371dcff58', 'Asif Azr', 'asifazr'), isNew: true },
    { id: 'bahamas-gauze', name: 'Bahamas Gauze', type: 'Gauze shirt', price: 1100, verified: false,
      url: SHOP + 'bahamas-gauzee1026310.html', legend: 'Size', sizes: APPAREL, tone: '#e9dcc3', photo: U('1623413487006-54669f337144', 'Samuel Bryngelsson', 'samuelbryngelsson') },
    { id: 'boxette-moment', name: 'Boxette Moment', type: 'Oversize T-shirt', price: 1000, verified: false, soldOut: true,
      url: SHOP + 'boxette-momente1026278.html', legend: 'Size', sizes: APPAREL, tone: '#232323', photo: U('1618453292459-53424b66bb6a', 'Sven Ciupka', 'svenciupkab') },
    { id: 'cocoon-freedom', name: 'Cocoon Freedom', type: 'Oversize hoodie', price: 1600, verified: false, soldOut: true,
      url: SHOP + 'cocoon-freedome1018746.html', legend: 'Size', sizes: APPAREL, tone: '#f2d43a', photo: U('1554967769-1f961137e9c1', 'Oswaldo Ibáñez', 'itsmeoswaldo') }
  ];

  // Shop categories.
  const CAT = { 'tropez-coloured': 'tops', 'azuri-stripe': 'tops', 'bahamas-gauze': 'tops', 'boxette-moment': 'tops',
    'abelneer-denim': 'bottoms', 'jaffa-cargo': 'bottoms', 'denim-hoodie-jacket': 'outerwear', 'cocoon-freedom': 'outerwear' };
  const CATS = [['tops', 'Tops'], ['bottoms', 'Bottoms'], ['outerwear', 'Outerwear']];

  // Variant ids: stable synthetic integers (product position × 100 + size position).
  items.forEach((p, pi) => {
    p.cat = CAT[p.id];
    p.page = 'product-' + p.id + '.html';
    if (p.photo && !p.image) {
      p.image = sized(p.photo, 640);
      p.thumb = sized(p.photo, 240);
      p.srcset = [400, 640, 960, 1280].map(w => sized(p.photo, w) + ' ' + w + 'w').join(', ');
      p.credit = { name: p.photo.name, url: 'https://unsplash.com/@' + p.photo.user + UTM, unsplash: 'https://unsplash.com/' + UTM };
    }
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

  const scenes = {
    island: { src: 'https://images.unsplash.com/photo-1513415277900-a62401e19be4' + UQ + '&w=1600&h=700', name: 'Xavier Coiffic', url: 'https://unsplash.com/@xaviercoiffic' + UTM },
    palms: { src: 'https://images.unsplash.com/photo-1537640685236-a9df2496e232' + UQ + '&w=1600&h=600', name: 'Xavier Coiffic', url: 'https://unsplash.com/@xaviercoiffic' + UTM }
  };
  window.IH_DATA = { scenes, 
    source: SHOP,
    shopHost: 'islandhaze.mu',
    looks, items, stores, cats: CATS,
    byId: id => items.find(i => i.id === id),
    money: n => 'Rs ' + Math.round(n).toLocaleString('en-US')
  };
})();
