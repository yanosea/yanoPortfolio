/**
 * Index Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { ROUTING_CONFIG } from "@/assets/scripts/core/config.ts";
// core
import { redirectWithCountdown } from "../core/index.ts";

/**
 * Index command
 */
export const index: Command = {
  name: "index",
  description: "Navigate to index page",
  execute: () => redirectWithCountdown("index", ROUTING_CONFIG.pages.home),
};
