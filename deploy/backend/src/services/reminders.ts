import { prisma } from "../lib/prisma.js";
import { isInsideActiveWindow, startOfLocalDay } from "./time.js";
import { getTodayProgress } from "./water.js";

export async function pauseReminders(telegramId: string) {
  return prisma.user.update({ where: { telegramId }, data: { reminderEnabled: false } });
}

export async function resumeReminders(telegramId: string) {
  return prisma.user.update({ where: { telegramId }, data: { reminderEnabled: true } });
}

export async function getReminderList(telegramId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { telegramId } });
  return prisma.reminder.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "desc" },
    take: 30
  });
}

export async function snoozeReminder(reminderId: string, minutes: number) {
  const reminder = await prisma.reminder.update({
    where: { id: reminderId },
    data: { status: "snoozed" }
  });
  return prisma.reminder.create({
    data: {
      userId: reminder.userId,
      scheduledAt: new Date(Date.now() + minutes * 60 * 1000),
      status: "sent"
    }
  });
}

export async function markReminderSkipped(reminderId: string) {
  return prisma.reminder.update({
    where: { id: reminderId },
    data: { status: "skipped" }
  });
}

export async function markReminderDrank(reminderId: string) {
  return prisma.reminder.update({
    where: { id: reminderId },
    data: { status: "drank" }
  });
}

export async function getUsersDueForReminder(now = new Date()) {
  const users = await prisma.user.findMany({
    where: { reminderEnabled: true },
    include: {
      settings: true,
      reminders: { orderBy: { scheduledAt: "desc" }, take: 1 }
    }
  });

  const due = [];
  for (const user of users) {
    if (!isInsideActiveWindow(now, user.activeStartTime, user.activeEndTime, user.timezone)) continue;

    const progress = await getTodayProgress(user.telegramId);
    if (progress.remainingMl <= 0) continue;

    const lastReminder = user.reminders[0];
    const intervalMs = user.reminderIntervalMinutes * 60 * 1000;
    const intervalPassed = !lastReminder || now.getTime() - lastReminder.scheduledAt.getTime() >= intervalMs;
    const snoozed = await prisma.reminder.findFirst({
      where: {
        userId: user.id,
        status: "snoozed",
        scheduledAt: { gte: startOfLocalDay(now, user.timezone) }
      },
      orderBy: { scheduledAt: "desc" }
    });
    const snoozeActive = snoozed && now.getTime() - snoozed.scheduledAt.getTime() < (user.settings?.snoozeMinutes ?? 10) * 60 * 1000;

    if (intervalPassed && !snoozeActive) due.push({ user, progress });
  }

  return due;
}

export async function createSentReminder(userId: string) {
  return prisma.reminder.create({
    data: {
      userId,
      scheduledAt: new Date(),
      sentAt: new Date(),
      status: "sent"
    }
  });
}
