import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setTheme(storedTheme === "light" ? "light" : "dark");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [ready, theme]);

  return { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className={`w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-[1.05] transition ${className}`}
    >
      {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
