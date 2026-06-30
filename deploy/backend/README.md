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
PORT="4000"
```

The backend exposes `POST /telegram/webhook` for Telegram webhook mode.
