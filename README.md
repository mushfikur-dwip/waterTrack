# WaterTrack

Telegram water reminder bot with an Express API, Prisma/PostgreSQL database, and Next.js web portal.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment values:

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` and `TELEGRAM_BOT_TOKEN` in `.env`.

4. Create database tables:

```bash
npm run prisma:migrate
```

5. Run the app:

```bash
npm run dev
```

Backend runs on `http://localhost:4000`. Frontend runs on `http://localhost:3000`.

## Start From Scratch

Use this when the app has duplicate servers, port mismatch, or `.next` cache errors.

1. Stop existing dev servers:

```bash
pkill -f "next dev" || true
pkill -f "tsx watch" || true
pkill -f "npm-run-all" || true
```

2. Clean the Next.js cache:

```bash
rm -rf frontend/.next
```

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Create/update database tables:

```bash
npm run prisma:migrate
```

6. Start backend and frontend together:

```bash
npm run dev
```

Open the frontend URL shown by Next.js. Usually it is `http://localhost:3000`. If port `3000` is busy, Next.js may use `http://localhost:3001`; the backend allows both.

## Useful Commands

```bash
npm run prisma:generate
npm --workspace backend run build
npm --workspace frontend run build
```

## Vercel Frontend Deploy

If deploying only the frontend from this repository, use these Vercel settings:

```txt
Root Directory: frontend
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
```

Add these Vercel environment variables:

```env
NEXT_PUBLIC_API_BASE="https://api.yourdomain.com"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="your_bot_username"
```

Do not load the root `.env` from `frontend/next.config.ts`; Vercel injects frontend environment variables from its dashboard.

## Notes

- The bot uses polling by default with `BOT_MODE=polling`.
- Production should use `BOT_MODE=webhook` with an HTTPS `BACKEND_PUBLIC_URL`.
- The web portal uses Telegram Login Widget. Set `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`.
- The web portal stores the verified Telegram ID in browser local storage.
- Reminder scheduling uses a PostgreSQL advisory lock to avoid duplicate reminder ticks across instances.

## Production Bot Mode

For a Node.js server with HTTPS:

```bash
BOT_MODE=webhook
BACKEND_PUBLIC_URL="https://api.yourdomain.com"
WEB_APP_URL="https://yourdomain.com"
TELEGRAM_WEBHOOK_SECRET="generate-a-long-random-string"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="your_bot_username"
```

The backend exposes:

```txt
POST /telegram/webhook
```

In local development, keep:

```bash
BOT_MODE=polling
BACKEND_PUBLIC_URL="http://localhost:4000"
WEB_APP_URL="http://localhost:3000"
```
