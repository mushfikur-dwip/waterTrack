# Water Tracking Telegram Bot + Web Portal — Task List

## Project Goal
Build a Telegram bot that reminds users to drink water at a custom interval and records their responses. A web portal will show daily progress, history, settings, and reports.

---

## 1. MVP Scope

### Must-have Features
- Telegram bot start flow
- User registration from Telegram
- Daily water target setup
- Reminder interval setup: custom minutes, minimum 1 minute
- Active reminder time setup, example: 8:00 AM – 10:00 PM
- Reminder message with buttons
- Water intake log from button click
- Basic web dashboard
- Today’s progress view
- Reminder pause/resume

### Not in MVP
- AI suggestion
- Payment system
- Advanced health recommendation
- Mobile app
- Corporate dashboard

---

## 2. Tech Stack

### Frontend
- Next.js
- Tailwind CSS
- Recharts for charts

### Backend
- Node.js
- Express.js or NestJS
- Telegram bot library: Telegraf.js or grammY

### Database
- PostgreSQL
- Prisma ORM

### Scheduler
- MVP: node-cron
- Scalable version: BullMQ + Redis

### Hosting
- Frontend: Vercel
- Backend: Railway / Render / VPS
- Database: Supabase / Neon / Railway PostgreSQL

---

## 3. Database Tasks

### Create Tables

#### users
- id
- telegram_id
- first_name
- username
- timezone
- daily_target_ml
- reminder_interval_minutes
- active_start_time
- active_end_time
- reminder_enabled
- created_at
- updated_at

#### water_logs
- id
- user_id
- amount_ml
- source: telegram / web
- created_at

#### reminders
- id
- user_id
- scheduled_at
- sent_at
- status: sent / drank / skipped / missed / snoozed
- created_at

#### user_settings
- id
- user_id
- default_drink_amount_ml
- snooze_minutes
- weekly_report_enabled
- created_at
- updated_at

---

## 4. Telegram Bot Tasks

### Bot Setup
- [ ] Create bot using BotFather
- [ ] Save bot token in `.env`
- [x] Connect bot with backend server
- [x] Add webhook or polling system

### Commands
- [x] `/start` — register user
- [x] `/settarget` — set daily water target
- [x] `/setinterval` — set reminder interval
- [x] `/today` — show today’s progress
- [x] `/pause` — pause reminders
- [x] `/resume` — resume reminders
- [x] `/settings` — show/change settings

### Start Flow
- [x] Welcome message
- [ ] Ask daily target: 2000ml / 2500ml / 3000ml / custom
- [x] Ask reminder interval: custom minutes, minimum 1 minute
- [x] Ask active time: default 8 AM – 10 PM
- [x] Save user settings
- [x] Confirm setup complete

### Reminder Message
Example:

```txt
পানি খেয়েছেন?
আজকের Target: 2500ml
এখন পর্যন্ত: 750ml
```

Buttons:
- [x] ✅ খেয়েছি 250ml
- [x] ✅ খেয়েছি 500ml
- [x] 😴 Snooze 10 min
- [x] ❌ Skip

### Callback Actions
- [x] If user clicks 250ml, save 250ml log
- [x] If user clicks 500ml, save 500ml log
- [x] If user clicks Snooze, schedule reminder after 10 minutes
- [x] If user clicks Skip, mark reminder as skipped
- [x] Send updated daily progress after click

---

## 5. Reminder Scheduler Tasks

### MVP Logic
Run scheduler every 1 minute.

Check:
- [x] User reminder is enabled
- [x] Current time is inside active window
- [x] Daily target is not completed
- [x] Last reminder interval has passed
- [x] User has no active snooze

Then:
- [x] Send Telegram reminder
- [x] Save reminder record

### Advanced Logic Later
- [ ] Avoid reminder if user recently logged water manually
- [ ] Send softer message if user skipped many times
- [ ] Stop reminder when target completed
- [ ] Weekly report every Sunday night

---

## 6. Web Portal Tasks

### Pages
- [x] Login page
- [x] Dashboard page
- [x] History page
- [x] Settings page
- [x] Reports page

### Dashboard Features
- [x] Today’s water progress
- [x] Target vs consumed chart
- [x] Remaining water amount
- [x] Last drink time
- [x] Next reminder time
- [ ] Streak count

### Settings Features
- [x] Change daily target
- [x] Change reminder interval
- [x] Change active time
- [x] Enable/disable reminder
- [x] Change default drink amount

### History Features
- [x] Daily log list
- [x] Weekly summary
- [x] Monthly summary
- [ ] Filter by date

---

## 7. API Tasks

### Auth APIs
- [x] POST `/api/auth/telegram`
- [x] GET `/api/me`

### User APIs
- [x] GET `/api/user/settings`
- [x] PATCH `/api/user/settings`

### Water Log APIs
- [x] POST `/api/water-log`
- [x] GET `/api/water-log/today`
- [x] GET `/api/water-log/history`

### Reminder APIs
- [x] GET `/api/reminders`
- [x] PATCH `/api/reminders/pause`
- [x] PATCH `/api/reminders/resume`

---

## 8. UI/UX Tasks

### Web Dashboard Design
- [x] Clean minimal layout
- [x] Water progress circular chart
- [x] Quick log buttons: 250ml / 500ml
- [x] Mobile responsive design
- [x] Bengali + English mixed labels

### Telegram Message Style
- [x] Short messages
- [x] Friendly tone
- [ ] Emoji use but not too much
- [ ] Avoid guilt-based message

Good message examples:

```txt
💧 একটু পানি খাওয়ার সময় হয়েছে!
আজ এখন পর্যন্ত: 750ml / 2500ml
```

```txt
ভালো করেছেন ✅
আর বাকি আছে: 1250ml
```

---

## 9. Testing Tasks

### Bot Testing
- [ ] `/start` works
- [ ] User setting saves correctly
- [ ] Reminder sends on time
- [ ] 250ml button logs correctly
- [ ] 500ml button logs correctly
- [ ] Snooze works
- [ ] Skip works
- [ ] Pause/resume works

### Web Testing
- [ ] Dashboard data matches Telegram logs
- [ ] Settings update works
- [ ] History loads correctly
- [ ] Mobile view works

### Edge Cases
- [ ] User blocks bot
- [ ] User changes timezone
- [ ] Server restarts
- [ ] Duplicate reminder prevention
- [ ] Target completed before next reminder

---

## 10. Deployment Tasks

### Environment Variables
Create `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/db"
TELEGRAM_BOT_TOKEN="your_bot_token"
APP_URL="https://your-domain.com"
WEBHOOK_URL="https://your-domain.com/api/telegram/webhook"
JWT_SECRET="your_secret"
```

### Deployment Checklist
- [ ] Database deployed
- [ ] Prisma migration completed
- [ ] Backend deployed
- [ ] Telegram webhook set
- [ ] Frontend deployed
- [ ] Domain connected
- [ ] SSL active
- [ ] Test with real Telegram account

---

## 11. Development Timeline

### Day 1
- Project setup
- Database schema
- Telegram bot connection

### Day 2
- `/start` flow
- User settings save
- Basic water log

### Day 3
- Reminder scheduler
- Reminder buttons
- Snooze/skip system

### Day 4
- Web dashboard setup
- Today progress API
- Basic charts

### Day 5
- Settings page
- History page
- Bug fixing

### Day 6
- Deployment
- Real user testing

### Day 7
- Polish UI
- Improve messages
- Add weekly summary

---

## 12. Future Features

- Telegram Mini App
- Weekly/monthly PDF report
- AI hydration suggestion
- Weight-based target calculation
- Weather-based reminder adjustment
- Subscription/payment system
- Family/group challenge
- Corporate wellness dashboard

---

## 13. Success Metrics

Track these numbers:
- Daily active users
- Reminder response rate
- Average daily water logged
- Target completion rate
- User retention after 7 days
- Bot block/mute rate

---

## 14. Final MVP Output

At the end of MVP, user should be able to:

1. Start the Telegram bot
2. Set daily water target
3. Choose reminder interval
4. Receive reminder automatically
5. Log water using button
6. See today’s progress in bot
7. See dashboard in web portal
8. Change settings anytime
