/**
 * Web Crypto API based encryption service
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { ERROR_CODES } from "@/domain/error/error_codes.ts";
import { DomainError } from "@/domain/error/error.ts";
import { EncryptionRepository } from "@/domain/security/encryption_repository.ts";

import { getEnvironmentUtils } from "../config/env_utils.ts";
import { ENCRYPTION_CONFIG } from "./encryption_constants.ts";

/**
 * AES-GCM encryption service using Web Crypto API
 */
export class EncryptionService implements EncryptionRepository {
  private readonly envUtils = getEnvironmentUtils();

  /**
   * Derive encryption key from password using PBKDF2
   * @param password - Master password
   * @param salt - Random salt
   * @returns Derived encryption key
   */
  private async deriveKey(
    password: string,
    salt: Uint8Array,
  ): Promise<CryptoKey> {
    // import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      ENCRYPTION_CONFIG.KEY_DERIVATION_ALGORITHM,
      false,
      ["deriveKey"],
    );
    // derive a key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: ENCRYPTION_CONFIG.KEY_DERIVATION_ALGORITHM,
        salt: salt as BufferSource,
        iterations: ENCRYPTION_CONFIG.PBKDF2_ITERATIONS,
        hash: ENCRYPTION_CONFIG.HASH_ALGORITHM,
      },
      keyMaterial,
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        length: ENCRYPTION_CONFIG.KEY_LENGTH,
      },
      false,
      ["encrypt", "decrypt"],
    );
  }

  /**
   * Encrypt sensitive data using AES-GCM
   * @param data - Plain text data to encrypt
   * @returns Encrypted data as base64 string
   */
  async encrypt(data: string): Promise<Result<string, DomainError>> {
    // check if encryption is available
    try {
      if (!this.isAvailable()) {
        // if not available, return failure
        return Result.fail(
          new DomainError(
            "Encryption key not configured",
            ERROR_CODES.ENCRYPTION_UNAVAILABLE,
          ),
        );
      }
      // generate random salt
      const salt = crypto.getRandomValues(
        new Uint8Array(ENCRYPTION_CONFIG.SALT_LENGTH),
      );
      // generate random IV
      const iv = crypto.getRandomValues(
        new Uint8Array(ENCRYPTION_CONFIG.IV_LENGTH),
      );
      // derive encryption key
      const encryptionKey = this.envUtils.getEncryptionKey();
      const key = await this.deriveKey(encryptionKey, salt);
      // encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        { name: ENCRYPTION_CONFIG.ALGORITHM, iv },
        key,
        new TextEncoder().encode(data),
      );
      // combine salt + iv + encrypted data
      const combined = new Uint8Array(
        ENCRYPTION_CONFIG.SALT_LENGTH +
          ENCRYPTION_CONFIG.IV_LENGTH +
          encrypted.byteLength,
      );
      combined.set(salt, 0);
      combined.set(iv, ENCRYPTION_CONFIG.SALT_LENGTH);
      combined.set(
        new Uint8Array(encrypted),
        ENCRYPTION_CONFIG.SALT_LENGTH + ENCRYPTION_CONFIG.IV_LENGTH,
      );
      // convert to base64
      const base64 = btoa(String.fromCharCode(...combined));
      // succeeded to encrypt
      console.log("Data encrypted successfully");
      return Result.ok(base64);
    } catch (error) {
      // if any error occurs, return failure
      console.error(
        "Encryption failed:",
        error instanceof Error ? error.message : String(error),
      );
      return Result.fail(
        new DomainError(
          `Encryption failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          ERROR_CODES.ENCRYPTION_ERROR,
        ),
      );
    }
  }

  /**
   * Decrypt sensitive data using AES-GCM
   * @param encryptedData - Base64 encoded encrypted data
   * @returns Decrypted plain text data
   */
  async decrypt(encryptedData: string): Promise<Result<string, DomainError>> {
    // check if encryption is available
    try {
      if (!this.isAvailable()) {
        // if not available, return failure
        return Result.fail(
          new DomainError(
            "Encryption key not configured",
            ERROR_CODES.ENCRYPTION_UNAVAILABLE,
          ),
        );
      }
      // decode from base64
      const combined = new Uint8Array(
        atob(encryptedData).split("").map((char) => char.charCodeAt(0)),
      );
      // extract salt, IV, and encrypted data
      const salt = combined.slice(0, ENCRYPTION_CONFIG.SALT_LENGTH);
      const iv = combined.slice(
        ENCRYPTION_CONFIG.SALT_LENGTH,
        ENCRYPTION_CONFIG.SALT_LENGTH + ENCRYPTION_CONFIG.IV_LENGTH,
      );
      // encrypted data
      const encrypted = combined.slice(
        ENCRYPTION_CONFIG.SALT_LENGTH + ENCRYPTION_CONFIG.IV_LENGTH,
      );
      // derive decryption key
      const encryptionKey = this.envUtils.getEncryptionKey();
      const key = await this.deriveKey(encryptionKey, salt);
      // decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: ENCRYPTION_CONFIG.ALGORITHM, iv },
        key,
        encrypted,
      );
      // convert decrypted data to string
      const plaintext = new TextDecoder().decode(decrypted);
      // succeeded to decrypt
      console.log("Data decrypted successfully");
      return Result.ok(plaintext);
    } catch (error) {
      // if any error occurs, return failure
      console.error(
        "Decryption failed:",
        error instanceof Error ? error.message : String(error),
      );
      return Result.fail(
        new DomainError(
          `Decryption failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          ERROR_CODES.DECRYPTION_ERROR,
        ),
      );
    }
  }

  /**
   * Check if encryption is available
   * @returns True if encryption service is properly configured
   */
  isAvailable(): boolean {
    try {
      const encryptionKey = this.envUtils.getEncryptionKey();
      return encryptionKey !== null &&
        encryptionKey.length >= ENCRYPTION_CONFIG.MIN_KEY_LENGTH;
    } catch {
      return false;
    }
  }
}
