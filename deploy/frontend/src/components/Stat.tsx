export function Stat({ label, value, tone = "water" }: { label: string; value: string; tone?: "water" | "leaf" | "coral" }) {
  const color = tone === "leaf" ? "text-leaf" : tone === "coral" ? "text-coral" : "text-water";

  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
