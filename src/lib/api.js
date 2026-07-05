// Central place for the backend API base URL, so it's not hardcoded
// in every page that makes a fetch call. Reads from Vite's env
// (VITE_API_URL in your root .env), falling back to local dev default.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';