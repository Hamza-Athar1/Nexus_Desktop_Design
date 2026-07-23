import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();

// ── Core middleware ─────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Vite dev server, e.g. http://localhost:5173
    credentials: true, // required so the browser sends/receives httpOnly cookies
  })
);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
// Phase 3+ mounts more routers here: /api/business, /api/inventory,
// /api/sales, /api/admin, etc. — kept as separate PRs/patches.

// ── Fallbacks ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);
