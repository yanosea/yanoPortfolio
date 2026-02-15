/**
 * About Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { ROUTING_CONFIG } from "@/assets/scripts/core/config.ts";
// core
import { redirectWithCountdown } from "../core/index.ts";

/**
 * About Command
 */
export const about: Command = {
  name: "about",
  description: "Navigate to about page",
  execute: () => redirectWithCountdown("about", ROUTING_CONFIG.pages.about),
};
