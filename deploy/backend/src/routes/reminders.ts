import { Router } from "express";
import { z } from "zod";
import { getReminderList, pauseReminders, resumeReminders } from "../services/reminders.js";

export const remindersRouter = Router();

remindersRouter.get("/", async (req, res, next) => {
  try {
    const telegramId = String(req.query.telegramId ?? "");
    const reminders = await getReminderList(telegramId);
    res.json({ reminders });
  } catch (error) {
    next(error);
  }
});

remindersRouter.patch("/pause", async (req, res, next) => {
  try {
    const { telegramId } = z.object({ telegramId: z.string().min(1) }).parse(req.body);
    const user = await pauseReminders(telegramId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

remindersRouter.patch("/resume", async (req, res, next) => {
  try {
    const { telegramId } = z.object({ telegramId: z.string().min(1) }).parse(req.body);
    const user = await resumeReminders(telegramId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
