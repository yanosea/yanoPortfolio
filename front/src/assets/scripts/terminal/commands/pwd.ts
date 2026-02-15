/**
 * Pwd Command
 */

// types
import type { Command } from "@/types/terminal.ts";

/**
 * Current user name
 */
const USER = "you";

export const pwd: Command = {
  name: "pwd",
  description: "Print working directory",
  execute: () => {
    // get page path, remove leading slash and .html extension
    const page = globalThis.location.pathname
      .replace(/^\//, "") // remove leading slash
      .replace(/\.html$/, ""); // remove .html extension

    // construct Unix-style path: /home/you or /home/you/page
    if (!page) {
      // root page (index)
      return `/home/${USER}`;
    } else {
      // other pages
      return `/home/${USER}/${page}`;
    }
  },
};
