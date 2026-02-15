/**
 * Terminal History Management
 */

// types
import type { Command } from "@/types/terminal.ts";
// config
import { RESTRICTED_UNIX_COMMANDS } from "./config.ts";
// utils
import { escapeHtml, getPromptHtml } from "./utils.ts";

/**
 * localStorage key for persisting command history
 */
const STORAGE_KEY = "terminal-history";

/**
 * Maximum number of commands to persist
 */
const MAX_HISTORY_SIZE = 100;

/**
 * Load command history from localStorage
 * @returns Persisted command history array
 */
function loadHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string =>
          typeof item === "string"
        );
      }
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

/**
 * Save command history to localStorage
 */
function saveHistory(): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(commandHistory.slice(0, MAX_HISTORY_SIZE)),
    );
  } catch {
    // ignore storage errors
  }
}

/**
 * Command history buffer (restored from localStorage on init)
 */
const commandHistory: string[] = loadHistory();

/**
 * History navigation pointer
 */
let historyPointer: number = -1;

/**
 * Get the current command history
 * @returns Array of command strings
 */
export function getCommandHistory(): string[] {
  return commandHistory;
}

/**
 * Get the current history pointer
 * @returns Current pointer position
 */
export function getHistoryPointer(): number {
  return historyPointer;
}

/**
 * Set the history pointer
 * @param value - Pointer position
 */
export function setHistoryPointer(value: number): void {
  historyPointer = value;
}

/**
 * Add a command to the history
 * @param command - Command string to add
 */
export function addCommandToHistory(command: string): void {
  commandHistory.unshift(command);
  if (commandHistory.length > MAX_HISTORY_SIZE) {
    commandHistory.length = MAX_HISTORY_SIZE;
  }
  historyPointer = -1;
  saveHistory();
}

/**
 * Clear the command history buffer and localStorage
 */
export function clearCommandHistory(): void {
  commandHistory.length = 0;
  historyPointer = -1;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

/**
 * Get the previous command from history
 * @returns Previous command or null
 */
export function getPreviousCommand(): string | null {
  if (historyPointer < commandHistory.length - 1) {
    historyPointer++;
    return commandHistory[historyPointer];
  }
  return null;
}

/**
 * Get the next command from history
 * @returns Next command or null
 */
export function getNextCommand(): string | null {
  if (historyPointer > 0) {
    historyPointer--;
    return commandHistory[historyPointer];
  } else if (historyPointer === 0) {
    historyPointer = -1;
    return "";
  }
  return null;
}

/**
 * Add command and output to the terminal history display
 * @param commandLine - Command line string
 * @param command - Command to execute
 * @param args - Command arguments
 * @param allCommands - All available commands
 */
export async function addToHistory(
  commandLine: string,
  command: Command | undefined,
  args: string[],
  allCommands: Command[],
): Promise<void> {
  const historyEl = document.getElementById("terminal-history");
  if (!historyEl) {
    return;
  }
  const historyItem = document.createElement("div");
  historyItem.className = "terminal-history-item";
  // command line - create and add immediately
  const commandEl = document.createElement("div");
  commandEl.className = "terminal-history-command flex items-center gap-2";
  // build prompt separately to avoid innerHTML for the command text
  const promptSpan = document.createElement("span");
  promptSpan.className = "terminal-prompt";
  promptSpan.innerHTML = getPromptHtml();
  // use textContent for the command to avoid innerHTML re-parsing
  const commandSpan = document.createElement("span");
  commandSpan.textContent = commandLine;
  commandEl.appendChild(promptSpan);
  commandEl.appendChild(commandSpan);
  historyItem.appendChild(commandEl);
  // add the command line to DOM immediately before clearing input
  historyEl.appendChild(historyItem);
  // output - process and add after command execution
  const outputEl = document.createElement("div");
  outputEl.className = "terminal-history-output";
  if (command) {
    const result = command.execute(args, allCommands);
    // handle both sync and async commands
    const output = result instanceof Promise ? await result : result;
    if (output !== undefined && output !== null) {
      outputEl.innerHTML = output;
      historyItem.appendChild(outputEl);
    }
  } else if (commandLine) {
    // extract command name from command line
    const cmdName = commandLine.trim().split(/\s+/)[0];
    const isRestrictedCommand = RESTRICTED_UNIX_COMMANDS.includes(
      cmdName as typeof RESTRICTED_UNIX_COMMANDS[number],
    );
    if (isRestrictedCommand) {
      outputEl.innerHTML = `<span class="terminal-error">permission denied: ${
        escapeHtml(cmdName)
      }</span>`;
    } else {
      outputEl.innerHTML = `<span class="terminal-error">command not found: ${
        escapeHtml(commandLine)
      }</span>`;
    }
    historyItem.appendChild(outputEl);
  }
}
