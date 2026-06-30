# WaterTrack Backend

Deploy this folder to your Node.js server.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run build
npm start
```

## cPanel Node.js Setup

Upload the contents of this folder directly into your cPanel application root.

Correct:

```txt
~/gpt-backend/package.json
~/gpt-backend/src/
~/gpt-backend/prisma/
~/gpt-backend/tsconfig.json
```

Wrong:

```txt
~/gpt-backend/backend/package.json
~/gpt-backend/deploy/backend/package.json
```

cPanel fields:

```txt
Node.js version: 22.x
Application mode: Production
Application root: gpt-backend
Application URL: gpt.antdigitals.com
Application startup file: app.js
```

After upload, run in Terminal:

```bash
cd ~/gpt-backend
npm install
npm run prisma:migrate
npm run build
ls -la dist/index.js app.js
```

Then restart the app from cPanel. Verify:

```txt
https://gpt.antdigitals.com/health
```

Expected response:

```json
{"ok":true}
```

For PM2:

```bash
pm2 start dist/index.js --name watertrack-backend
pm2 save
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
BOT_MODE="webhook"
BACKEND_PUBLIC_URL="https://api.yourdomain.com"
WEB_APP_URL="https://yourdomain.com"
CORS_ORIGINS="https://yourdomain.com"
PORT="4000"
```

For cPanel Node.js apps, do not add `PORT` manually in the UI. cPanel/Passenger manages the runtime port. The app only falls back to `4000` for local development.

The backend exposes `POST /telegram/webhook` for Telegram webhook mode.
