# GeoWeb3 DApp — Restored No-Esri Metadata Production MVP

This is a rebuilt package intended to preserve the original uploaded app's feature scope while adding the latest requirement: users submit geospatial service metadata outside the Esri environment.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

## Build for Vercel

Root Directory: `frontend`
Build Command: `npm run build`
Output Directory: `dist`

The included `frontend/vercel.json` prevents 404 errors for dashboard routes by rewriting all routes to `index.html`.

## Backend scaffold

```bash
cd backend
cp .env.example .env
npm install
npm start
```

## Key routes

- `GET /api/health`
- `POST /api/metadata/validate`
- `POST /api/metadata/register`
- `POST /api/service/inspect`
- `POST /api/osm/rewards/submit`
- `POST /api/faucet/claim`
- `POST /api/dao/proposals`
