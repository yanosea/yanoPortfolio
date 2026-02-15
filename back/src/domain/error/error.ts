/**
 * Domain error types
 */

/**
 * Base domain error
 */
export class DomainError extends Error {
  /**
   * Construct a new DomainError
   * @param message - Error message
   * @param code - Error code
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
 * Validation error
 */
export class ValidationError extends DomainError {
  /**
   * Construct a new ValidationError
   * @param message - Message
   */
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends DomainError {
  /**
   * Construct a new ExternalServiceError
   * @param message - Message
   * @param service - Service name
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
 * Configuration error
 */
export class ConfigurationError extends DomainError {
  /**
   * Construct a new ConfigurationError
   * @param message - Message
   */
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}
