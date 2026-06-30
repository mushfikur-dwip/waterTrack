# WaterTrack Deploy Folders

This directory contains two standalone deploy targets.

## `frontend`

Use this folder for Vercel.

Required environment variables:

```env
NEXT_PUBLIC_API_BASE="https://api.yourdomain.com"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="your_bot_username"
```

## `backend`

Use this folder for a Node.js server.

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
BOT_MODE="webhook"
BACKEND_PUBLIC_URL="https://api.yourdomain.com"
WEB_APP_URL="https://yourdomain.com"
PORT="4000"
```
