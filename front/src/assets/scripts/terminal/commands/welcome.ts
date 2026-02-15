/**
 * Welcome Command
 */

// types
import type { Command } from "@/types/terminal.ts";
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";

export const welcome: Command = {
  name: "welcome",
  description: "Show welcome message",
  execute: () => {
    return `<pre class="${CSS_CLASSES.ASCII_ART}">
   __  ______ _____  ____  ________  ____ _ ____  _________ _
  / / / / __ \`/ __ \\/ __ \\/ ___/ _ \\/ __ \`// __ \\/ ___/ __ \`/
 / /_/ / /_/ / / / / /_/ (__  )  __/ /_/ // /_/ / /  / /_/ /
 \\__, /\\__,_/_/ /_/\\____/____/\\___/\\__,_(_)____/_/   \\__, /
/____/                                              /____/
</pre>
Type <span class="${CSS_CLASSES.COMMAND}">help</span> to see available commands.`;
  },
};
