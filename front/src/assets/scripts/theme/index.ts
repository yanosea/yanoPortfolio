/**
 * Theme toggle logic with system preference support
 */

// core
import { getItem, setItem } from "@/assets/scripts/core/storage.ts";
import { type Theme, THEME_CONFIG } from "@/assets/scripts/core/config.ts";

/**
 * Get the current theme, prioritizing stored preference over system setting
 */
const getCurrentTheme = (): Theme => {
  const stored = getItem(THEME_CONFIG.STORAGE_KEY);
  if (stored) return stored as Theme;
  return matchMedia("(prefers-color-scheme: dark)").matches
    ? THEME_CONFIG.DARK
    : THEME_CONFIG.LIGHT;
};

/**
 * Apply the specified theme to the document
 * @param theme - The theme to apply
 */
const applyTheme = (theme: Theme): void => {
  if (theme === THEME_CONFIG.DARK) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

/**
 * Update the aria-label of the theme toggle button
 * @param currentTheme - The current theme
 */
const updateButtonLabel = (currentTheme: Theme): void => {
  const nextTheme = currentTheme === THEME_CONFIG.DARK
    ? THEME_CONFIG.LIGHT
    : THEME_CONFIG.DARK;
  document.querySelectorAll("#theme-toggle").forEach((btn) => {
    btn.setAttribute("aria-label", `switch to ${nextTheme} mode`);
  });
};

// initialize theme state
let currentTheme = getCurrentTheme();

// setup toggle button click handler
document.addEventListener("DOMContentLoaded", () => {
  updateButtonLabel(currentTheme);
  document.querySelectorAll("#theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      // toggle theme
      const newTheme = currentTheme === THEME_CONFIG.DARK
        ? THEME_CONFIG.LIGHT
        : THEME_CONFIG.DARK;
      // persist preference
      setItem(THEME_CONFIG.STORAGE_KEY, newTheme);
      // apply with view transition if supported
      if (
        document.startViewTransition &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        document.startViewTransition(() => {
          applyTheme(newTheme);
          updateButtonLabel(newTheme);
        });
      } else {
        // fallback without animation
        applyTheme(newTheme);
        updateButtonLabel(newTheme);
      }
      currentTheme = newTheme;
    });
  });
});

// listen for system theme changes
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  // only apply if no user preference stored
  if (!getItem(THEME_CONFIG.STORAGE_KEY)) {
    const newTheme = e.matches ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT;
    applyTheme(newTheme);
    updateButtonLabel(newTheme);
    currentTheme = newTheme;
  }
});
