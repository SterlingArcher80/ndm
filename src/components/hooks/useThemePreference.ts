
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Only allow exactly these themes
const allowedThemes = ["light", "dark", "default"] as const;
type Theme = typeof allowedThemes[number];
function normalizeTheme(theme: string): Theme {
  // Migrate old "system" theme to "default"
  if (theme === "system") return "default";
  return allowedThemes.includes(theme as Theme) ? (theme as Theme) : "default";
}

export function useThemePreference() {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    // On first run, try to detect from localStorage or default to "default"
    if (typeof window !== "undefined") {
      const local = window.localStorage.getItem("theme");
      return normalizeTheme(local || "default");
    }
    return "default";
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
          const normalizedTheme = normalizeTheme(data.theme);
          setThemeState(normalizedTheme);
          applyTheme(normalizedTheme);
          window.localStorage.setItem("theme", normalizedTheme);
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
    html.classList.remove("light", "dark", "default");
    html.classList.add(themeToApply);
  }

  return { theme, setTheme };
}
