/**
 * @fileoverview Common presentation utilities
 */

import { ErrorResponse } from "../spotify/response.ts";

/**
 * Create successful response
 * @param {unknown} data - Response data
 * @returns {Response} - HTTP response
 */
export function createSuccessResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create no content response
 * @returns {Response} - HTTP response
 */
export function createNoContentResponse(): Response {
  return new Response(null, {
    status: 204,
  });
}

/**
 * Create error response
 * @returns {Response} - HTTP response
 */
export function createErrorResponse(
  message = "Internal Server Error",
  status = 500,
): Response {
  const errorResponse: ErrorResponse = {
    error: "Server Error",
    message,
    timestamp: new Date().toISOString(),
  };
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create not found response
 * @returns {Response} - HTTP response
 */
export function createNotFoundResponse(): Response {
  return createErrorResponse("Not Found", 404);
}
