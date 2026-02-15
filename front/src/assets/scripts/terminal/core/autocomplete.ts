/**
 * Terminal Autocomplete
 */

// types
import type { Command } from "@/types/terminal.ts";
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";

/**
 * Handle autocomplete for the terminal input
 * @param input - Terminal input element
 * @param hints - Hints display element
 * @param commands - Available commands
 */
export function handleAutocomplete(
  input: HTMLInputElement,
  hints: HTMLDivElement,
  commands: Command[],
): void {
  const value = input.value.trim();
  if (!value) {
    return;
  }
  const matches = commands.filter((cmd) => cmd.name.startsWith(value));
  if (matches.length === 1) {
    // single match - complete it
    input.value = matches[0].name;
    hints.style.display = "none";
    hints.innerHTML = "";
  } else if (matches.length > 1) {
    // multiple matches - show hints
    hints.innerHTML = matches
      .map((cmd) => `<span class="${CSS_CLASSES.HINT}">${cmd.name}</span>`)
      .join("");
    hints.style.display = "flex";
  } else {
    hints.style.display = "none";
    hints.innerHTML = "";
  }
}
