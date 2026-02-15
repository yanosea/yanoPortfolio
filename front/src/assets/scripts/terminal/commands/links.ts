/**
 * Links Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
import { ROUTING_CONFIG, TIMING_CONFIG } from "@/assets/scripts/core/config.ts";

export const links: Command = {
  name: "links",
  description: "Navigate to links page",
  execute: () => {
    // hide terminal form during redirect
    const form = document.getElementById("terminal-form") as HTMLFormElement;
    if (form) {
      form.style.display = "none";
    }
    let countdown = TIMING_CONFIG.redirectCountdownSeconds;
    const outputHtml =
      `<span class="${CSS_CLASSES.SUCCESS}">Redirecting to links page in ${countdown} second${
        countdown !== 1 ? "s" : ""
      }...</span>`;
    // update countdown every second
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        const outputEl = document.querySelector(
          ".terminal-history-item:last-child .terminal-history-output",
        );
        if (outputEl) {
          outputEl.innerHTML =
            `<span class="${CSS_CLASSES.SUCCESS}">Redirecting to links page in ${countdown} second${
              countdown !== 1 ? "s" : ""
            }...</span>`;
        }
      } else {
        clearInterval(countdownInterval);
        globalThis.location.href = ROUTING_CONFIG.pages.links;
      }
    }, TIMING_CONFIG.countdownInterval);
    return outputHtml;
  },
};
