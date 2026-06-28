"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock, Droplets, History, Settings } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Droplets },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/login", label: "Login", icon: Clock }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#f7faf9]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:w-64 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-water text-white">
              <Droplets size={22} />
            </div>
            <div>
              <p className="text-lg font-semibold">WaterTrack</p>
              <p className="text-xs text-slate-500">পানি reminder portal</p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-fit items-center gap-2 rounded px-3 py-2 text-sm font-medium ${
                    active ? "bg-mist text-water" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</section>
      </div>
    </main>
  );
}
