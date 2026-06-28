import { prisma } from "../lib/prisma.js";

type TelegramProfile = {
  telegramId: string;
  firstName?: string;
  username?: string;
};

export async function registerTelegramUser(profile: TelegramProfile) {
  return prisma.user.upsert({
    where: { telegramId: profile.telegramId },
    create: {
      telegramId: profile.telegramId,
      firstName: profile.firstName,
      username: profile.username,
      settings: { create: {} }
    },
    update: {
      firstName: profile.firstName,
      username: profile.username
    },
    include: { settings: true }
  });
}

export async function getUserByTelegramId(telegramId: string) {
  return prisma.user.findUnique({
    where: { telegramId },
    include: { settings: true }
  });
}

export async function updateUserSettings(telegramId: string, data: {
  dailyTargetMl?: number;
  reminderIntervalMinutes?: number;
  activeStartTime?: string;
  activeEndTime?: string;
  reminderEnabled?: boolean;
  defaultDrinkAmountMl?: number;
  snoozeMinutes?: number;
  weeklyReportEnabled?: boolean;
}) {
  const user = await prisma.user.update({
    where: { telegramId },
    data: {
      dailyTargetMl: data.dailyTargetMl,
      reminderIntervalMinutes: data.reminderIntervalMinutes,
      activeStartTime: data.activeStartTime,
      activeEndTime: data.activeEndTime,
      reminderEnabled: data.reminderEnabled,
      settings: {
        upsert: {
          create: {
            defaultDrinkAmountMl: data.defaultDrinkAmountMl,
            snoozeMinutes: data.snoozeMinutes,
            weeklyReportEnabled: data.weeklyReportEnabled
          },
          update: {
            defaultDrinkAmountMl: data.defaultDrinkAmountMl,
            snoozeMinutes: data.snoozeMinutes,
            weeklyReportEnabled: data.weeklyReportEnabled
          }
        }
      }
    },
    include: { settings: true }
  });

  return user;
}
