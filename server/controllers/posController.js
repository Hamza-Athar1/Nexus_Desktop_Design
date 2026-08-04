import { ApiError } from '../utils/ApiError.js';
import {
  listPalettes, createPalette, deletePalette,
  listPosModules, getPosStats, createPosModule, updatePosModule, deletePosModule,
} from '../models/posModel.js';

// ── Palettes ──────────────────────────────────────────────────────────────────

export async function getPalettesHandler(req, res) {
  const palettes = await listPalettes();
  res.json({ ok: true, palettes });
}

export async function postPaletteHandler(req, res) {
  const { name, colorPrimary, colorAccent, colorShade, colorLight } = req.body;
  if (!name?.trim()) throw new ApiError(400, 'Palette name is required');
  if (!colorPrimary || !colorAccent || !colorShade || !colorLight)
    throw new ApiError(400, 'All four colors are required');

  const palette = await createPalette({
    name: name.trim(), colorPrimary, colorAccent, colorShade, colorLight,
  });
  res.status(201).json({ ok: true, palette });
}

export async function deletePaletteHandler(req, res) {
  await deletePalette(Number(req.params.id));
  res.json({ ok: true });
}

// ── POS Modules ───────────────────────────────────────────────────────────────

export async function getPosListHandler(req, res) {
  const modules = await listPosModules();
  res.json({ ok: true, modules });
}

export async function getPosStatsHandler(req, res) {
  const stats = await getPosStats();
  res.json({ ok: true, stats });
}

export async function postPosHandler(req, res) {
  const { name, priceCents, paletteId } = req.body;
  if (!name?.trim()) throw new ApiError(400, 'POS name is required');
  if (priceCents === undefined || priceCents < 0) throw new ApiError(400, 'Valid price is required');

  const mod = await createPosModule({
    name: name.trim(),
    priceCents: Number(priceCents),
    paletteId: paletteId ? Number(paletteId) : null,
  });
  res.status(201).json({ ok: true, module: mod });
}

export async function patchPosHandler(req, res) {
  const id = Number(req.params.id);
  const { name, priceCents, paletteId, status } = req.body;
  if (status && !['active', 'inactive'].includes(status))
    throw new ApiError(400, 'Invalid status');

  const mod = await updatePosModule(id, {
    name:       name !== undefined ? name.trim() : undefined,
    priceCents: priceCents !== undefined ? Number(priceCents) : undefined,
    paletteId:  paletteId !== undefined ? (paletteId ? Number(paletteId) : null) : undefined,
    status,
  });
  res.json({ ok: true, module: mod });
}

export async function deletePosHandler(req, res) {
  await deletePosModule(Number(req.params.id));
  res.json({ ok: true });
}
