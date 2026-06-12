# GeoWeb3 Vercel Deployment Fix

This package is configured so it can deploy correctly on Vercel from either the repository root or the `frontend` folder.

## Recommended Vercel settings

Use these settings if your GitHub repository contains the full package with `frontend`, `backend`, `contracts`, `database`, and `docs` folders:

- Root Directory: leave blank / repository root
- Framework Preset: Other or Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `frontend/dist`

The root `vercel.json` already contains these values and includes the SPA rewrite needed to stop `/dashboard`, `/submit-metadata`, `/osm-rewards`, and other internal paths from returning 404.

## Alternative Vercel settings

If you set Vercel's Root Directory to `frontend`, use:

- Root Directory: `frontend`
- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

The `frontend/vercel.json` file also includes a rewrite rule for single-page-app routes.

## Why the earlier deployment could show 404

A 404 on Vercel usually happens when:

1. Vercel is pointed at the wrong folder.
2. The output directory is wrong.
3. A React/Vite single-page app is missing the rewrite back to `index.html`.
4. The repository root build does not install the frontend dependencies.

This package fixes those issues by adding root workspaces, root build settings, and SPA rewrites.
