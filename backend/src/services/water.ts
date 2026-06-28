import { prisma } from "../lib/prisma.js";
import { endOfLocalDay, localDateKey, startOfLocalDay } from "./time.js";
import { registerTelegramUser } from "./users.js";

export async function addWaterLog(telegramId: string, amountMl: number, source: "telegram" | "web") {
  const user = await registerTelegramUser({ telegramId });
  await prisma.waterLog.create({
    data: {
      userId: user.id,
      amountMl,
      source
    }
  });
  return getTodayProgress(telegramId);
}

export async function getTodayProgress(telegramId: string) {
  const user = await registerTelegramUser({ telegramId });
  const dayStart = startOfLocalDay(new Date(), user.timezone);
  const dayEnd = endOfLocalDay(new Date(), user.timezone);
  const logs = await prisma.waterLog.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: dayStart,
        lte: dayEnd
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const consumedMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

  return {
    user,
    logs,
    consumedMl,
    targetMl: user.dailyTargetMl,
    remainingMl: Math.max(user.dailyTargetMl - consumedMl, 0),
    percent: Math.min(Math.round((consumedMl / user.dailyTargetMl) * 100), 100),
    lastDrinkAt: logs[0]?.createdAt ?? null,
    streakCount: await getStreakCount(user.id, user.dailyTargetMl, user.timezone)
  };
}

export async function getWaterHistory(telegramId: string, days = 30) {
  const user = await registerTelegramUser({ telegramId });
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.waterLog.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" }
  });

  const daily = new Map<string, number>();
  for (const log of logs) {
    const key = localDateKey(log.createdAt, user.timezone);
    daily.set(key, (daily.get(key) ?? 0) + log.amountMl);
  }

  return {
    logs,
    summary: Array.from(daily.entries()).map(([date, amountMl]) => ({ date, amountMl }))
  };
}

async function getStreakCount(userId: string, dailyTargetMl: number, timeZone: string) {
  const since = new Date();
  since.setDate(since.getDate() - 120);
  const logs = await prisma.waterLog.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" }
  });
  const totals = new Map<string, number>();
  for (const log of logs) {
    const key = localDateKey(log.createdAt, timeZone);
    totals.set(key, (totals.get(key) ?? 0) + log.amountMl);
  }

  let streak = 0;
  const cursor = new Date();
  while (streak < 120) {
    const key = localDateKey(cursor, timeZone);
    if ((totals.get(key) ?? 0) < dailyTargetMl) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
