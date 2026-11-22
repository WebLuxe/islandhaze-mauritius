# Island Haze — Try the Look

A static, multi-page site for Island Haze (Mauritius). It is plain HTML, CSS and vanilla JS, with no framework.

## Pages
- `index.html`: intro animation, the "Try the Look." runway (a 3D ring on desktop, a walking line on phones), the New-in rail, the looks grid and the stores band.
- `shop.html`: category filters, in-stock toggle and sort. Filter state is kept in the URL, e.g. `shop.html?cat=bottoms`.
- `product-<id>.html`: one page per product, with size picker, quantity, add to bag, a "Styled in" section linking to looks, and related pieces.
- `bag.html`: the styling bag, with quantities, subtotal and a shortlist download.
- `stores.html`, `about.html`, `404.html`.

Each look can be deep-linked: `index.html#look-3`.

## Editing
The HTML pages are **generated**. Edit `assets/js/data.js` (products, prices, looks, stores) or `tools/build.mjs` (layout and copy), then run:

```
node tools/build.mjs
```

## Motion & performance
- **Intro**: shown once per browser session and skippable by click or key. It is skipped under reduced motion.
- **Page transitions**: native cross-document View Transitions. The header stays put, the active-tab marker slides between tabs, and product images morph from a card into the product page and back. Browsers without View Transitions get a plain fade.
- **Instant navigation**: Speculation Rules prefetch links and prerender them on hover.
- **Other**: deferred scripts, a preconnected and preloaded font, lazy images, `content-visibility` on sections below the fold, and a runway animation loop that only runs while the runway is on screen.

## Photos
Product photos and the two island scenes are **stand-ins from Unsplash** (credited on each product page and on About). They are not Island Haze garments. They are served from Unsplash's CDN, cropped to 4:5 at the size each slot needs (240px thumbnails, a 400–1280px `srcset` for cards and product pages).

To swap in real shots, set `image:` on a product in `assets/js/data.js`. It overrides the stand-in everywhere. Then remove that product's `photo:` line so the credit disappears too.

## Tested on
- Desktop: Edge (Chromium), 1440×900.
- Phone: a real Android 14 device in Chrome 124, 384×748 CSS px, over wireless ADB.
  - Layout shift 0. Largest image on screen in about 0.4–0.85s locally. Scrolling at 60fps. Runway at 55–60fps. Every tap target 32px or larger.
  - Chrome versions below 126 have no cross-page View Transitions, so they get a fade-up of the page instead.

## To do before launch
- Real Island Haze product photos (see Photos).
- Confirm the prices marked `verified: false` in `data.js`.
- Replace the model cut-outs (`m640` / `m1080`) with Island Haze look shots, and adjust the `PIN` positions to match.
