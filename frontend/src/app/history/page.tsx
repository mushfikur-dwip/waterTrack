"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, getTelegramId } from "../../components/api";
import { AppShell } from "../../components/AppShell";
import type { HistoryResponse } from "../../components/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    api<HistoryResponse>(`/api/water-log/history?telegramId=${getTelegramId()}&days=30`).then(setHistory);
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-slate-500">Daily log list, weekly/monthly trend এবং source tracking.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold">Last 30 Days</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={history?.summary ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amountMl" fill="#1c8d9e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <aside className="rounded border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold">Logs</h2>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
            {(history?.logs ?? []).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
                <span>{log.amountMl}ml</span>
                <span className="text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
