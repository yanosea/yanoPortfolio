/**
 * Niconico-style Lyrics Renderer
 *
 * Renders lyrics as flowing text over the modal image,
 * scrolling from right to left like niconico comments.
 * Also renders decorative niconico-style comments alongside lyrics.
 */

import {
  FIXED_COMMENTS,
  FIXED_DECORATIONS,
  generateApplause,
  generateKita,
  generateLaughter,
  KAOMOJI,
  REPEATABLE_DECORATIONS,
} from "./decorations/index.ts";

/** Possible intervals between each lyrics line (ms) */
const LYRICS_INTERVALS = [3000, 3500, 4000, 4500, 5000];

/** Flow animation duration range (seconds) */
const FLOW_DURATION_MIN = 3;
const FLOW_DURATION_MAX = 8;

/** Font size CSS variable names for lyrics */
const LYRICS_FONT_SIZE_VARS = [
  "--font-size-xl",
  "--font-size-2xl",
  "--font-size-3xl",
  "--font-size-4xl",
  "--font-size-5xl",
];

/** Font size CSS variable names for decoration comments */
const DECORATION_FONT_SIZE_VARS = [
  "--font-size-large",
  "--font-size-xl",
  "--font-size-2xl",
  "--font-size-3xl",
  "--font-size-4xl",
];

/** Interval range for decoration comments (ms) */
const DECORATION_INTERVAL_MIN = 200;
const DECORATION_INTERVAL_MAX = 1000;

/** Viewport-based decoration interval scale steps [minWidth, multiplier] */
const DECORATION_SCALE_STEPS: [number, number][] = [
  [1920, 1.0],
  [1600, 1.1],
  [1280, 1.2],
  [960, 1.3],
  [640, 1.4],
  [0, 1.5],
];

/** Viewport-based flow duration scale steps [minWidth, multiplier] */
const FLOW_DURATION_SCALE_STEPS: [number, number][] = [
  [1920, 1.0],
  [1280, 0.9],
  [960, 0.8],
  [640, 0.7],
  [0, 0.6],
];

/** Active timer IDs for cleanup */
let activeTimers: number[] = [];

/** Reference to the overlay element */
let overlayElement: HTMLElement | null = null;

/**
 * Pick a random element from an array
 * @param arr - Source array
 * @returns Random element
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a random decoration comment
 *
 * @returns Random decoration text
 */
function generateDecoration(): string {
  const candidates: (() => string)[] = [
    generateApplause,
    generateLaughter,
    generateKita,
    ...FIXED_COMMENTS.map((text) => () => text),
    ...REPEATABLE_DECORATIONS.map((char) => () => {
      const count = 1 + Math.floor(Math.random() * 10);
      return char.repeat(count);
    }),
    ...FIXED_DECORATIONS.map((pattern) => () => {
      const count = 1 + Math.floor(Math.random() * 3);
      return pattern.repeat(count);
    }),
    ...KAOMOJI.map((text) => () => text),
  ];
  return pickRandom(candidates)();
}

/**
 * Get a random vertical position for a line
 * @returns Top percentage value (10%-90%)
 */
function getRandomLanePosition(): number {
  return 10 + Math.random() * 80;
}

/**
 * Create and animate a single line element
 * @param text - Text to display
 * @param cssClass - CSS class for styling
 * @param fontSizeVars - CSS variable names for random font size
 */
function renderLine(
  text: string,
  cssClass: string,
  fontSizeVars: string[],
): void {
  if (!overlayElement) return;
  const el = document.createElement("span");
  el.className = cssClass;
  el.textContent = text;
  el.style.top = `${getRandomLanePosition()}%`;
  const vw = globalThis.innerWidth;
  // last entry [0, ...] always matches as fallback
  const durationScale =
    FLOW_DURATION_SCALE_STEPS.find(([minW]) => vw >= minW)![1];
  const duration = (FLOW_DURATION_MIN +
    Math.random() * (FLOW_DURATION_MAX - FLOW_DURATION_MIN)) *
    durationScale;
  el.style.setProperty("--lyrics-duration", `${duration}s`);
  el.style.fontSize = `var(${pickRandom(fontSizeVars)})`;
  overlayElement.appendChild(el);
  // remove element after animation completes
  const timerId = globalThis.setTimeout(() => {
    el.remove();
  }, duration * 1000);
  activeTimers.push(timerId);
}

/**
 * Start rendering lyrics lines at random intervals
 * @param lines - Lyric text lines
 */
function startLyricsFlow(lines: string[]): void {
  lines.forEach((line, i) => {
    const interval =
      LYRICS_INTERVALS[Math.floor(Math.random() * LYRICS_INTERVALS.length)];
    const delay = i * interval;
    const timerId = globalThis.setTimeout(() => {
      renderLine(line, "lyrics-line", LYRICS_FONT_SIZE_VARS);
    }, delay);
    activeTimers.push(timerId);
  });
}

/**
 * Start rendering decoration comments continuously
 */
function startDecorationFlow(): void {
  const scheduleNext = () => {
    const vw = globalThis.innerWidth;
    // last entry [0, ...] always matches as fallback
    const scale = DECORATION_SCALE_STEPS.find(([minW]) => vw >= minW)![1];
    const interval = (DECORATION_INTERVAL_MIN +
      Math.random() * (DECORATION_INTERVAL_MAX - DECORATION_INTERVAL_MIN)) *
      scale;
    const timerId = globalThis.setTimeout(() => {
      renderLine(
        generateDecoration(),
        "decoration-line",
        DECORATION_FONT_SIZE_VARS,
      );
      scheduleNext();
    }, interval);
    activeTimers.push(timerId);
  };
  scheduleNext();
}

/**
 * Start lyrics and decoration rendering on the overlay
 * @param lines - Lyric text lines to render
 * @param overlay - The overlay HTML element
 */
export function startLyrics(
  lines: string[],
  overlay: HTMLElement,
): void {
  // clean up any previous rendering
  stopLyrics();
  overlayElement = overlay;
  startLyricsFlow(lines);
  startDecorationFlow();
}

/**
 * Stop lyrics rendering and clean up
 */
export function stopLyrics(): void {
  // clear all scheduled timers
  for (const timerId of activeTimers) {
    globalThis.clearTimeout(timerId);
  }
  activeTimers = [];
  // remove all lyric elements from overlay
  if (overlayElement) {
    overlayElement.replaceChildren();
    overlayElement = null;
  }
}
