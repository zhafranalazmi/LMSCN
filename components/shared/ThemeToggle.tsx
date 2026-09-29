"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

/**
 * Saklar tema terang/gelap.
 * Tampilan (posisi knob, ikon) diatur lewat varian `dark:` supaya langsung benar
 * saat halaman dimuat; state React hanya untuk aria-checked dan aksi klik.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* mode privat / storage diblokir: tema tetap berubah untuk sesi ini */
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Tema gelap"
      onClick={toggle}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-navy-300/60 bg-navy-100/70 p-1 transition-colors motion-reduce:transition-none dark:border-white/15 dark:bg-white/10 ${className}`}
    >
      <span className="flex h-6 w-6 translate-x-0 items-center justify-center rounded-full bg-[#fdfefe] text-navy-700 shadow transition-transform duration-200 motion-reduce:transition-none dark:translate-x-6 dark:bg-navy-500 dark:text-white">
        <Sun size={14} className="dark:hidden" />
        <Moon size={14} className="hidden dark:block" />
      </span>
    </button>
  );
}
