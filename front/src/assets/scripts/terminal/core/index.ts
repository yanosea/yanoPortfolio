/**
 * Terminal Core Functions Index
 */

export {
  addCommandToHistory,
  addToHistory,
  clearCommandHistory,
  getCommandHistory,
  getHistoryPointer,
  getNextCommand,
  getPreviousCommand,
  setHistoryPointer,
} from "./history.ts";

export { handleAutocomplete } from "./autocomplete.ts";
export { executeCommand } from "./executor.ts";
export { getPromptHtml, isDesktop, scrollToBottom } from "./utils.ts";
export {
  addStdinLine,
  cancelStdinMode,
  finishStdinMode,
  getStdinCommand,
  isStdinModeActive,
  startStdinMode,
} from "./stdin.ts";
