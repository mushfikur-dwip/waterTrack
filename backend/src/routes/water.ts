import { Router } from "express";
import { z } from "zod";
import { addWaterLog, getTodayProgress, getWaterHistory } from "../services/water.js";

export const waterRouter = Router();

waterRouter.post("/", async (req, res, next) => {
  try {
    const body = z.object({
      telegramId: z.string().min(1),
      amountMl: z.number().int().min(50)
    }).parse(req.body);
    const progress = await addWaterLog(body.telegramId, body.amountMl, "web");
    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
});

waterRouter.get("/today", async (req, res, next) => {
  try {
    const telegramId = String(req.query.telegramId ?? "");
    const progress = await getTodayProgress(telegramId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

waterRouter.get("/history", async (req, res, next) => {
  try {
    const telegramId = String(req.query.telegramId ?? "");
    const days = Number(req.query.days ?? 30);
    const history = await getWaterHistory(telegramId, days);
    res.json(history);
  } catch (error) {
    next(error);
  }
});
