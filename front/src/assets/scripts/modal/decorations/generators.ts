/**
 * Decoration text generators
 */

/**
 * Generate a random repeat of "8" for applause
 * @returns Applause string (e.g., "88888888")
 */
export function generateApplause(): string {
  const count = 8 + Math.floor(Math.random() * 40);
  return "8".repeat(count);
}

/**
 * Generate "ｷﾀ――(ﾟ∀ﾟ)――!!" with random dash count
 * @returns Kita string
 */
export function generateKita(): string {
  const count = 4 + Math.floor(Math.random() * 20);
  const dashes = "―".repeat(count);
  return `ｷﾀ${dashes}(ﾟ∀ﾟ)${dashes}!!`;
}

/**
 * Generate a random repeat of "w" for laughter
 * @returns Laughter string (e.g., "wwwww")
 */
export function generateLaughter(): string {
  const count = 4 + Math.floor(Math.random() * 28);
  return "w".repeat(count);
}
