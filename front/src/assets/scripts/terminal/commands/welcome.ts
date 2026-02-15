/**
 * Welcome Command
 */

// types
import type { Command } from "@/types/terminal.ts";

export const welcome: Command = {
  name: "welcome",
  description: "Show welcome message",
  execute: () => {
    return `<pre class="terminal-ascii-art">
   __  ______ _____  ____  ________  ____ _ ____  _________ _
  / / / / __ \`/ __ \\/ __ \\/ ___/ _ \\/ __ \`// __ \\/ ___/ __ \`/
 / /_/ / /_/ / / / / /_/ (__  )  __/ /_/ // /_/ / /  / /_/ /
 \\__, /\\__,_/_/ /_/\\____/____/\\___/\\__,_(_)____/_/   \\__, /
/____/                                              /____/
</pre>
Type <span class="terminal-command">help</span> to see available commands.`;
  },
};
