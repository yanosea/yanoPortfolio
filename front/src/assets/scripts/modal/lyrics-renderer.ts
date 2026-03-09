/**
 * Niconico-style Lyrics Renderer
 *
 * Renders lyrics as flowing text over the modal image,
 * scrolling from right to left like niconico comments.
 * Also renders decorative niconico-style comments alongside lyrics.
 */

/** Possible intervals between each lyrics line (ms) */
const LYRICS_INTERVALS = [500, 1000, 1500, 2000, 2500, 3000];

/** Flow animation duration range (seconds) */
const FLOW_DURATION_MIN = 2;
const FLOW_DURATION_MAX = 10;

/** Font size CSS variable names from typography.css */
const FONT_SIZE_VARS = [
  "--font-size-large",
  "--font-size-xl",
  "--font-size-2xl",
  "--font-size-3xl",
  "--font-size-4xl",
  "--font-size-5xl",
];

/** Interval range for decoration comments (ms) */
const DECORATION_INTERVAL_MIN = 200;
const DECORATION_INTERVAL_MAX = 800;

/** Fixed comment texts */
const FIXED_COMMENTS = [
  "ktkr",
  "wktk",
  "GJ",
  "ここすき",
  "神曲",
  "鳥肌",
  "いいね",
  "泣ける",
  "最高",
  "わかる",
  "すこ",
  "草",
  "天才",
  "うますぎ",
  "職人",
  "もっと評価されるべき",
];

/** Repeatable decoration characters */
const REPEATABLE_DECORATIONS = ["☆", "★", "✦", "✧", "♪", "♫", "✿", "❀"];

/** Fixed decoration patterns */
const FIXED_DECORATIONS = [
  "━━━━━━☆",
  "・*:.｡. .｡.:*・゜",
  "⋆｡˚ ☁︎ ˚｡⋆",
];

/** Kaomoji */
const KAOMOJI = [
  "(・∀・)",
  "(´∀｀*)",
  "(｀・ω・´)",
  "(´・ω・`)",
  "\\(^o^)／",
  "(ﾟдﾟ)",
  "(*´ω`*)",
  "(ノ´∀`*)ノ",
  "( ˘ω˘ )",
  "(っ´ω`c)",
  "(*ﾟ▽ﾟ*)",
  "(ﾉ∀`)",
  "( ﾟДﾟ)",
  "(  ´∀｀)ﾉ",
  "ヽ(´ー｀)ノ",
  "(ﾟ∀ﾟ)ｱﾋｬ",
  "ｷﾀ(ﾟ∀ﾟ)ｺﾚ",
  "(´;ω;`)",
  "( ;∀;)",
  "(°▽°)",
  "＼(＾o＾)／",
  "(っ˘ω˘c)",
  "(*´∀`*)",
  "(ﾟ∀ﾟ≡ﾟ∀ﾟ)",
];

/** Active timer IDs for cleanup */
let activeTimers: number[] = [];

/** Reference to the overlay element */
let overlayElement: HTMLElement | null = null;

/**
 * Generate a random repeat of "8" for applause
 * @returns Applause string (e.g., "88888888")
 */
function generateApplause(): string {
  const count = 8 + Math.floor(Math.random() * 40);
  return "8".repeat(count);
}

/**
 * Generate "ｷﾀ――(ﾟ∀ﾟ)――!!" with random dash count
 * @returns Kita string
 */
function generateKita(): string {
  const count = 4 + Math.floor(Math.random() * 20);
  const dashes = "―".repeat(count);
  return `ｷﾀ${dashes}(ﾟ∀ﾟ)${dashes}!!`;
}

/**
 * Generate a random repeat of "w" for laughter
 * @returns Laughter string (e.g., "wwwww")
 */
function generateLaughter(): string {
  const count = 4 + Math.floor(Math.random() * 28);
  return "w".repeat(count);
}

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
 * @returns Random decoration text
 */
function generateDecoration(): string {
  const generators = [
    generateApplause,
    generateLaughter,
    generateKita,
    () => pickRandom(FIXED_COMMENTS),
    () => {
      const char = pickRandom(REPEATABLE_DECORATIONS);
      const count = 1 + Math.floor(Math.random() * 10);
      return char.repeat(count);
    },
    () => {
      const pattern = pickRandom(FIXED_DECORATIONS);
      const count = 1 + Math.floor(Math.random() * 3);
      return pattern.repeat(count);
    },
    () => pickRandom(KAOMOJI),
  ];
  return pickRandom(generators)();
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
 */
function renderLine(text: string, cssClass: string): void {
  if (!overlayElement) return;
  const el = document.createElement("span");
  el.className = cssClass;
  el.textContent = text;
  el.style.top = `${getRandomLanePosition()}%`;
  const duration = FLOW_DURATION_MIN +
    Math.random() * (FLOW_DURATION_MAX - FLOW_DURATION_MIN);
  el.style.setProperty("--lyrics-duration", `${duration}s`);
  // random font size using typography.css variables
  el.style.fontSize = `var(${pickRandom(FONT_SIZE_VARS)})`;
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
      renderLine(line, "lyrics-line");
    }, delay);
    activeTimers.push(timerId);
  });
}

/**
 * Start rendering decoration comments continuously
 */
function startDecorationFlow(): void {
  const scheduleNext = () => {
    const interval = DECORATION_INTERVAL_MIN +
      Math.random() * (DECORATION_INTERVAL_MAX - DECORATION_INTERVAL_MIN);
    const timerId = globalThis.setTimeout(() => {
      renderLine(generateDecoration(), "decoration-line");
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
