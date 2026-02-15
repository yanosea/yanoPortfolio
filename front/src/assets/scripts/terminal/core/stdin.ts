/**
 * Terminal Stdin Mode Management
 */

import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
// utils
import { scrollToBottom } from "./utils.ts";

/**
 * Stdin mode state
 */
interface StdinState {
  /** Whether stdin mode is currently active */
  isActive: boolean;
  /** Callback to invoke when stdin is complete */
  callback: ((input: string) => Promise<void>) | null;
  /** Buffer of input lines */
  buffer: string[];
  /** Command that initiated stdin mode */
  command: string;
}

/**
 * Global stdin state instance
 */
const stdinState: StdinState = {
  isActive: false,
  callback: null,
  buffer: [],
  command: "",
};

/**
 * Check if stdin mode is currently active
 * @returns True if stdin mode is active
 */
export function isStdinModeActive(): boolean {
  return stdinState.isActive;
}

/**
 * Get the current command waiting for stdin
 * @returns Current stdin command
 */
export function getStdinCommand(): string {
  return stdinState.command;
}

/**
 * Start stdin input mode
 * @param command - The command waiting for stdin (e.g., "grep pattern")
 * @param callback - Function to call with accumulated stdin when Ctrl+D is pressed
 */
export function startStdinMode(
  command: string,
  callback: (input: string) => Promise<void>,
): void {
  stdinState.isActive = true;
  stdinState.callback = callback;
  stdinState.buffer = [];
  stdinState.command = command;
  // update UI to show stdin mode
  const input = document.getElementById("terminal-input") as HTMLInputElement;
  if (input) {
    input.placeholder = "(stdin mode - press Ctrl+D to finish input)";
  }
}

/**
 * Add a line to the stdin buffer
 * @param line - Line of text entered by user
 */
export function addStdinLine(line: string): void {
  const historyEl = document.getElementById("terminal-history");
  if (!historyEl) {
    return;
  }
  // display the input line with a stdin prompt
  const lineEl = document.createElement("div");
  lineEl.className = CSS_CLASSES.HISTORY_ITEM;
  const promptSpan = document.createElement("span");
  promptSpan.className = CSS_CLASSES.STDIN_PROMPT;
  promptSpan.textContent = "> ";
  const textSpan = document.createElement("span");
  textSpan.textContent = line;
  lineEl.appendChild(promptSpan);
  lineEl.appendChild(textSpan);
  historyEl.appendChild(lineEl);
  // add to buffer
  stdinState.buffer.push(line);
  scrollToBottom();
}

/**
 * Finish stdin mode and execute the callback with accumulated input
 */
export async function finishStdinMode(): Promise<void> {
  if (!stdinState.isActive || !stdinState.callback) {
    return;
  }
  const input = stdinState.buffer.join("\n");
  const callback = stdinState.callback;
  // reset state before executing callback
  stdinState.isActive = false;
  stdinState.callback = null;
  stdinState.buffer = [];
  stdinState.command = "";
  // restore normal input placeholder
  const inputEl = document.getElementById(
    "terminal-input",
  ) as HTMLInputElement;
  if (inputEl) {
    inputEl.placeholder = "";
  }
  // execute the callback with the accumulated stdin
  await callback(input);
  scrollToBottom();
}

/**
 * Cancel stdin mode without executing the callback
 */
export function cancelStdinMode(): void {
  stdinState.isActive = false;
  stdinState.callback = null;
  stdinState.buffer = [];
  stdinState.command = "";
  // restore normal input placeholder
  const inputEl = document.getElementById(
    "terminal-input",
  ) as HTMLInputElement;
  if (inputEl) {
    inputEl.placeholder = "";
  }
}
