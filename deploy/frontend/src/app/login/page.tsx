"use client";

import { useEffect, useRef, useState } from "react";
import { LogIn, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../components/api";
import { AppShell } from "../../components/AppShell";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const isDevelopment = process.env.NODE_ENV !== "production";

  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      try {
        setError("");
        const response = await api<{ user: { telegramId: string } }>("/api/auth/telegram", {
          method: "POST",
          body: JSON.stringify(user)
        });
        localStorage.setItem("watertrack.telegramId", response.user.telegramId);
        router.push("/dashboard");
      } catch {
        setError("Telegram login verify হয়নি। Bot username/token ঠিক আছে কিনা check করুন।");
      }
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [router]);

  useEffect(() => {
    if (!botUsername || !widgetRef.current) return;

    widgetRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    widgetRef.current.appendChild(script);
  }, [botUsername]);

  async function devLogin(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      const response = await api<{ user: { telegramId: string } }>("/api/auth/telegram", {
        method: "POST",
        body: JSON.stringify({ telegramId, firstName: "Local Dev User" })
      });
      localStorage.setItem("watertrack.telegramId", response.user.telegramId);
      router.push("/dashboard");
    } catch {
      setError("Local login failed. Backend/database check করুন।");
    }
  }

  return (
    <AppShell>
      <div className="max-w-xl rounded border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Telegram দিয়ে secure login করুন।</p>
        {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
          {botUsername ? (
            <div ref={widgetRef} className="min-h-10" />
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-700">
              <MessageCircle size={17} /> NEXT_PUBLIC_TELEGRAM_BOT_USERNAME সেট করুন।
            </div>
          )}
        </div>
        {isDevelopment && (
          <form onSubmit={devLogin} className="mt-5 border-t border-slate-200 pt-5">
            <label className="block">
              <span className="text-sm font-medium">Local dev Telegram ID</span>
              <input
                value={telegramId}
                onChange={(event) => setTelegramId(event.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                placeholder="1625088895"
                required
              />
            </label>
            <button className="mt-3 inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white">
              <LogIn size={17} /> Continue
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string | number>) => void;
  }
}
