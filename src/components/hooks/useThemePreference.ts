
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Get root <html> element for theme class switch
const html = document.documentElement;

export function useThemePreference() {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");

  // Load theme from profile on mount or user change
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("theme")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.theme) {
          setThemeState(data.theme as "light" | "dark" | "system");
          applyTheme(data.theme as "light" | "dark" | "system");
        }
      });
  }, [user]);

  useEffect(() => {
    // Apply on mount for system (fallback)
    applyTheme(theme);
    // eslint-disable-next-line
  }, []);

  function setTheme(next: "light" | "dark" | "system") {
    setThemeState(next);
    applyTheme(next);
    // store in db (if logged in)
    if (user) {
      supabase
        .from("profiles")
        .update({ theme: next })
        .eq("id", user.id)
        .then(() => {});
    }
  }

  function applyTheme(t: "light" | "dark" | "system") {
    if (t === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      html.classList.remove("light", "dark");
      html.classList.add(prefersDark ? "dark" : "light");
    } else {
      html.classList.remove("light", "dark");
      html.classList.add(t);
    }
  }

  return { theme, setTheme };
}
