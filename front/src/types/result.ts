/**
 * Result types for functional error handling
 */

// types
import { AppError } from "@/types/error.ts";

/**
 * Result type representing success or failure
 */
export class Result<T, E = AppError> {
  /**
   * Construct a new Result
   * @param _tag - Tag to indicate success or failure
   * @param [_value] - Success value
   * @param [_error] - Error value
   */
  private constructor(
    private readonly _tag: "ok" | "fail",
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  /**
   * Create a successful result
   * @param value - Success value
   * @returns Successful Result
   */
  static ok<T, E = AppError>(value: T): Result<T, E> {
    return new Result<T, E>("ok", value);
  }

  /**
   * Create a failed result
   * @param error - Error value
   * @returns Failed Result
   */
  static fail<T, E = AppError>(error: E): Result<T, E> {
    return new Result<T, E>("fail", undefined, error);
  }

  /**
   * Check if the result is successful
   * @returns True if successful
   */
  isOk(): boolean {
    return this._tag === "ok";
  }

  /**
   * Check if the result is failed
   * @returns True if failed
   */
  isFail(): boolean {
    return this._tag === "fail";
  }

  /**
   * Get the success value or throw error
   * @returns Success value
   * @throws If result is failed
   */
  unwrap(): T {
    // if result is successful, return the value
    if (this.isOk()) {
      return this._value!;
    }
    // if result is failed, throw the error
    throw this._error;
  }

  /**
   * Get the error value or throw
   * @returns Error value
   * @throws If result is successful
   */
  unwrapError(): E {
    // if result is failed, return the error
    if (this.isFail()) {
      return this._error!;
    }
    // if result is successful, throw an error
    throw new Error("Called unwrapError on a successful result");
  }

  /**
   * Pattern match on the result
   * @param patterns - Patterns to match
   * @returns Result of the matched pattern
   */
  match<U>(patterns: { ok: (value: T) => U; fail: (error: E) => U }): U {
    return this.isOk()
      ? patterns.ok(this._value!)
      : patterns.fail(this._error!);
  }
}
