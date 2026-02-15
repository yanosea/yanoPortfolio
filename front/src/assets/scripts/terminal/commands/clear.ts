/**
 * Clear Command
 */

// types
import type { Command } from "@/types/terminal.ts";

/**
 * Clear Command
 */
export const clear: Command = {
  name: "clear",
  description: "Clear terminal history",
  execute: () => {
    const historyEl = document.getElementById("terminal-history");
    if (historyEl) {
      historyEl.innerHTML = "";
    }
    return "";
  },
};
