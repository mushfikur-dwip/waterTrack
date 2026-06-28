"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api, getTelegramId } from "../../components/api";
import { AppShell } from "../../components/AppShell";
import type { Progress } from "../../components/types";

export default function SettingsPage() {
  const [form, setForm] = useState({
    dailyTargetMl: 2500,
    reminderIntervalMinutes: 60,
    activeStartTime: "08:00",
    activeEndTime: "22:00",
    reminderEnabled: true,
    defaultDrinkAmountMl: 250
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    api<Progress>(`/api/water-log/today?telegramId=${getTelegramId()}`).then((data) => {
      setForm({
        dailyTargetMl: data.user.dailyTargetMl,
        reminderIntervalMinutes: data.user.reminderIntervalMinutes,
        activeStartTime: data.user.activeStartTime,
        activeEndTime: data.user.activeEndTime,
        reminderEnabled: data.user.reminderEnabled,
        defaultDrinkAmountMl: data.user.settings?.defaultDrinkAmountMl ?? 250
      });
    }).catch(() => setError("Backend বা database connect হচ্ছে না।"));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await api("/api/user/settings", {
        method: "PATCH",
        body: JSON.stringify({ telegramId: getTelegramId(), ...form })
      });
      setSaved("Settings saved.");
    } catch {
      setError("Settings save হয়নি। Backend বা database check করুন।");
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-500">Target, interval এবং active reminder সময় পরিবর্তন করুন।</p>
      </div>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {saved && <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{saved}</div>}
      <form onSubmit={submit} className="grid max-w-3xl gap-4 rounded border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Field label="Daily target ml" type="number" value={form.dailyTargetMl} onChange={(value) => setForm({ ...form, dailyTargetMl: Number(value) })} />
        <Field label="Reminder interval minutes" type="number" min={1} max={1440} value={form.reminderIntervalMinutes} onChange={(value) => setForm({ ...form, reminderIntervalMinutes: Number(value) })} />
        <Field label="Active start" type="time" value={form.activeStartTime} onChange={(value) => setForm({ ...form, activeStartTime: value })} />
        <Field label="Active end" type="time" value={form.activeEndTime} onChange={(value) => setForm({ ...form, activeEndTime: value })} />
        <Field label="Default drink amount ml" type="number" value={form.defaultDrinkAmountMl} onChange={(value) => setForm({ ...form, defaultDrinkAmountMl: Number(value) })} />
        <label className="flex items-center gap-3 rounded border border-slate-200 px-3 py-2">
          <input type="checkbox" checked={form.reminderEnabled} onChange={(event) => setForm({ ...form, reminderEnabled: event.target.checked })} />
          <span className="text-sm font-medium">Reminder enabled</span>
        </label>
        <button className="inline-flex w-fit items-center gap-2 rounded bg-water px-4 py-2 text-sm font-semibold text-white">
          <Save size={17} /> Save
        </button>
      </form>
    </AppShell>
  );
}

function Field({ label, value, type, min, max, onChange }: { label: string; value: string | number; type: string; min?: number; max?: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input value={value} type={type} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
    </label>
  );
}
