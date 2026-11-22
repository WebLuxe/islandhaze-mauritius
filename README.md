# Island Haze — Try the Look

A static, multi-page site for Island Haze (Mauritius). It is plain HTML, CSS and vanilla JS, with no build step.

- `index.html`: the "Try the Look." runway (`<runway-section>`), with a 3D ring on desktop and a walking line on phones.
- `stores.html`, `about.html`: store finder and brand page.
- `assets/js/data.js`: **all products, prices, looks and stores live here**.
- `assets/js/bag.js`: local styling bag, shared across pages through localStorage.

## To do before launch
- Set `image:` on each product in `data.js` to real Island Haze product photos. Until then a colour tile is shown.
- Confirm the prices marked `verified: false` in `data.js`.
- Replace the model cut-outs (`m640` / `m1080`) with Island Haze look shots, and adjust the `PIN` positions to match.
