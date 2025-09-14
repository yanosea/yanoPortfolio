/**
 * @fileOverview Main application entry point
 */

// third party
import { ExportedHandler } from "@cloudflare/workers-types";
// domain
import { EnvironmentConfig } from "@/domain/common/environments.ts";
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
   * @param {Request} request incoming request
   * @param {EnvironmentConfig} env environment configuration
   * @returns {Promise<Response>} response
   */
  async fetch(request: Request, env: EnvironmentConfig): Promise<Response> {
    // validate all environment variables
    try {
      initializeEnvironmentUtils(env);
      getEnvironmentUtils().validateAllEnvironment();
    } catch (error) {
      // return error if any required environment variable is missing
      console.error("Missing required environment variables:", error);
      return new Response(
        JSON.stringify({
          error: "Missing Required Environment Variables",
          message: "An error occurred while validating the server environment.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
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
      console.error("Unhandled error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "An internal server error occurred.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
} satisfies ExportedHandler<EnvironmentConfig>;
