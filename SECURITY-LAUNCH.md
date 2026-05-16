# Dental Factory Security Checklist

## Render environment

- Set `ADMIN_PASSWORD` to a private password that is not shared in chat, screenshots, or GitHub.
- Keep `SESSION_SECRET` present and random. Render can generate it from `render.yaml`.
- Add Razorpay keys only in Render Environment, never in code or GitHub.
- Keep `NODE_ENV=production` on Render.

## Admin habits

- Use the admin panel only on trusted devices.
- Log out after product or order updates.
- Change `ADMIN_PASSWORD` immediately if it was shared with anyone.
- Do not upload very large product images. Compress images before adding products.

## Data safety

- The server blocks public access to `data/`, `server.mjs`, `package.json`, and other private files.
- Admin APIs require login cookies.
- Public order tracking masks phone numbers and hides delivery addresses.
- JSON writes are atomic to reduce file corruption risk during deploys or traffic spikes.

## Go-live checks

- `https://bhartidentindia.com/api/health` should return `{ "ok": true }`.
- `https://bhartidentindia.com/data/orders.json` should return `404`.
- `https://bhartidentindia.com/server.mjs` should return `404`.
- `https://bhartidentindia.com/robots.txt` and `/sitemap.xml` should return `200`.

## Next scale step

The current launch build stores products and orders in JSON files. It is good for a quick MVP. For heavier real traffic, move orders/products to Postgres on Render and enable automated database backups.
