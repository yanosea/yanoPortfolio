/**
 * Domain error codes
 */

/**
 * Error codes for domain errors
 */
export const ERROR_CODES = {
  /** Cache operation failed */
  CACHE_ERROR: "CACHE_ERROR",
  /** Decryption failed */
  DECRYPTION_ERROR: "DECRYPTION_ERROR",
  /** Encryption failed */
  ENCRYPTION_ERROR: "ENCRYPTION_ERROR",
  /** Encryption is not available */
  ENCRYPTION_UNAVAILABLE: "ENCRYPTION_UNAVAILABLE",
} as const;
