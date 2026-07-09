/**
 * AuthContext.jsx — Global authentication state for Nexus Desktop
 *
 * Provides:
 *  • `useAuth()` hook — access the current user and auth actions anywhere.
 *  • `<AuthProvider>` — wraps the app and restores the session on load.
 *
 * Session flow on mount:
 *  1. Call GET /api/auth/me with the existing cookie.
 *  2. If that succeeds → user is stored in state.
 *  3. If it fails with session_expired → call POST /api/auth/refresh,
 *     then retry /me once more.
 *  4. If everything fails → state stays null (unauthenticated).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, apiFetchJson } from '../lib/api';


// ─── Shape of the user object stored in state ─────────────────────────────────
/**
 * @typedef {Object} AuthUser
 * @property {number} id
 * @property {string} username
 * @property {string} businessName
 * @property {'user'|'admin'|'super-admin'} role
 */

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  /** @type {[AuthUser|null, Function]} */
  const [user, setUser] = useState(null);

  /**
   * `'loading'`  — initial session-restore attempt is in progress.
   * `'ready'`    — attempt finished (user may or may not be set).
   */
  const [authStatus, setAuthStatus] = useState('loading');

  const navigate = useNavigate();

  // Prevent double-mounting in React 18 StrictMode from running the
  // session restore twice. The ref is reset to false once the first
  // attempt completes so a manual `refreshUser()` still works.
  const hasMounted = useRef(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Fetches /auth/me and stores the user in state.
   *
   * @returns {Promise<AuthUser|null>} The user object, or null on failure.
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { ok, data } = await apiFetchJson('/auth/me');
      if (ok && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch {
      // `session_expired` thrown by apiFetch — caller handles it.
    }
    return null;
  }, []);

  // ── Session restore on mount ───────────────────────────────────────────────

  useEffect(() => {
    // Guard against StrictMode double-invoke.
    if (hasMounted.current) return;
    hasMounted.current = true;

    async function restoreSession() {
      try {
        const restoredUser = await fetchCurrentUser();
        if (!restoredUser) {
          // /me failed — the apiFetch layer will have already attempted a
          // refresh automatically before throwing session_expired, so if
          // we're here the user is genuinely unauthenticated.
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthStatus('ready');
      }
    }

    restoreSession();
  }, [fetchCurrentUser]);

  // ── Public actions ─────────────────────────────────────────────────────────

  /**
   * Called after a successful login/signup response.
   * Stores the user in context without a round-trip to /me.
   *
   * @param {AuthUser} userData
   */
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  /**
   * Calls POST /api/auth/logout, clears local state, and sends the user
   * back to the login page.  Safe to call even when already logged out.
   */
  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Even if the network is down, clear local state and redirect.
    } finally {
      setUser(null);
      navigate('/', { replace: true });
    }
  }, [navigate]);

  /**
   * Re-fetches /auth/me to sync the latest server-side user data
   * (e.g. after a profile update).
   *
   * @returns {Promise<AuthUser|null>}
   */
  const refreshUser = useCallback(async () => {
    try {
      return await fetchCurrentUser();
    } catch {
      // Session expired during a refresh — log the user out.
      logout();
      return null;
    }
  }, [fetchCurrentUser, logout]);

  // ── Derived helpers ────────────────────────────────────────────────────────

  /** True once the initial session-restore attempt has completed. */
  const isReady = authStatus === 'ready';

  /** True when a user is currently authenticated. */
  const isAuthenticated = Boolean(user);

  // ── Context value (stable reference via useMemo) ───────────────────────────

  const value = useMemo(
    () => ({
      /** @type {AuthUser|null} */
      user,
      isReady,
      isAuthenticated,
      login,
      logout,
      refreshUser,
    }),
    [user, isReady, isAuthenticated, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the current auth context.
 * Must be used inside `<AuthProvider>`.
 *
 * @returns {{
 *   user: AuthUser|null,
 *   isReady: boolean,
 *   isAuthenticated: boolean,
 *   login: (user: AuthUser) => void,
 *   logout: () => Promise<void>,
 *   refreshUser: () => Promise<AuthUser|null>,
 * }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {

  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
