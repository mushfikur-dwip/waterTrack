"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Target, TrendingUp } from "lucide-react";
import { api, getTelegramId } from "../../components/api";
import { AppShell } from "../../components/AppShell";
import { Stat } from "../../components/Stat";
import type { HistoryResponse, Progress } from "../../components/types";

export default function ReportsPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<HistoryResponse>(`/api/water-log/history?telegramId=${getTelegramId()}&days=30`),
      api<Progress>(`/api/water-log/today?telegramId=${getTelegramId()}`)
    ]).then(([historyData, progressData]) => {
      setHistory(historyData);
      setProgress(progressData);
    }).catch(() => setError("Backend বা database connect হচ্ছে না।"));
  }, []);

  const report = useMemo(() => {
    const summary = history?.summary ?? [];
    const total = summary.reduce((sum, day) => sum + day.amountMl, 0);
    const average = summary.length ? Math.round(total / summary.length) : 0;
    const target = progress?.targetMl ?? 2500;
    const hitDays = summary.filter((day) => day.amountMl >= target).length;

    return { total, average, hitDays, days: summary.length };
  }, [history, progress]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-slate-500">Weekly এবং monthly summary এক জায়গায়।</p>
      </div>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Monthly total" value={`${report.total}ml`} />
        <Stat label="Daily average" value={`${report.average}ml`} tone="leaf" />
        <Stat label="Target hit days" value={`${report.hitDays}/${report.days}`} tone="coral" />
      </div>
      <div className="mt-4 rounded border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold">Highlights</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ReportItem icon={<Target size={18} />} label="Current target" value={`${progress?.targetMl ?? 0}ml`} />
          <ReportItem icon={<CalendarDays size={18} />} label="Tracked days" value={`${report.days}`} />
          <ReportItem icon={<TrendingUp size={18} />} label="Completion today" value={`${progress?.percent ?? 0}%`} />
        </div>
      </div>
    </AppShell>
  );
}

function ReportItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-slate-50 px-3 py-3">
      <span className="flex items-center gap-2 text-sm text-slate-600">{icon}{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
