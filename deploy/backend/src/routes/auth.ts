import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { getUserByTelegramId, registerTelegramUser } from "../services/users.js";

export const authRouter = Router();

const authSchema = z.object({
  telegramId: z.string().min(1),
  firstName: z.string().optional(),
  username: z.string().optional()
});

const telegramLoginSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  first_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.union([z.string(), z.number()]).transform(String),
  hash: z.string()
}).passthrough();

authRouter.post("/telegram", async (req, res, next) => {
  try {
    const body = parseTelegramAuth(req.body);
    const user = await registerTelegramUser(body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

function parseTelegramAuth(payload: unknown) {
  const result = telegramLoginSchema.safeParse(payload);
  if (result.success) {
    verifyTelegramLogin(result.data);
    return {
      telegramId: result.data.id,
      firstName: result.data.first_name,
      username: result.data.username
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return authSchema.parse(payload);
  }

  throw new Error("Telegram login payload is required");
}

function verifyTelegramLogin(data: z.infer<typeof telegramLoginSchema>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");

  const authAgeSeconds = Math.floor(Date.now() / 1000) - Number(data.auth_date);
  if (!Number.isFinite(authAgeSeconds) || authAgeSeconds > 24 * 60 * 60) {
    throw new Error("Telegram login expired");
  }

  const { hash, ...fields } = data;
  const checkString = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(token).digest();
  const expected = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
  const actual = Buffer.from(hash, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (actual.length !== expectedBuffer.length || !crypto.timingSafeEqual(actual, expectedBuffer)) {
    throw new Error("Invalid Telegram login signature");
  }
}

authRouter.get("/me", async (req, res, next) => {
  try {
    const telegramId = String(req.query.telegramId ?? "");
    const user = await getUserByTelegramId(telegramId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
