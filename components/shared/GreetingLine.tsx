"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

const TZ = "Asia/Jakarta";

function greetingFor(hour: number) {
  if (hour >= 4 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

/** Sapaan + tanggal di dalam kartu hero. Hanya tampil di mobile. */
export default function GreetingLine() {
  const [info, setInfo] = useState<{ greet: string; date: string } | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        hourCycle: "h23",
        timeZone: TZ,
      }).format(now)
    );
    const date = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: TZ,
    }).format(now);
    setInfo({ greet: greetingFor(hour), date });

    let alive = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        const first = String(s?.user?.name ?? "").trim().split(/\s+/)[0];
        if (alive && first) setName(first);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mb-4 min-h-[2.75rem] md:hidden">
      {info && (
        <>
          <p className="text-[15px] font-semibold leading-tight">
            {info.greet}
            {name ? `, ${name}!` : "!"}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
            <CalendarDays size={14} />
            {info.date}
          </p>
        </>
      )}
    </div>
  );
}
