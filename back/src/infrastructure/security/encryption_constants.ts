/**
 * Encryption constants
 */

/**
 * AES-GCM encryption configuration
 */
export const ENCRYPTION_CONFIG = {
  /** Encryption algorithm */
  ALGORITHM: "AES-GCM",
  /** Hash algorithm for key derivation */
  HASH_ALGORITHM: "SHA-256",
  /** Initialization vector length in bytes */
  IV_LENGTH: 12,
  /** Key derivation algorithm */
  KEY_DERIVATION_ALGORITHM: "PBKDF2",
  /** Key length in bits */
  KEY_LENGTH: 256,
  /** Minimum encryption key length */
  MIN_KEY_LENGTH: 32,
  /** PBKDF2 iteration count */
  PBKDF2_ITERATIONS: 10000,
  /** Salt length in bytes */
  SALT_LENGTH: 16,
} as const;
