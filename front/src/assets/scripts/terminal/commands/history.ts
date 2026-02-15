/**
 * History Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// config
import { HISTORY_CONFIG } from "../core/config.ts";
// core
import { clearCommandHistory, getCommandHistory } from "../core/history.ts";

const LINE_NUMBER_START = 1;
const LINE_NUMBER_SEPARATOR = "  ";

const MESSAGES = {
  NO_HISTORY: "No commands in history.",
  HISTORY_CLEARED: "History cleared.",
} as const;

export const history: Command = {
  name: "history",
  description: "Show command history",
  execute: (args: string[] = []) => {
    // check for -c option (clear history)
    if (args.includes("-c")) {
      clearCommandHistory();
      return MESSAGES.HISTORY_CLEARED;
    }
    // get history from in-memory buffer (includes persisted history)
    const commands = [...getCommandHistory()].reverse();
    if (commands.length === 0) {
      return MESSAGES.NO_HISTORY;
    }
    // check for numeric argument (show last N commands)
    let displayCommands = commands;
    if (args.length > 0 && !args[0].startsWith("-")) {
      const count = parseInt(args[0], 10);
      if (!isNaN(count) && count > 0) {
        displayCommands = commands.slice(-count);
      }
    }
    // format as numbered list (most recent last, like bash history)
    const startNumber = commands.length - displayCommands.length +
      LINE_NUMBER_START;
    const historyList = displayCommands
      .map((cmd, index) => {
        const lineNumber = String(startNumber + index).padStart(
          HISTORY_CONFIG.LINE_NUMBER_PADDING,
          HISTORY_CONFIG.PADDING_CHAR,
        );
        return `${lineNumber}${LINE_NUMBER_SEPARATOR}${cmd}`;
      })
      .join("\n");
    return `<pre>${historyList}</pre>`;
  },
};
