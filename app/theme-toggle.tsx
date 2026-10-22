"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      aria-label={mounted ? `Cambiar a tema ${isDark ? "claro" : "oscuro"}` : "Cambiar tema"}
    >
      {mounted ? (isDark ? "☀️ Tema claro" : "🌙 Tema oscuro") : "Cambiar tema"}
    </button>
  );
}
