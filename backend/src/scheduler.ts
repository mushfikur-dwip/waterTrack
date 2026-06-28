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
      const reminder = await createSentReminder(item.user.id);
      await bot.telegram.sendMessage(
        item.user.telegramId,
        progressText(item.progress),
        reminderButtons(reminder.id)
      );
    }
  });
}
