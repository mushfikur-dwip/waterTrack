import cron from "node-cron";
import type { Telegraf } from "telegraf";
import { createSentReminder, getUsersDueForReminder } from "./services/reminders.js";
import { progressText } from "./bot/messages.js";
import { reminderButtons } from "./bot/index.js";

export function startReminderScheduler(bot: Telegraf | null) {
  if (!bot) return;

  cron.schedule("* * * * *", async () => {
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
  });
}
