# Frontend — Student Learning Portal

Standalone React (Vite) + Tailwind app. Deploy this folder on its own (Vercel, Netlify, Cloudflare Pages, etc.).

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

Requires the backend running separately on port 5000 (or update `VITE_API_URL`).

## Required env

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` (local) |
| | `https://your-api.onrender.com/api` (production) |

Set `VITE_API_URL` at **build time** on your frontend host.

## Production notes

1. Deploy only this `frontend` folder.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Point `VITE_API_URL` at your deployed backend `/api`.
5. On the backend, set `CLIENT_URL` to this frontend’s public URL and `COOKIE_SECURE=true`.
