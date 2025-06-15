
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Only allow exactly these themes
const allowedThemes = ["light", "dark", "system"] as const;
type Theme = typeof allowedThemes[number];
function normalizeTheme(theme: string): Theme {
  return allowedThemes.includes(theme as Theme) ? (theme as Theme) : "system";
}

export function useThemePreference() {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    // On first run, try to detect from localStorage or default to "system"
    if (typeof window !== "undefined") {
      const local = window.localStorage.getItem("theme");
      return normalizeTheme(local || "system");
    }
    return "system";
  });

  // Load from supabase profile (if present) on mount or user change
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("theme")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.theme) {
          setThemeState(normalizeTheme(data.theme));
          applyTheme(data.theme);
          window.localStorage.setItem("theme", data.theme);
        }
      });
  }, [user]);

  // Apply theme when `theme` local state changes
  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
    applyTheme(next);
    window.localStorage.setItem("theme", next);
    if (user) {
      supabase
        .from("profiles")
        .update({ theme: next })
        .eq("id", user.id)
        .then(() => {});
    }
  }

  function applyTheme(t: string) {
    const html = document.documentElement;
    const themeToApply = normalizeTheme(t);
    html.classList.remove("light", "dark");
    if (themeToApply === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.classList.add(prefersDark ? "dark" : "light");
    } else {
      html.classList.add(themeToApply);
    }
  }

  return { theme, setTheme };
}
