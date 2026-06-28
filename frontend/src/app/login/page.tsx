"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../components/api";
import { AppShell } from "../../components/AppShell";

export default function LoginPage() {
  const [telegramId, setTelegramId] = useState("");
  const router = useRouter();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    localStorage.setItem("watertrack.telegramId", telegramId);
    await api("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ telegramId, firstName: "Web User" })
    });
    router.push("/dashboard");
  }

  return (
    <AppShell>
      <div className="max-w-xl rounded border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Telegram ID দিয়ে web portal চালু করুন।</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Telegram ID</span>
            <input
              value={telegramId}
              onChange={(event) => setTelegramId(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="123456789"
              required
            />
          </label>
          <button className="inline-flex items-center gap-2 rounded bg-water px-4 py-2 text-sm font-semibold text-white">
            <LogIn size={17} /> Continue
          </button>
        </form>
      </div>
    </AppShell>
  );
}
