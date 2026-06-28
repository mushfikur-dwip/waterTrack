"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Pause, Play, Plus } from "lucide-react";
import { api, getTelegramId } from "../../components/api";
import { AppShell } from "../../components/AppShell";
import { Stat } from "../../components/Stat";
import type { Progress } from "../../components/types";

export default function DashboardPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const telegramId = getTelegramId();
    await api("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ telegramId, firstName: "Web User" })
    });
    const data = await api<Progress>(`/api/water-log/today?telegramId=${telegramId}`);
    setProgress(data);
    setLoading(false);
  }

  async function log(amountMl: number) {
    const data = await api<Progress>("/api/water-log", {
      method: "POST",
      body: JSON.stringify({ telegramId: getTelegramId(), amountMl })
    });
    setProgress(data);
  }

  async function toggleReminder(enabled: boolean) {
    await api(`/api/reminders/${enabled ? "resume" : "pause"}`, {
      method: "PATCH",
      body: JSON.stringify({ telegramId: getTelegramId() })
    });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!progress) return [];
    return [
      { name: "Consumed", value: progress.consumedMl },
      { name: "Remaining", value: progress.remainingMl }
    ];
  }, [progress]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Today&apos;s Progress</h1>
          <p className="text-sm text-slate-500">আজকের পানি intake এবং reminder status</p>
        </div>
        {progress && (
          <button
            onClick={() => toggleReminder(!progress.user.reminderEnabled)}
            className="inline-flex items-center justify-center gap-2 rounded bg-ink px-4 py-2 text-sm font-medium text-white"
          >
            {progress.user.reminderEnabled ? <Pause size={17} /> : <Play size={17} />}
            {progress.user.reminderEnabled ? "Pause" : "Resume"}
          </button>
        )}
      </div>

      {loading || !progress ? (
        <div className="rounded border border-slate-200 bg-white p-6">Loading...</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded border border-slate-200 bg-white p-5">
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} innerRadius={82} outerRadius={112} dataKey="value" startAngle={90} endAngle={450}>
                    <Cell fill="#1c8d9e" />
                    <Cell fill="#dce8e6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="-mt-44 mb-20 text-center">
              <p className="text-4xl font-semibold text-water">{progress.percent}%</p>
              <p className="text-sm text-slate-500">{progress.consumedMl}ml / {progress.targetMl}ml</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Remaining" value={`${progress.remainingMl}ml`} tone="coral" />
              <Stat label="Last drink" value={progress.lastDrinkAt ? new Date(progress.lastDrinkAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "None"} tone="leaf" />
              <Stat label="Next reminder" value={`${progress.user.reminderIntervalMinutes} min`} />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Quick Log</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[250, 500].map((amount) => (
                  <button key={amount} onClick={() => log(amount)} className="inline-flex items-center justify-center gap-2 rounded bg-water px-3 py-3 text-sm font-semibold text-white">
                    <Plus size={16} /> {amount}ml
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Recent Logs</h2>
              <div className="mt-3 space-y-2">
                {progress.logs.slice(0, 6).map((log) => (
                  <div key={log.id} className="flex justify-between rounded bg-slate-50 px-3 py-2 text-sm">
                    <span>{log.amountMl}ml</span>
                    <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
