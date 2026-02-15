/**
 * Blog Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { ROUTING_CONFIG } from "@/assets/scripts/core/config.ts";
// core
import { redirectWithCountdown } from "../core/index.ts";

/**
 * Blog command
 */
export const blog: Command = {
  name: "blog",
  description: "Navigate to blog page",
  execute: () => redirectWithCountdown("blog", ROUTING_CONFIG.pages.blog),
};
