/**
 * Throw this from anywhere in the request lifecycle (controllers,
 * models, middleware) to produce a clean, intentional HTTP error.
 * Anything else thrown (a real bug) falls through errorHandler as a 500.
 */
export class ApiError extends Error {
  /**
   * @param {number} status  HTTP status code
   * @param {string} message User-facing message
   */
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
