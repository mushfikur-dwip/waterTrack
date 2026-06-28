import { Telegraf, Markup } from "telegraf";
import { addWaterLog, getTodayProgress } from "../services/water.js";
import { registerTelegramUser, updateUserSettings } from "../services/users.js";
import {
  markReminderDrank,
  markReminderSkipped,
  pauseReminders,
  resumeReminders,
  snoozeReminder
} from "../services/reminders.js";
import { progressText, setupText } from "./messages.js";

export function createBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    await registerTelegramUser({
      telegramId: String(ctx.from.id),
      firstName: ctx.from.first_name,
      username: ctx.from.username
    });
    await ctx.reply(setupText());
  });

  bot.command("settarget", async (ctx) => {
    const amount = Number(ctx.message.text.split(" ")[1]);
    if (!amount || amount < 500) return ctx.reply("ব্যবহার করুন: /settarget 2500");
    await updateUserSettings(String(ctx.from.id), { dailyTargetMl: amount });
    return ctx.reply(`Daily target ${amount}ml করা হয়েছে।`);
  });

  bot.command("setinterval", async (ctx) => {
    const minutes = Number(ctx.message.text.split(" ")[1]);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      return ctx.reply("ব্যবহার করুন: /setinterval 1\nInterval 1 থেকে 1440 মিনিটের মধ্যে হতে হবে।");
    }
    await updateUserSettings(String(ctx.from.id), { reminderIntervalMinutes: minutes });
    return ctx.reply(`Reminder interval ${minutes} মিনিট করা হয়েছে।`);
  });

  bot.command("today", async (ctx) => {
    const progress = await getTodayProgress(String(ctx.from.id));
    return ctx.reply(progressText(progress));
  });

  bot.command("pause", async (ctx) => {
    await pauseReminders(String(ctx.from.id));
    return ctx.reply("Reminders pause করা হয়েছে।");
  });

  bot.command("resume", async (ctx) => {
    await resumeReminders(String(ctx.from.id));
    return ctx.reply("Reminders resume করা হয়েছে।");
  });

  bot.command("settings", async (ctx) => {
    const progress = await getTodayProgress(String(ctx.from.id));
    const user = progress.user;
    return ctx.reply([
      `Target: ${user.dailyTargetMl}ml`,
      `Interval: ${user.reminderIntervalMinutes} minutes`,
      `Active: ${user.activeStartTime} - ${user.activeEndTime}`,
      `Reminder: ${user.reminderEnabled ? "On" : "Off"}`
    ].join("\n"));
  });

  bot.action(/^drink:(250|500):(.+)$/, async (ctx) => {
    const amount = Number(ctx.match[1]);
    const reminderId = ctx.match[2];
    await addWaterLog(String(ctx.from.id), amount, "telegram");
    await markReminderDrank(reminderId);
    const progress = await getTodayProgress(String(ctx.from.id));
    await ctx.answerCbQuery(`${amount}ml saved`);
    return ctx.editMessageText(progressText(progress));
  });

  bot.action(/^snooze:(.+)$/, async (ctx) => {
    await snoozeReminder(ctx.match[1], 10);
    await ctx.answerCbQuery("Snoozed");
    return ctx.editMessageText("১০ মিনিট পরে আবার reminder যাবে।");
  });

  bot.action(/^skip:(.+)$/, async (ctx) => {
    await markReminderSkipped(ctx.match[1]);
    await ctx.answerCbQuery("Skipped");
    return ctx.editMessageText("আজকের reminder skip করা হয়েছে।");
  });

  return bot;
}

export function reminderButtons(reminderId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ খেয়েছি 250ml", `drink:250:${reminderId}`)],
    [Markup.button.callback("✅ খেয়েছি 500ml", `drink:500:${reminderId}`)],
    [
      Markup.button.callback("😴 Snooze 10 min", `snooze:${reminderId}`),
      Markup.button.callback("❌ Skip", `skip:${reminderId}`)
    ]
  ]);
}
