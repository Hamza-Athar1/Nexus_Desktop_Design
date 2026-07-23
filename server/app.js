import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
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
app.use('/api/catalog', catalogRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', categoryRoutes);
app.use('/api', supplierRoutes);
app.use('/api', customerRoutes);
// Phase 5+ mounts more routers here: /api/sales, /api/purchases,
// /api/admin, etc. — kept as separate PRs/patches.

// ── Fallbacks ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);
