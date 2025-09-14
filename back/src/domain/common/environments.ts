/**
 * @fileoverview Environment interface for domain layer
 */

/**
 * Environment configuration interface
 * @interface EnvironmentConfig
 */
export interface EnvironmentConfig {
  readonly CACHE_TTL_SECONDS: string;
  readonly CORS_ENABLED: string;
  readonly CORS_ORIGINS: string;
  readonly YANOPORTFOLIO_BACK_CACHE: KVNamespace;
  readonly SPOTIFY_CLIENT_ID: string;
  readonly SPOTIFY_CLIENT_SECRET: string;
  readonly SPOTIFY_REFRESH_TOKEN: string;
  readonly TOKEN_BUFFER_TIME_MS: string;
}
