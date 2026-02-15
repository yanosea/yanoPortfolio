/**
 * Shared CSS class constants
 */

/**
 * CSS class names used in terminal output and structure
 */
export const CSS_CLASSES = {
  // terminal output states
  /** Error state class */
  ERROR: "terminal-error",
  /** Success state class */
  SUCCESS: "terminal-success",
  /** Info state class */
  INFO: "terminal-info",
  // terminal structure
  /** Link element class */
  LINK: "terminal-link",
  /** Command text class */
  COMMAND: "terminal-command",
  // terminal UI
  /** Prompt line class */
  PROMPT: "terminal-prompt",
  /** Username display class */
  USER: "terminal-user",
  /** Hostname display class */
  HOST: "terminal-host",
  /** Path display class */
  PATH: "terminal-path",
  // terminal history
  /** History item container class */
  HISTORY_ITEM: "terminal-history-item",
  /** History command text class */
  HISTORY_COMMAND: "terminal-history-command",
  /** History output text class */
  HISTORY_OUTPUT: "terminal-history-output",
  // spotify terminal output
  /** Spotify field key class */
  SPOTIFY_KEY: "spotify-key",
  /** Spotify field value class */
  SPOTIFY_VALUE: "spotify-value",
} as const;

export type CssClass = (typeof CSS_CLASSES)[keyof typeof CSS_CLASSES];

/**
 * Spotify field icons
 */
export const SPOTIFY_FIELD_ICONS = {
  /** Spotify logo icon */
  SPOTIFY:
    '<svg class="w-4 h-4 flex-shrink-0" style="display: inline-block; vertical-align: middle;" role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
  /** Clock icon for played time */
  PLAYED:
    '<svg class="w-4 h-4 flex-shrink-0" style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  /** Music note icon for track */
  TRACK:
    '<svg class="w-4 h-4 flex-shrink-0" style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  /** Disc icon for album */
  ALBUM:
    '<svg class="w-4 h-4 flex-shrink-0" style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>',
  /** Microphone icon for artist */
  ARTIST:
    '<svg class="w-4 h-4 flex-shrink-0" style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>',
} as const;

export type SpotifyFieldIcon =
  (typeof SPOTIFY_FIELD_ICONS)[keyof typeof SPOTIFY_FIELD_ICONS];
