/**
 * api.js — Centralised API client for Nexus Desktop
 *
 * All fetch calls should go through `apiFetch` so that:
 *  • Every request automatically carries the httpOnly cookie session.
 *  • A single expired-access-token (401) is silently recovered by
 *    hitting the refresh endpoint before retrying the original request.
 *  • If refresh also fails, the user is redirected to the login page.
 */

/** Base URL for every backend request. */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Internal state ──────────────────────────────────────────────────────────

/** Prevents concurrent 401 handlers from each triggering a refresh. */
let isRefreshing = false;

/**
 * Callbacks queued while a refresh is already in flight.
 * Once the refresh resolves/rejects they are all flushed.
 * @type {Array<{ resolve: Function, reject: Function }>}
 */
let refreshQueue = [];

/** Flush all queued callbacks after a refresh attempt. */
function flushQueue(error = null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  refreshQueue = [];
}

// ─── Refresh helper ───────────────────────────────────────────────────────────

/**
 * Attempts to obtain a new access token using the refresh-token cookie.
 * Queues concurrent callers so only one network request is made.
 *
 * @returns {Promise<void>} Resolves if the refresh succeeded.
 * @throws  {Error}         If the refresh endpoint returns a non-2xx status.
 */
async function refreshAccessToken() {
  if (isRefreshing) {
    // Another caller is already refreshing — wait for it.
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('refresh_failed');
    }

    flushQueue();
  } catch (err) {
    flushQueue(err);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * A thin wrapper around `fetch` that handles auth transparently.
 *
 * @param {string} path     - API path relative to `API_BASE_URL`
 *                            (e.g. `'/auth/me'`).
 * @param {RequestInit} [options] - Standard fetch options.  `credentials`
 *                            and the `Content-Type` header are set
 *                            automatically when a body is present.
 * @param {boolean} [retry] - Internal flag to prevent infinite refresh loops.
 *
 * @returns {Promise<Response>} The raw fetch Response.
 *
 * @throws  {Error} `'session_expired'` when the refresh token is also invalid,
 *                  signalling callers (AuthContext) to log the user out.
 */
export async function apiFetch(path, options = {}, retry = true) {
  const url = `${API_BASE_URL}${path}`;

  // Merge sensible defaults without overriding caller-supplied values.
  const config = {
    credentials: 'include',
    ...options,
    headers: {
      // Only add Content-Type when a JSON body is being sent.
      ...(options.body && typeof options.body === 'string'
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // Happy path — return immediately.
  if (response.ok) return response;

  // ── Token-expired path ────────────────────────────────────────────────────
  if (response.status === 401 && retry) {
    try {
      await refreshAccessToken();
      // Retry the original request exactly once (retry = false prevents loops).
      return apiFetch(path, options, false);
    } catch {
      // Refresh failed — signal the caller to log the user out.
      throw new Error('session_expired');
    }
  }

  // ── All other error statuses — return as-is for callers to handle. ────────
  return response;
}

/**
 * Convenience helper: performs an `apiFetch` and parses the JSON body.
 *
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function apiFetchJson(path, options = {}) {
  const res = await apiFetch(path, options);
  let data = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — return empty object.
  }
  return { ok: res.ok, status: res.status, data };
}