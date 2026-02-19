/**
 * Terminal Output Formatter
 */

// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
import { escapeHtml } from "./utils.ts";

/**
 * Highlight a match within text
 * @param text - Text to highlight
 * @param matchIndex - Start index of match
 * @param matchLength - Length of match
 * @param cssClass - CSS class for highlighting
 * @returns HTML string with highlighted match
 */
export function highlightMatch(
  text: string,
  matchIndex: number,
  matchLength: number,
  cssClass: string = CSS_CLASSES.ERROR,
): string {
  if (matchIndex < 0 || matchLength <= 0) return escapeHtml(text);
  const before = text.substring(0, matchIndex);
  const match = text.substring(matchIndex, matchIndex + matchLength);
  const after = text.substring(matchIndex + matchLength);
  return `${escapeHtml(before)}<span class="${cssClass}">${
    escapeHtml(match)
  }</span>${escapeHtml(after)}`;
}
