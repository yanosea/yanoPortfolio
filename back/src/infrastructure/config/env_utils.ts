/**
 * Environment utility functions for domain layer
 */

// domain
import { EnvironmentConfig } from "@/domain/common/environments.ts";
import { ConfigurationError } from "@/domain/error/error.ts";

/**
 * Singleton instance for EnvironmentUtils
 */
let environmentUtils: EnvironmentUtils | null = null;

/**
 * Get EnvironmentUtils singleton instance
 * @returns EnvironmentUtils instance
 */
export function getEnvironmentUtils(): EnvironmentUtils {
  if (!environmentUtils) {
    // if environmentUtils is not initialized, throw error
    throw new ConfigurationError(
      "Environment configuration not initialized. Call initializeEnvironmentUtils first.",
    );
  }
  return environmentUtils;
}

/**
 * Initialize EnvironmentUtils singleton
 * @param env - Environment configuration
 */
export function initializeEnvironmentUtils(
  env: EnvironmentConfig,
): void {
  if (!environmentUtils) {
    environmentUtils = new EnvironmentUtils(env);
  }
}

/**
 * Type-safe environment configuration utilities
 */
export class EnvironmentUtils {
  /**
   * Construct a new EnvironmentUtils
   * @param env - Environment configuration
   */
  constructor(private env: EnvironmentConfig) {}

  /**
   * Get Spotify client ID
   * @returns Spotify client ID
   */
  getSpotifyClientId(): string {
    return this.getRequired(this.env.SPOTIFY_CLIENT_ID, "SPOTIFY_CLIENT_ID");
  }

  /**
   * Get Spotify client secret
   * @returns Spotify client secret
   */
  getSpotifyClientSecret(): string {
    return this.getRequired(
      this.env.SPOTIFY_CLIENT_SECRET,
      "SPOTIFY_CLIENT_SECRET",
    );
  }

  /**
   * Get Spotify refresh token
   * @returns Spotify Refresh Token
   */
  getSpotifyRefreshToken(): string {
    return this.getRequired(
      this.env.SPOTIFY_REFRESH_TOKEN,
      "SPOTIFY_REFRESH_TOKEN",
    );
  }

  /**
   * Get Spotify cache setting
   * @returns Spotify Cache TTL in seconds
   */
  getCacheTtlSeconds(): number {
    return this.getAsNumber(this.env.CACHE_TTL_SECONDS, "CACHE_TTL_SECONDS");
  }

  /**
   * Get CORS enabled setting
   * @returns CORS enabled
   */
  isCorsEnabled(): boolean {
    return this.getAsBoolean(this.env.CORS_ENABLED, "CORS_ENABLED");
  }

  /**
   * Get CORS origins
   * @returns CORS origins
   */
  getCorsOrigins(): string[] {
    const value = this.getRequired(this.env.CORS_ORIGINS, "CORS_ORIGINS");
    if (value === "*") {
      return ["*"];
    }
    return value.split(",").map((origin) => origin.trim()).filter(Boolean);
  }

  /**
   * Get token buffer time (ms)
   * @returns Token Buffer Time in milliseconds
   */
  getTokenBufferTimeMs(): number {
    return this.getAsNumber(
      this.env.TOKEN_BUFFER_TIME_MS,
      "TOKEN_BUFFER_TIME_MS",
    );
  }

  /**
   * Get encryption Key
   * @returns Encryption Key for secure token storage
   */
  getEncryptionKey(): string {
    return this.getRequired(this.env.ENCRYPTION_KEY, "ENCRYPTION_KEY");
  }

  /**
   * Check if local development
   * @returns True if local development
   */
  isLocalDevelopment(): boolean {
    try {
      // try to access KV namespace - if it exists and has proper methods, we're in production
      const kv = this.env.YANOPORTFOLIO_BACK_CACHE;
      if (kv && typeof kv.put === "function" && typeof kv.get === "function") {
        return kv.constructor.name === "RpcKVNamespace";
      }
      // if KV namespace is not defined or doesn't have proper methods, assume local development
      return true;
    } catch {
      // if any error occurs, assume local development
      return true;
    }
  }

  /**
   * Validate all environment variables
   */
  validateAllEnvironment(): void {
    // cache configuration
    this.getCacheTtlSeconds();
    // CORS configuration
    this.isCorsEnabled();
    this.getCorsOrigins();
    // security configuration
    this.getEncryptionKey();
    // Spotify configuration
    this.getSpotifyClientId();
    this.getSpotifyClientSecret();
    this.getSpotifyRefreshToken();
    // token configuration
    this.getTokenBufferTimeMs();
  }

  /**
   * Get required environment variable or throw error
   * @param value - Environment variable value
   * @param varName - Environment variable name
   * @returns Environment variable value
   */
  private getRequired(value: string | undefined, varName: string): string {
    if (!value || value === "") {
      throw new ConfigurationError(
        `Required environment variable '${varName}' is not set`,
      );
    }
    return value;
  }

  /**
   * Get environment variable as number or throw error
   * @param value - Environment variable value
   * @param varName - Environment variable name
   * @returns Parsed number value
   */
  private getAsNumber(value: string | undefined, varName: string): number {
    const str = this.getRequired(value, varName);
    const parsed = parseInt(str, 10);
    if (isNaN(parsed)) {
      throw new ConfigurationError(
        `Environment variable '${varName}' must be a valid number, got: ${str}`,
      );
    }
    return parsed;
  }

  /**
   * Get environment variable as boolean or throw error
   * @param value - Environment variable value
   * @param varName - Environment variable name
   * @returns Parsed boolean value
   */
  private getAsBoolean(value: string | undefined, varName: string): boolean {
    const str = this.getRequired(value, varName);
    return str.toLowerCase() === "true";
  }
}
