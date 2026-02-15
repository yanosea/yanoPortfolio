/**
 * Egrep Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// commands
import { grep } from "./grep.ts";

export const egrep: Command = {
  name: "egrep",
  description: "Search for patterns using extended regular expressions",
  execute: async (
    args: string[] = [],
    allCommands?: Command[],
    stdin?: string,
  ) => {
    // add -E flag to enable extended regex mode
    const extendedArgs = ["-E", ...args];
    return await grep.execute(extendedArgs, allCommands, stdin);
  },
};
