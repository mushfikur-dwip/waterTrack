import { Router } from "express";
import { z } from "zod";
import { getUserByTelegramId, updateUserSettings } from "../services/users.js";

export const userRouter = Router();

const settingsSchema = z.object({
  telegramId: z.string().min(1),
  dailyTargetMl: z.number().int().min(500).optional(),
  reminderIntervalMinutes: z.union([z.literal(15), z.literal(30), z.literal(60)]).optional(),
  activeStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  activeEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reminderEnabled: z.boolean().optional(),
  defaultDrinkAmountMl: z.number().int().min(50).optional(),
  snoozeMinutes: z.number().int().min(1).optional(),
  weeklyReportEnabled: z.boolean().optional()
});

userRouter.get("/settings", async (req, res, next) => {
  try {
    const telegramId = String(req.query.telegramId ?? "");
    const user = await getUserByTelegramId(telegramId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/settings", async (req, res, next) => {
  try {
    const { telegramId, ...data } = settingsSchema.parse(req.body);
    const user = await updateUserSettings(telegramId, data);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
