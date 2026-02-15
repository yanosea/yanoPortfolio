/**
 * Whoami Command
 */

// types
import type { Command } from "@/types/terminal.ts";

export const whoami: Command = {
  name: "whoami",
  description: "Display current user",
  execute: () => {
    return "you";
  },
};
