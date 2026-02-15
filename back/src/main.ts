/**
 * Main application entry point
 */

// third party
import { ExportedHandler } from "@cloudflare/workers-types";
// domain
import { EnvironmentConfig } from "@/domain/common/environments.ts";
// presentation
import {
  CONTENT_TYPES,
  HTTP_HEADERS,
  HTTP_STATUS,
} from "@/presentation/common/http_constants.ts";
// infrastructure
import {
  getEnvironmentUtils,
  initializeEnvironmentUtils,
} from "@/infrastructure/config/env_utils.ts";
// presentation
import { Routes } from "@/presentation/routes/routes.ts";

/**
 * Cloudflare Workers application entry point
 */
export default {
  /**
   * Cloudflare Worker entry point
   * @param request - Incoming request
   * @param env - Environment configuration
   * @returns Response
   */
  async fetch(request: Request, env: EnvironmentConfig): Promise<Response> {
    // validate all environment variables
    try {
      initializeEnvironmentUtils(env);
      getEnvironmentUtils().validateAllEnvironment();
    } catch (error) {
      // return error if any required environment variable is missing
      console.error(
        "Missing required environment variables:",
        error instanceof Error ? error.message : String(error),
      );
      return new Response(
        JSON.stringify({
          error: "Missing Required Environment Variables",
          message: "An error occurred while validating the server environment.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          headers: { [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON },
        },
      );
    }
    // initialize routes
    const routes = new Routes(env);
    // handle request
    try {
      return await routes.handle(request);
    } catch (error) {
      // log and return error if any unhandled exception occurs
      console.error(
        "Unhandled error:",
        error instanceof Error ? error.message : String(error),
      );
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "An internal server error occurred.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          headers: { [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON },
        },
      );
    }
  },
} satisfies ExportedHandler<EnvironmentConfig>;
