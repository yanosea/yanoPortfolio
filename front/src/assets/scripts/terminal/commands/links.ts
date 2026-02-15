/**
 * Links Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { ROUTING_CONFIG } from "@/assets/scripts/core/config.ts";
// core
import { redirectWithCountdown } from "../core/index.ts";

export const links: Command = {
  name: "links",
  description: "Navigate to links page",
  execute: () => redirectWithCountdown("links", ROUTING_CONFIG.pages.links),
};
