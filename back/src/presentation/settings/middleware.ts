/**
 * @fileoverview Middleware
 */

// infrastructure
import {
  EnvironmentUtils,
  getEnvironmentUtils,
} from "@/infrastructure/config/env_utils.ts";

/**
 * CORS configuration
 * @interface CorsConfig
 */
export interface CorsConfig {
  allowHeaders: string[];
  allowMethods: string[];
  allowedOrigins: string[];
  enabled: boolean;
  maxAge: number;
}

/**
 * CORS Middleware
 * @class CorsMiddleware
 */
export class CorsMiddleware {
  private readonly config: CorsConfig;
  private readonly envUtils: EnvironmentUtils;

  /**
   * Construct a new CorsMiddleware
   */
  constructor() {
    this.envUtils = getEnvironmentUtils();
    this.config = this.createCorsConfig();
  }

  /**
   * Handle CORS preflight request
   * @param {Request} request - Original request
   * @returns {Response} - CORS preflight response
   */
  handlePreflight(request: Request): Response {
    // only handle OPTIONS requests
    if (!this.config.enabled) {
      return new Response(null, { status: 200 });
    }
    const origin = request.headers.get("Origin");
    if (!this.isOriginAllowed(origin)) {
      // if origin is not allowed, return 403
      return new Response(null, { status: 403 });
    }
    // create CORS headers
    const headers = this.createCorsHeaders(origin, true);
    // respond with 200 OK and CORS headers
    return new Response(null, { status: 200, headers });
  }

  /**
   * Add CORS headers to response
   * @param {Response} response - Original response
   * @param {Request} request - Original request
   * @returns {Promise<Response>} - Response with CORS headers
   */
  async addCorsHeaders(
    response: Response,
    request: Request,
  ): Promise<Response> {
    // only add CORS headers if enabled
    if (!this.config.enabled) {
      return response;
    }
    // check if origin is allowed
    const origin = request.headers.get("Origin");
    if (!this.isOriginAllowed(origin)) {
      return response;
    }
    // add CORS headers to the existing response
    const headers = this.createCorsHeaders(origin, false, response.headers);
    // clone response to modify headers
    try {
      const text = await response.text();
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      // if any unexpected error occurs, return original response
      return new Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  }

  /**
   * Check if origin is allowed
   * @param {string | null} origin - Request origin
   * @returns {boolean} - True if origin is allowed
   */
  private isOriginAllowed(origin: string | null): boolean {
    // if no origin is provided, allow the request (e.g., same-origin requests)
    if (!origin) return true;
    // allow all origins if "*" is specified
    if (this.config.allowedOrigins.includes("*")) {
      return true;
    }
    // check if the origin is in the allowed list and return the result
    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * Create CORS headers
   * @param {string | null} origin - Request origin
   * @param {boolean} includePreflight - Whether to include preflight-specific headers
   * @param {Headers} [existingHeaders] - Existing headers to copy from
   * @returns {Headers} - CORS headers
   */
  private createCorsHeaders(
    origin: string | null,
    includePreflight: boolean,
    existingHeaders?: Headers,
  ): Headers {
    const headers = existingHeaders
      ? new Headers(existingHeaders)
      : new Headers();
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set(
      "Access-Control-Allow-Methods",
      this.config.allowMethods.join(", "),
    );
    headers.set(
      "Access-Control-Allow-Headers",
      this.config.allowHeaders.join(", "),
    );
    if (includePreflight) {
      headers.set("Access-Control-Max-Age", this.config.maxAge.toString());
    }
    return headers;
  }

  /**
   * Create CORS configuration from environment
   * @returns {CorsConfig} - CORS configuration
   */
  private createCorsConfig(): CorsConfig {
    // determine if CORS is enabled and get allowed origins from environment
    const enabled = this.envUtils.isCorsEnabled();
    const configuredOrigins = this.envUtils.getCorsOrigins();
    // add localhost for development
    const allowedOrigins = [
      ...configuredOrigins,
      ...(this.envUtils.isLocalDevelopment()
        ? [
          "http://localhost:4321",
          "http://127.0.0.1:4321",
        ]
        : []),
    ];
    // return the CORS configuration
    return {
      allowHeaders: [
        "Content-Type",
        "Accept",
        "Authorization",
        "X-Requested-With",
      ],
      allowMethods: ["GET", "OPTIONS"],
      allowedOrigins,
      enabled,
      // 24 hours
      maxAge: 86400,
    };
  }
}
