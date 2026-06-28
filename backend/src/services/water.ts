import { prisma } from "../lib/prisma.js";
import { endOfLocalDay, startOfLocalDay } from "./time.js";
import { registerTelegramUser } from "./users.js";

export async function addWaterLog(telegramId: string, amountMl: number, source: "telegram" | "web") {
  const user = await registerTelegramUser({ telegramId, firstName: source === "web" ? "Web User" : undefined });
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
  const user = await registerTelegramUser({ telegramId, firstName: "Web User" });
  const logs = await prisma.waterLog.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: startOfLocalDay(),
        lte: endOfLocalDay()
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
    lastDrinkAt: logs[0]?.createdAt ?? null
  };
}

export async function getWaterHistory(telegramId: string, days = 30) {
  const user = await registerTelegramUser({ telegramId, firstName: "Web User" });
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.waterLog.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" }
  });

  const daily = new Map<string, number>();
  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    daily.set(key, (daily.get(key) ?? 0) + log.amountMl);
  }

  return {
    logs,
    summary: Array.from(daily.entries()).map(([date, amountMl]) => ({ date, amountMl }))
  };
}
