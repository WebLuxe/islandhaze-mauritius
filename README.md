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

## To do before launch
- Set `image:` on each product in `data.js` to real Island Haze product photos. Until then a colour tile is shown.
- Confirm the prices marked `verified: false` in `data.js`.
- Replace the model cut-outs (`m640` / `m1080`) with Island Haze look shots, and adjust the `PIN` positions to match.
