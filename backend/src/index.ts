import "dotenv/config";
import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { createBot } from "./bot/index.js";
import { startReminderScheduler } from "./scheduler.js";
import { authRouter } from "./routes/auth.js";
import { userRouter } from "./routes/user.js";
import { waterRouter } from "./routes/water.js";
import { remindersRouter } from "./routes/reminders.js";

const app = express();
const bot = createBot();
const allowedOrigins = new Set([
  process.env.WEB_APP_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001"
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api", authRouter);
app.use("/api/user", userRouter);
app.use("/api/water-log", waterRouter);
app.use("/api/reminders", remindersRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Invalid request", details: error.flatten() });
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  return res.status(500).json({ error: message });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, async () => {
  if (bot && process.env.BOT_MODE !== "webhook") {
    await bot.launch();
    startReminderScheduler(bot);
  }
  console.log(`Backend running on http://localhost:${port}`);
});

process.once("SIGINT", () => bot?.stop("SIGINT"));
process.once("SIGTERM", () => bot?.stop("SIGTERM"));
