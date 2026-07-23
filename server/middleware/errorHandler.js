import { ApiError } from '../utils/ApiError.js';

/**
 * Last middleware in the chain. Anything thrown/next(err)'d in a route
 * (wrapped with asyncHandler) ends up here instead of crashing the process.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  // MySQL duplicate-key / constraint errors — surface something readable
  // instead of a raw 500 with a driver stack trace.
  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'That value is already in use' });
  }
  if (err?.code?.startsWith?.('ER_') || err?.errno) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'A database error occurred' });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not found' });
}
