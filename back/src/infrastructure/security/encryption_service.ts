/**
 * @fileoverview Web Crypto API based encryption service
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { EncryptionRepository } from "@/domain/security/encryption_repository.ts";

import { getEnvironmentUtils } from "../config/env_utils.ts";

/**
 * AES-GCM encryption service using Web Crypto API
 * @class EncryptionService
 */
export class EncryptionService implements EncryptionRepository {
  private static readonly ALGORITHM = "AES-GCM";
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly PBKDF2_ITERATIONS = 100000;
  private readonly envUtils = getEnvironmentUtils();

  /**
   * Derive encryption key from password using PBKDF2
   * @param {string} password - Master password
   * @param {Uint8Array} salt - Random salt
   * @returns {Promise<CryptoKey>} - Derived encryption key
   */
  private async deriveKey(
    password: string,
    salt: Uint8Array,
  ): Promise<CryptoKey> {
    // import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    // derive a key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations: EncryptionService.PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      {
        name: EncryptionService.ALGORITHM,
        length: EncryptionService.KEY_LENGTH,
      },
      false,
      ["encrypt", "decrypt"],
    );
  }

  /**
   * Encrypt sensitive data using AES-GCM
   * @param {string} data - Plain text data to encrypt
   * @returns {Promise<Result<string, DomainError>>} - Encrypted data as base64 string
   */
  async encrypt(data: string): Promise<Result<string, DomainError>> {
    // check if encryption is available
    try {
      if (!this.isAvailable()) {
        // if not available, return failure
        return Result.fail(
          new DomainError(
            "Encryption key not configured",
            "ENCRYPTION_UNAVAILABLE",
          ),
        );
      }
      // generate random salt
      const salt = crypto.getRandomValues(
        new Uint8Array(EncryptionService.SALT_LENGTH),
      );
      // generate random IV
      const iv = crypto.getRandomValues(
        new Uint8Array(EncryptionService.IV_LENGTH),
      );
      // derive encryption key
      const encryptionKey = this.envUtils.getEncryptionKey();
      const key = await this.deriveKey(encryptionKey, salt);
      // encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        { name: EncryptionService.ALGORITHM, iv },
        key,
        new TextEncoder().encode(data),
      );
      // combine salt + iv + encrypted data
      const combined = new Uint8Array(
        EncryptionService.SALT_LENGTH +
          EncryptionService.IV_LENGTH +
          encrypted.byteLength,
      );
      combined.set(salt, 0);
      combined.set(iv, EncryptionService.SALT_LENGTH);
      combined.set(
        new Uint8Array(encrypted),
        EncryptionService.SALT_LENGTH + EncryptionService.IV_LENGTH,
      );
      // convert to base64
      const base64 = btoa(String.fromCharCode(...combined));
      // succeeded to encrypt
      console.log("Data encrypted successfully");
      return Result.ok(base64);
    } catch (error) {
      // if any error occurs, return failure
      console.error("Encryption failed:", error);
      return Result.fail(
        new DomainError(
          `Encryption failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "ENCRYPTION_ERROR",
        ),
      );
    }
  }

  /**
   * Decrypt sensitive data using AES-GCM
   * @param {string} encryptedData - Base64 encoded encrypted data
   * @returns {Promise<Result<string, DomainError>>} - Decrypted plain text data
   */
  async decrypt(encryptedData: string): Promise<Result<string, DomainError>> {
    // check if encryption is available
    try {
      if (!this.isAvailable()) {
        // if not available, return failure
        return Result.fail(
          new DomainError(
            "Encryption key not configured",
            "ENCRYPTION_UNAVAILABLE",
          ),
        );
      }
      // decode from base64
      const combined = new Uint8Array(
        atob(encryptedData).split("").map((char) => char.charCodeAt(0)),
      );
      // extract salt, IV, and encrypted data
      const salt = combined.slice(0, EncryptionService.SALT_LENGTH);
      const iv = combined.slice(
        EncryptionService.SALT_LENGTH,
        EncryptionService.SALT_LENGTH + EncryptionService.IV_LENGTH,
      );
      // encrypted data
      const encrypted = combined.slice(
        EncryptionService.SALT_LENGTH + EncryptionService.IV_LENGTH,
      );
      // derive decryption key
      const encryptionKey = this.envUtils.getEncryptionKey();
      const key = await this.deriveKey(encryptionKey, salt);
      // decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: EncryptionService.ALGORITHM, iv },
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
      console.error("Decryption failed:", error);
      return Result.fail(
        new DomainError(
          `Decryption failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "DECRYPTION_ERROR",
        ),
      );
    }
  }

  /**
   * Check if encryption is available
   * @returns {boolean} - True if encryption service is properly configured
   */
  isAvailable(): boolean {
    try {
      const encryptionKey = this.envUtils.getEncryptionKey();
      return encryptionKey !== null && encryptionKey.length >= 32;
    } catch {
      return false;
    }
  }
}
