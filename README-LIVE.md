# Dental Factory Live Setup

## Run locally

```bash
npm start
```

Open `http://127.0.0.1:5173/`.

## Required live environment variables

- `ADMIN_PASSWORD`: set your private admin password.
- `SESSION_SECRET`: set any long random text for admin login cookies.
- `ADMIN_SESSION_MINUTES`: admin auto logout window. Default is `30`.
- `DATA_DIR`: set to a persistent folder such as `/var/data` after attaching a Render persistent disk. Without this, Render restarts/deploys can wipe demo JSON orders.
- `RAZORPAY_KEY_ID`: Razorpay test or live Key ID for online payments.
- `RAZORPAY_KEY_SECRET`: Razorpay test or live Key Secret for server-side order creation and signature verification.
- `PAYMENT_CURRENCY`: keep `INR` for Indian payments.
- `PORT`: hosting providers usually set this automatically.

Admin login is disabled on production until `ADMIN_PASSWORD` is set in Render. This prevents the local demo password from working on the live website.
Online payment remains disabled until the two Razorpay keys are set in Render.
Orders and admin-created products are stored in JSON files. On Render, use a persistent disk mounted at `/var/data` and set `DATA_DIR=/var/data`, or move the app to Postgres before taking real orders.

## Live commands

- Build command: leave blank or `npm install`
- Start command: `npm start`

## Render quick deploy

1. Upload this folder to GitHub.
2. Create a Render Web Service from that GitHub repo.
3. Render can read `render.yaml` automatically.
4. Set `ADMIN_PASSWORD` in Render environment variables.
5. Deploy and open the generated HTTPS URL.
6. Open `/admin.html`, log in with your Render `ADMIN_PASSWORD`, and place one test order from the storefront.
7. To enable online payment, add Razorpay test keys in Render, test checkout, then replace them with live keys from the Razorpay dashboard.

## Launch smoke test

1. Add one product to cart.
2. Checkout with name, 10 digit mobile number, address, and payment mode.
3. Copy the order ID from the checkout success message.
4. Open `track-order.html` and search by order ID or mobile number.
5. Open `admin.html` and confirm the order appears in Orders.
6. For Razorpay, choose "Pay online now", complete a test payment, and confirm the order status becomes `Paid - callback pending`.

## Important

This launch build uses JSON files in `data/` for products and orders. It is enough for a quick first live demo. For heavy real traffic, move products and orders to SQLite/Postgres next.
