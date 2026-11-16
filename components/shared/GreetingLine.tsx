"use client";

import { useEffect, useState } from "react";

const TZ = "Asia/Jakarta";

function greetingFor(hour: number) {
  if (hour >= 4 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

/** Sapaan ramah di samping badge portal untuk tampilan mobile */
export default function GreetingLine() {
  const [greet, setGreet] = useState<string>("");
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
    setGreet(greetingFor(hour));

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

  if (!greet) return null;

  return (
    <span className="truncate text-xs font-medium text-[#796E72] dark:text-[#C5B6B9] md:hidden">
      • {greet}{name ? `, ${name}` : ""}
    </span>
  );
}
