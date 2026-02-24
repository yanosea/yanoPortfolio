/**
 * Pwd Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// core
import { getCurrentVirtualPath } from "../core/utils.ts";

export const pwd: Command = {
  name: "pwd",
  description: "Print working directory",
  execute: () => {
    return getCurrentVirtualPath();
  },
};
