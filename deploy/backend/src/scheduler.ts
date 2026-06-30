import cron from "node-cron";
import type { Telegraf } from "telegraf";
import { createSentReminder, getUsersDueForReminder } from "./services/reminders.js";
import { progressText } from "./bot/messages.js";
import { reminderButtons } from "./bot/index.js";
import { prisma } from "./lib/prisma.js";

const SCHEDULER_LOCK_ID = 2026062801;
let tickRunning = false;

export function startReminderScheduler(bot: Telegraf | null) {
  if (!bot) return;

  cron.schedule("* * * * *", async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await prisma.$transaction(async (tx) => {
        const [lock] = await tx.$queryRaw<Array<{ locked: boolean }>>`SELECT pg_try_advisory_xact_lock(${SCHEDULER_LOCK_ID}) AS locked`;
        if (!lock?.locked) return;

        await runReminderTick(bot);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown scheduler error";
      console.error(`Reminder scheduler tick failed: ${message}`);
    } finally {
      tickRunning = false;
    }
  });
}

async function runReminderTick(bot: Telegraf) {
    const dueUsers = await getUsersDueForReminder();
    for (const item of dueUsers) {
      if (!/^\d+$/.test(item.user.telegramId)) {
        console.warn(`Skipping reminder for non-Telegram chat id: ${item.user.telegramId}`);
        continue;
      }

      try {
        const reminder = await createSentReminder(item.user.id);
        await bot.telegram.sendMessage(
          item.user.telegramId,
          progressText(item.progress),
          reminderButtons(reminder.id)
        );
        console.log(`Reminder sent to ${item.user.telegramId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown reminder send error";
        console.error(`Reminder failed for ${item.user.telegramId}: ${message}`);
      }
    }
}
