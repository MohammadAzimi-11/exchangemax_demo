# Exchange Desk Frontend Demo

A simple static frontend demo for an exchange office dashboard.

This repository is prepared for a public live demo on GitHub, Vercel, Netlify, or any static hosting provider. It does not require the original local backend because demo mode uses an in-browser mock API and English fake data.

## What This Demo Includes

- React + Vite frontend
- English as the default language
- Fake demo users, roles, customers, reports, and dashboard data
- Static mock API enabled by default
- Clean navigation focused on the first two usable sections:
  - Dashboard
  - Setup
- Accounting and Administration are kept as main navigation buttons only. They do not show detailed demo pages.

## Demo Login

Use this account in demo mode:

```text
Username: demo.admin
Password: any non-empty value
```

## Important Notes

This is not a production banking or exchange system.

- No real money movement is created.
- No real backend request is required in demo mode.
- All data is fake and stored only for the browser demo session.
- The app is intended to show the UI structure and basic workflow only.

## Local Development

```bash
npm install
npm run dev
```

The Vite dev server will print a local URL, usually:

```text
http://127.0.0.1:5173/
```

## Production Build

```bash
npm run build
```

The static output is generated in:

```text
dist
```

## Static Deployment

Use these settings on a static hosting service:

```text
Build command: npm run build
Output directory: dist
```

Demo mode is enabled by default for static deployments, so a public demo does not need a committed `.env.production` file.

## Environment Variables

```text
VITE_DEMO_MODE=true
```

When `VITE_DEMO_MODE` is missing or set to `true`, the app uses `src/utils/demoApi.js` instead of a real backend.

For a real backend deployment later, set:

```text
VITE_DEMO_MODE=false
VITE_API_BASE_URL=https://your-api-domain.example
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
