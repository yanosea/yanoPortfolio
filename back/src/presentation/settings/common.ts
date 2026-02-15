/**
 * Common presentation utilities
 */

import {
  CONTENT_TYPES,
  HTTP_HEADERS,
  HTTP_STATUS,
} from "../common/http_constants.ts";
import { ErrorResponse } from "../spotify/response.ts";

/**
 * Create successful response
 * @param data - Response data
 * @returns HTTP response
 */
export function createSuccessResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: HTTP_STATUS.OK,
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
    },
  });
}

/**
 * Create no content response
 * @returns HTTP response
 */
export function createNoContentResponse(): Response {
  return new Response(null, {
    status: HTTP_STATUS.NO_CONTENT,
  });
}

/**
 * Create error response
 * @param message - Error message
 * @param status - HTTP status code
 * @returns HTTP response
 */
export function createErrorResponse(
  message = "Internal Server Error",
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
): Response {
  const errorResponse: ErrorResponse = {
    error: "Server Error",
    message,
    timestamp: new Date().toISOString(),
  };
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
    },
  });
}

/**
 * Create not found response
 * @returns HTTP response
 */
export function createNotFoundResponse(): Response {
  return createErrorResponse("Not Found", HTTP_STATUS.NOT_FOUND);
}
