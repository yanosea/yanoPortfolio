/**
 * Env Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// core
import { escapeHtml, getShellVariables } from "../core/utils.ts";

export const env: Command = {
  name: "env",
  description: "Print environment",
  execute: () => {
    const vars = getShellVariables();
    return Object.entries(vars)
      .map(([k, v]) => escapeHtml(`${k}=${v}`))
      .join("\n");
  },
};
