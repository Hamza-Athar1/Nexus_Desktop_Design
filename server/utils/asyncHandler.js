/**
 * Wraps an async Express route handler so rejected promises are forwarded
 * to next(err) instead of crashing the process or hanging the request.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
