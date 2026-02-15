/**
 * Result type for functional error handling
 */

// domain
import { DomainError } from "@/domain/error/error.ts";

/**
 * Result type representing success or failure
 */
export class Result<T, E = DomainError> {
  /**
   * Construct a new Result
   * @param _tag - Tag to indicate success or failure
   * @param [_value] - Success value
   * @param  [_error] - Error value
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
  static ok<T, E = DomainError>(value: T): Result<T, E> {
    return new Result<T, E>("ok", value, undefined);
  }

  /**
   * Create a failed result
   * @param error - Error value
   * @returns Failed Result
   */
  static fail<T, E = DomainError>(error: E): Result<T, E> {
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
    if (this.isOk()) {
      return this._value!;
    }
    throw this._error;
  }

  /**
   * Get the error value or throw
   * @returns Error value
   * @throws If result is successful
   */
  unwrapError(): E {
    if (this.isFail()) {
      return this._error!;
    }
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
