/**
 * HTTP constants
 */

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  /** Success */
  OK: 200,
  /** No content */
  NO_CONTENT: 204,
  /** Forbidden */
  FORBIDDEN: 403,
  /** Not found */
  NOT_FOUND: 404,
  /** Internal server error */
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * HTTP headers
 */
export const HTTP_HEADERS = {
  /** Content-Type header name */
  CONTENT_TYPE: "Content-Type",
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  /** JSON content type */
  JSON: "application/json",
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  /** GET method */
  GET: "GET",
  /** OPTIONS method (for CORS preflight) */
  OPTIONS: "OPTIONS",
} as const;
