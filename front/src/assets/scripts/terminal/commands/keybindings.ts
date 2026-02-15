/**
 * Keybindings Command
 */

// types
import type { Command } from "@/types/terminal.ts";
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
// core
import { MAN_PAGES } from "../core/man-pages.ts";

export const keybindings: Command = {
  name: "keybindings",
  description: "Display terminal keyboard shortcuts reference",
  execute: (_args: string[]) => {
    const manPage = MAN_PAGES.keybindings;
    let output =
      `<div class="font-bold text-lg mb-2">TERMINAL KEYBINDINGS</div>`;
    output += `<div class="mb-3">${manPage.description}</div>`;
    if (manPage.options) {
      output +=
        `<pre class="whitespace-pre-wrap text-sm">${manPage.options}</pre>`;
    }
    output +=
      `<div class="mt-3 text-muted">Tip: Use <span class="${CSS_CLASSES.COMMAND}">man keybindings</span> for detailed manual page</div>`;
    return output;
  },
};
