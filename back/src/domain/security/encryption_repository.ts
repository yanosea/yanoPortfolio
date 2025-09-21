/**
 * @fileoverview Encryption repository interface
 */

// domain
import type { Result } from "@/domain/common/result.ts";
import type { DomainError } from "@/domain/error/error.ts";

/**
 * Encryption repository interface for secure data handling
 * @interface EncryptionRepository
 */
export interface EncryptionRepository {
  /**
   * Encrypt sensitive data
   * @param {string} data - Plain text data to encrypt
   * @returns {Promise<Result<string, DomainError>>} - Encrypted data as base64 string
   */
  encrypt(data: string): Promise<Result<string, DomainError>>;

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Base64 encoded encrypted data
   * @returns {Promise<Result<string, DomainError>>} - Decrypted plain text data
   */
  decrypt(encryptedData: string): Promise<Result<string, DomainError>>;

  /**
   * Check if encryption is available
   * @returns {boolean} - True if encryption service is properly configured
   */
  isAvailable(): boolean;
}
