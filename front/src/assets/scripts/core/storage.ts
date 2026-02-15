/**
 * Core Storage Utilities
 */

// check localStorage availability (handles Safari private mode)
const storageAvailable = (() => {
  try {
    // test localStorage by setting and removing a test value
    const x = "__storage_test__";
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  } catch {
    // localStorage is not available (e.g., Safari private mode)
    return false;
  }
})();

/**
 * Safe localStorage getter
 * @param key - Storage key
 * @returns Stored value or null if not found or storage unavailable
 */
export function getItem(key: string): string | null {
  return storageAvailable ? localStorage.getItem(key) : null;
}

/**
 * Safe localStorage setter
 * @param key - Storage key
 * @param value - Value to store
 */
export function setItem(key: string, value: string): void {
  // only store if localStorage is available
  if (storageAvailable) {
    localStorage.setItem(key, value);
  }
}

/**
 * Check if localStorage is available
 * @returns True if localStorage is available
 */
export function isStorageAvailable(): boolean {
  return storageAvailable;
}
