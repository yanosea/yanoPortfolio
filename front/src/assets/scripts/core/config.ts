/**
 * Application configuration
 */

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  /** Storage key */
  STORAGE_KEY: "theme",
  /** Dark theme */
  DARK: "dark",
  /** Light theme */
  LIGHT: "light",
} as const;
export type Theme = typeof THEME_CONFIG.DARK | typeof THEME_CONFIG.LIGHT;

/**
 * API configuration
 */
export const API_CONFIG = {
  /** Development configuration */
  development: {
    /** Base URL for local development */
    baseUrl: "http://localhost:8080",
  },
  /** Spotify API configuration */
  spotify: {
    /** Endpoints for Spotify API */
    endpoints: {
      /** Now playing track endpoint */
      nowPlaying: "/spotify/now-playing",
      /** Last played track endpoint */
      lastPlayed: "/spotify/last-played",
    },
    /** Update interval in milliseconds */
    updateInterval: 60000,
  },
} as const;

/**
 * Timing configuration
 */
interface TimingConfig {
  /** Countdown seconds before redirect */
  redirectCountdownSeconds: number;
  /** Countdown interval in milliseconds */
  countdownInterval: number;
  /** Icon fade delay in milliseconds */
  iconFadeDelay: number;
}

export const TIMING_CONFIG: TimingConfig = {
  redirectCountdownSeconds: 2,
  countdownInterval: 1000,
  iconFadeDelay: 100,
};

/**
 * Filesystem display configuration
 */
export const FILESYSTEM_CONFIG = {
  /** Bytes per unit conversion factor */
  unitConversion: 1024,
  /** Default directory size in bytes */
  directorySize: 4096,
  /** Default file size in bytes */
  fileSize: 1024,
} as const;

/**
 * Spotify terminal display configuration
 */
export const SPOTIFY_DISPLAY_CONFIG = {
  /** Font family for terminal display */
  fontFamily: "M PLUS 1 Code",
  /** Line height for terminal display */
  lineHeight: 1.8,
  /** Margin around album art image */
  imageMargin: "2ch",
} as const;

/**
 * Page routing configuration
 */
export const ROUTING_CONFIG = {
  /** Page paths */
  pages: {
    /** About page */
    about: "/about.html",
    /** Blog page */
    blog: "/blog.html",
    /** Links page */
    links: "/links.html",
    /** Home page */
    home: "/",
  },
} as const;

/**
 * Spotify widget element IDs
 */
export const SPOTIFY_ELEMENT_IDS = {
  /** Status container element */
  container: "spotify-status-container",
  /** Content wrapper element */
  content: "spotify-content",
  /** Album art image element */
  albumImage: "spotify-album-image",
  /** Status text element */
  statusText: "spotify-status-text",
  /** Played at timestamp element */
  playedAt: "spotify-played-at",
  /** Track link element */
  trackLink: "spotify-track-link",
  /** Album link element */
  albumLink: "spotify-album-link",
  /** Artist link element */
  artistLink: "spotify-artist-link",
  /** Loading indicator element */
  loading: "spotify-loading",
  /** Error display element */
  error: "spotify-error",
  /** Spotify icon element */
  icon: "spotify-icon",
  /** Album image button element */
  albumImageButton: "spotify-album-image-button",
  /** Toggle button element */
  toggleButton: "spotify-toggle",
} as const;

/**
 * Site data from body data attributes
 */

/**
 * Get site name from body data attribute
 * @returns Site name string
 */
export function getSiteName(): string {
  return document.body.dataset.siteName ?? "";
}

/**
 * Get owner username from body data attribute
 * @returns Username string
 */
export function getUsername(): string {
  return document.body.dataset.username ?? "";
}

/**
 * Get GitHub repository from body data attribute
 * @returns GitHub repository in owner/repo format
 */
function getGithubRepo(): string {
  return document.body.dataset.githubRepo ?? "";
}

/**
 * Get GitHub tags API URL
 * @returns GitHub tags API URL
 */
export function getGithubTagsUrl(): string {
  const repo = getGithubRepo();
  return `https://api.github.com/repos/${repo}/tags`;
}

/**
 * Get GitHub releases URL for a tag
 * @param tagName - Git tag name
 * @returns GitHub releases URL
 */
export function getGithubReleasesUrl(tagName: string): string {
  const repo = getGithubRepo();
  return `https://github.com/${repo}/releases/tag/${tagName}`;
}

/**
 * Utility functions
 */

/**
 * Check if the current environment is development
 * @returns True if running on localhost
 */
function isDevelopment(): boolean {
  return ["localhost", "127.0.0.1"].includes(globalThis.location.hostname);
}

/**
 * Get API base URL based on current environment
 * @returns API base URL
 */
export function getApiBaseUrl(): string {
  if (isDevelopment()) {
    return API_CONFIG.development.baseUrl;
  }
  const siteName = getSiteName();
  return `https://api.${siteName}`;
}

/**
 * Get full Spotify API endpoint URL
 * @param endpoint - Spotify API endpoint key
 * @returns Full Spotify API endpoint URL
 */
export function getSpotifyEndpoint(
  endpoint: keyof typeof API_CONFIG.spotify.endpoints,
): string {
  const baseUrl = getApiBaseUrl();
  const path = API_CONFIG.spotify.endpoints[endpoint];
  return `${baseUrl}${path}`;
}
