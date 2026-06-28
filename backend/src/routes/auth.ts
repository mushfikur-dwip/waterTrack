import { Router } from "express";
import { z } from "zod";
import { getUserByTelegramId, registerTelegramUser } from "../services/users.js";

export const authRouter = Router();

const authSchema = z.object({
  telegramId: z.string().min(1),
  firstName: z.string().optional(),
  username: z.string().optional()
});

authRouter.post("/telegram", async (req, res, next) => {
  try {
    const body = authSchema.parse(req.body);
    const user = await registerTelegramUser(body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", async (req, res, next) => {
  try {
    const telegramId = String(req.query.telegramId ?? "");
    const user = await getUserByTelegramId(telegramId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
