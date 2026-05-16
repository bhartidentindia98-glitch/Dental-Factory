# Dental Factory Live Setup

## Run locally

```bash
npm start
```

Open `http://127.0.0.1:5173/`.

## Required live environment variables

- `ADMIN_PASSWORD`: set your private admin password.
- `SESSION_SECRET`: set any long random text for admin login cookies.
- `PORT`: hosting providers usually set this automatically.

## Live commands

- Build command: leave blank or `npm install`
- Start command: `npm start`

## Render quick deploy

1. Upload this folder to GitHub.
2. Create a Render Web Service from that GitHub repo.
3. Render can read `render.yaml` automatically.
4. Set `ADMIN_PASSWORD` in Render environment variables.
5. Deploy and open the generated HTTPS URL.

## Important

This launch build uses JSON files in `data/` for products and orders. It is enough for a quick first live demo. For heavy real traffic, move products and orders to SQLite/Postgres next.
