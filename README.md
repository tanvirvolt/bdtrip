# BDTrip

Static website (no build step, no backend). Files:

- `index.html`, `style.css`, `app.js` - the site
- `data.js` - 64 district shapes (SVG paths), Bangla names, divisions
- `info.js` - district guide (places to visit, best season, local food)
- `vendor/jspdf.umd.min.js` - PDF export library (self-hosted)

## Features
- Two modes: "ঘুরেছি" (visited) and "ঘুরতে চাই" (wishlist), on list or map
- District guide with Google Maps link, division progress, trip list
- Trip budget calculator, packing checklist
- Export map as PNG / JPG / PDF, share (Web Share, WhatsApp, copy text)
- Everything is saved in the visitor's browser (localStorage)

## Deploy
Upload the whole folder to any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages, or cPanel `public_html`).

## Customize
- Colors/themes: `THEMES` array at the top of `app.js`
- District guide text: `info.js` (keys are the English district names used in `data.js`)
- Export size: `W` and `H` in `app.js` (default 1080x1350)

## Credits
Boundary data: geoBoundaries (CC BY 4.0). Keep the footer credit.