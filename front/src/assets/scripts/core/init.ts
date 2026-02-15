/**
 * Critical initialization script
 */

// check localStorage availability (inline to avoid module delays)
const storageAvailable = (() => {
  try {
    // test localStorage with dummy value
    const x = "__storage_test__";
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  } catch {
    // localStorage not available (e.g., Safari private mode)
    return false;
  }
})();

/**
 * Get item from localStorage
 * @param key - Storage key
 * @returns Stored value or null
 */
function getItem(key: string): string | null {
  return storageAvailable ? localStorage.getItem(key) : null;
}

/**
 * Theme configuration
 */
const THEME_CONFIG = {
  STORAGE_KEY: "theme",
  DARK: "dark",
  LIGHT: "light",
} as const;

// immediately apply theme to prevent FOUC
(() => {
  const theme = getItem(THEME_CONFIG.STORAGE_KEY) ||
    (matchMedia("(prefers-color-scheme: dark)").matches
      ? THEME_CONFIG.DARK
      : THEME_CONFIG.LIGHT);
  if (theme === THEME_CONFIG.DARK) {
    document.documentElement.classList.add("dark");
  }
})();
