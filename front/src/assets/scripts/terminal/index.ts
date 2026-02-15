/**
 * Terminal Module Index
 */

// types
import type { Command } from "@/types/terminal.ts";
// commands
import * as commands from "./commands/index.ts";
// core
import {
  addCommandToHistory,
  clearRedirectCountdown,
  executeCommand,
  getNextCommand,
  getPreviousCommand,
  getPromptHtml,
  handleAutocomplete,
  isDesktop,
  scrollToBottom,
  setHistoryPointer,
} from "./core/index.ts";
import {
  addStdinLine,
  cancelStdinMode,
  finishStdinMode,
  isStdinModeActive,
} from "./core/stdin.ts";
// modal
import { openImageModal } from "../modal/modal-functions.ts";

/** Reference to the global keydown handler for cleanup */
let globalKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

/**
 * Clean up terminal event listeners
 */
function cleanupTerminal(): void {
  if (globalKeydownHandler) {
    globalThis.removeEventListener("keydown", globalKeydownHandler);
    globalKeydownHandler = null;
  }
}

/**
 * Measure text width using a hidden span
 * @param text - Text to measure
 * @param font - Font style string
 * @returns Width in pixels
 */
function measureTextWidth(text: string, font: string): number {
  const measureSpan = document.createElement("span");
  measureSpan.style.visibility = "hidden";
  measureSpan.style.position = "absolute";
  measureSpan.style.whiteSpace = "pre";
  measureSpan.style.font = font;
  measureSpan.textContent = text;
  document.body.appendChild(measureSpan);
  const width = measureSpan.offsetWidth;
  document.body.removeChild(measureSpan);
  return width;
}

/**
 * Update input width to match text content
 * @param input - Input element to update
 */
function updateInputWidth(input: HTMLInputElement): void {
  // if input is empty, set width to 0 (cursor will show at prompt position)
  if (!input.value) {
    input.style.width = "0";
    return;
  }
  const font = getComputedStyle(input).font;
  const textWidth = measureTextWidth(input.value, font);
  // set input width to match text width exactly
  input.style.width = `${textWidth}px`;
}

/**
 * Update cursor position based on input selectionStart
 * @param input - Input element
 * @param cursor - Cursor element
 */
function updateCursorPosition(
  input: HTMLInputElement,
  cursor: HTMLElement,
): void {
  const cursorPos = input.selectionStart ?? input.value.length;
  const font = getComputedStyle(input).font;
  // measure width of text before cursor
  const textBeforeCursor = input.value.substring(0, cursorPos);
  const offsetLeft = measureTextWidth(textBeforeCursor, font);
  // position cursor using transform (preserve vertical centering)
  cursor.style.transform = `translate(${offsetLeft}px, -50%)`;
}

/**
 * All available terminal commands
 */
export const allCommands: Command[] = Object.values(commands);

/**
 * Initialize the terminal when DOM is ready
 */
function initTerminal(): void {
  const form = document.getElementById("terminal-form") as HTMLFormElement;
  const input = document.getElementById("terminal-input") as HTMLInputElement;
  const hints = document.getElementById("terminal-hints") as HTMLDivElement;
  const cursor = document.querySelector(".terminal-cursor") as HTMLElement;
  if (!form || !input || !cursor) {
    console.error("Terminal elements not found");
    return;
  }
  // execute welcome command on page load
  const welcomeCmd = allCommands.find((cmd) => cmd.name === "welcome");
  if (welcomeCmd) {
    executeCommand("welcome", allCommands).catch(console.error);
  }
  // auto-focus on desktop only (devices with hover and fine pointer)
  if (isDesktop()) {
    input.focus();
  }
  // focus input when clicking anywhere in terminal (unless text is selected)
  const container = document.getElementById("terminal-container");
  if (container) {
    container.addEventListener("click", (e) => {
      // handle spotify album image clicks
      const target = e.target as HTMLElement;
      if (target.classList.contains("spotify-album-image")) {
        const img = target as HTMLImageElement;
        const albumName = img.dataset.albumName || img.alt;
        openImageModal(
          img.src,
          img.alt,
          albumName,
        );
        return;
      }
      // don't interfere with text selection
      const selection = globalThis.getSelection();
      if (selection && selection.toString().length > 0) {
        return;
      }
      input.focus();
    });
  }
  // handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const command = input.value.trim();
    // check if we're in stdin mode
    if (isStdinModeActive()) {
      // in stdin mode: treat input as stdin line
      if (command) {
        addStdinLine(command);
      }
      input.value = "";
      updateInputWidth(input);
      updateCursorPosition(input, cursor);
      return;
    }
    // normal mode: execute command or show empty prompt
    if (command) {
      executeCommand(command, allCommands).catch(console.error);
      addCommandToHistory(command);
    } else {
      // empty enter: just show a new prompt line (like a real terminal)
      const historyEl = document.getElementById("terminal-history");
      if (historyEl) {
        const historyItem = document.createElement("div");
        historyItem.className = "terminal-history-item";
        const commandEl = document.createElement("div");
        commandEl.className =
          "terminal-history-command flex items-center gap-2";
        const promptSpan = document.createElement("span");
        promptSpan.className = "terminal-prompt";
        promptSpan.innerHTML = getPromptHtml();
        commandEl.appendChild(promptSpan);
        historyItem.appendChild(commandEl);
        historyEl.appendChild(historyItem);
        scrollToBottom();
      }
    }
    input.value = "";
    updateInputWidth(input);
    updateCursorPosition(input, cursor);
    // reset history pointer after submission
    setHistoryPointer(-1);
    hints.style.display = "none";
    hints.innerHTML = "";
  });
  // handle keyboard navigation and autocomplete
  input.addEventListener("keydown", (e) => {
    // ctrl+D - finish stdin mode or do nothing
    if (e.ctrlKey && e.key === "d") {
      e.preventDefault();
      if (isStdinModeActive()) {
        finishStdinMode().catch(console.error);
      }
      return;
    }
    // in stdin mode, disable most shortcuts except Ctrl+D
    if (isStdinModeActive()) {
      // allow normal typing and Enter, but block other shortcuts
      if (e.key === "Tab" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
      return;
    }
    // tab or Ctrl+I for autocomplete (normal mode only)
    if (e.key === "Tab" || (e.ctrlKey && e.key === "i")) {
      e.preventDefault();
      handleAutocomplete(input, hints, allCommands);
      updateInputWidth(input);
      input.setSelectionRange(input.value.length, input.value.length);
      updateCursorPosition(input, cursor);
    }
    // arrow Up - previous command (normal mode only)
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevCmd = getPreviousCommand();
      if (prevCmd !== null) {
        input.value = prevCmd;
        updateInputWidth(input);
        // move cursor to end of restored command
        input.setSelectionRange(input.value.length, input.value.length);
        updateCursorPosition(input, cursor);
      }
    }
    // arrow Down - next command (normal mode only)
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextCmd = getNextCommand();
      if (nextCmd !== null) {
        input.value = nextCmd;
        updateInputWidth(input);
        // move cursor to end of restored command
        input.setSelectionRange(input.value.length, input.value.length);
        updateCursorPosition(input, cursor);
      }
    }
    // readline-style keybindings (Emacs mode)
    if (e.ctrlKey) {
      switch (e.key) {
        // ctrl+A - move to beginning of line
        case "a":
          e.preventDefault();
          input.setSelectionRange(0, 0);
          updateCursorPosition(input, cursor);
          break;
        // ctrl+E - move to end of line
        case "e":
          e.preventDefault();
          input.setSelectionRange(input.value.length, input.value.length);
          updateCursorPosition(input, cursor);
          break;
        // ctrl+K - kill (cut) text from cursor to end of line
        case "k":
          e.preventDefault();
          {
            const cursorPos = input.selectionStart || 0;
            const textToKill = input.value.substring(cursorPos);
            if (textToKill) {
              // store in clipboard if available
              if (navigator.clipboard) {
                navigator.clipboard.writeText(textToKill).catch(() => {});
              }
              input.value = input.value.substring(0, cursorPos);
              updateInputWidth(input);
              updateCursorPosition(input, cursor);
            }
          }
          break;
        // ctrl+U - kill (cut) text from beginning to cursor
        case "u":
          e.preventDefault();
          {
            const cursorPos = input.selectionStart || 0;
            const textToKill = input.value.substring(0, cursorPos);
            if (textToKill) {
              // store in clipboard if available
              if (navigator.clipboard) {
                navigator.clipboard.writeText(textToKill).catch(() => {});
              }
              input.value = input.value.substring(cursorPos);
              input.setSelectionRange(0, 0);
              updateInputWidth(input);
              updateCursorPosition(input, cursor);
            }
          }
          break;
        // ctrl+W - delete word before cursor
        case "w":
          e.preventDefault();
          {
            const cursorPos = input.selectionStart || 0;
            const textBefore = input.value.substring(0, cursorPos);
            const textAfter = input.value.substring(cursorPos);
            // find the start of the word to delete
            const match = textBefore.match(/\s*\S+\s*$/);
            if (match) {
              const newPos = cursorPos - match[0].length;
              const deletedText = match[0];
              // store in clipboard if available
              if (navigator.clipboard) {
                navigator.clipboard.writeText(deletedText).catch(() => {});
              }
              input.value = textBefore.substring(0, newPos) + textAfter;
              input.setSelectionRange(newPos, newPos);
              updateInputWidth(input);
              updateCursorPosition(input, cursor);
            }
          }
          break;
        // ctrl+D - delete character at cursor (or exit if empty)
        case "d":
          e.preventDefault();
          {
            if (input.value === "") {
              // on empty line, could trigger exit behavior
              // for now, just do nothing
              break;
            }
            const cursorPos = input.selectionStart || 0;
            if (cursorPos < input.value.length) {
              input.value = input.value.substring(0, cursorPos) +
                input.value.substring(cursorPos + 1);
              input.setSelectionRange(cursorPos, cursorPos);
              updateInputWidth(input);
              updateCursorPosition(input, cursor);
            }
          }
          break;
        // ctrl+L - clear terminal
        case "l":
          e.preventDefault();
          {
            const clearCmd = allCommands.find((cmd) => cmd.name === "clear");
            if (clearCmd) {
              clearCmd.execute([]);
            }
          }
          break;
      }
    }
  });
  // clear hints when typing and update input width
  input.addEventListener("input", () => {
    hints.style.display = "none";
    hints.innerHTML = "";
    updateInputWidth(input);
    updateCursorPosition(input, cursor);
  });
  // update cursor position on selection change (arrow keys, click, etc.)
  input.addEventListener("keyup", (e) => {
    if (
      e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" ||
      e.key === "End"
    ) {
      updateCursorPosition(input, cursor);
    }
  });
  // update cursor position on mouse click within input
  input.addEventListener("click", () => {
    updateCursorPosition(input, cursor);
  });
  // initialize input width and cursor position
  updateInputWidth(input);
  updateCursorPosition(input, cursor);
  // prevent arrow keys from scrolling the page
  globalKeydownHandler = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
    }
  };
  globalThis.addEventListener("keydown", globalKeydownHandler);
}

// initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTerminal);
} else {
  initTerminal();
}

// reinitialize on SPA navigation
document.addEventListener("app:navigate", () => {
  cleanupTerminal();
  cancelStdinMode();
  clearRedirectCountdown();
  if (document.getElementById("terminal-form")) {
    initTerminal();
  }
});
