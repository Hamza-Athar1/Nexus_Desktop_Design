import inventoryRoutes from './routes/inventoryRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// ── Core middleware ─────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Vite dev server, e.g. http://localhost:5173
    credentials: true,               // required so the browser sends/receives httpOnly cookies
  })
);

// ── Routes ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', businessRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', adminRoutes);
app.use('/api', inventoryRoutes);
// ── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});