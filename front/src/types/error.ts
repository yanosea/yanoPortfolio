/**
 * Application Error types
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  /**
   * Construct a new AppError
   * @param message - Error message
   * @param code - Error code
   */
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Network Error
 */
export class NetworkError extends AppError {
  /**
   * Construct a new NetworkError
   * @param message - Error message
   * @param url - Request URL that failed
   */
  constructor(
    message: string,
    public readonly url?: string,
  ) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  /**
   * Construct a new ValidationError
   * @param message - Error message
   */
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
