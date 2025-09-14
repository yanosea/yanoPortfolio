/**
 * @fileoverview Domain Error types
 */

/**
 * Base Domain Error
 * @class DomainError
 */
export class DomainError extends Error {
  /**
   * Construct a new DomainError
   * @param {string} message - Error message
   * @param {string} code - Error code
   */
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Validation Error
 * @class ValidationError
 */
export class ValidationError extends DomainError {
  /**
   * Construct a new ValidationError
   * @param {string} message - Message
   */
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/**
 * External Service Error
 * @class ExternalServiceError
 */
export class ExternalServiceError extends DomainError {
  /**
   * Construct a new ExternalServiceError
   * @param {string} message - Message
   * @param {string} service - Service name
   */
  constructor(
    message: string,
    public readonly service: string,
  ) {
    super(message, "EXTERNAL_SERVICE_ERROR");
    this.name = "ExternalServiceError";
  }
}

/**
 * Configuration Error
 * @class ConfigurationError
 */
export class ConfigurationError extends DomainError {
  /**
   * Construct a new ConfigurationError
   * @param {string} message - Message
   */
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}
