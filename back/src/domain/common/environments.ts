/**
 * Environment interface for domain layer
 */

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  /** Cache TTL in seconds */
  readonly CACHE_TTL_SECONDS: string;
  /** CORS enabled flag */
  readonly CORS_ENABLED: string;
  /** CORS origins */
  readonly CORS_ORIGINS: string;
  /** Encryption key */
  readonly ENCRYPTION_KEY: string;
  /** Spotify client ID */
  readonly SPOTIFY_CLIENT_ID: string;
  /** Spotify client secret */
  readonly SPOTIFY_CLIENT_SECRET: string;
  /** Spotify refresh token */
  readonly SPOTIFY_REFRESH_TOKEN: string;
  /** Token buffer time in milliseconds */
  readonly TOKEN_BUFFER_TIME_MS: string;
  /** yanoPortfolio back cache KV namespace */
  readonly YANOPORTFOLIO_BACK_CACHE: KVNamespace;
}
