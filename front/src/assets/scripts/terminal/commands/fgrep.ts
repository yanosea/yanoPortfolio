/**
 * Fgrep Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// commands
import { grep } from "./grep.ts";

export const fgrep: Command = {
  name: "fgrep",
  description: "Search for fixed string patterns (no regex)",
  execute: async (
    args: string[] = [],
    allCommands?: Command[],
    stdin?: string,
  ) => {
    // add -F flag to enable fixed strings mode
    const fixedArgs = ["-F", ...args];
    return await grep.execute(fixedArgs, allCommands, stdin);
  },
};
