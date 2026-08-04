import {
  listLatestInvoices,
  getBillingStats,
  findInvoiceById,
  createInvoice,
  listPayments,
  getPaymentModuleStats,
} from '../models/billingModel.js';
import { ApiError } from '../utils/ApiError.js';

// ── Formatting helpers ────────────────────────────────────────────────────────

/** Rs X,XXX with comma separators (no decimals shown). */
function fmtAmt(val) {
  return Number(val).toLocaleString('en-PK', { maximumFractionDigits: 0 });
}

function isoDate(val) {
  if (!val) return null;
  return new Date(val).toISOString().slice(0, 10);
}

function serializeInvoice(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    businessId: row.business_id,
    businessName: row.business_name,
    businessStatus: row.business_status,
    moduleCode: row.module_code,
    moduleName: row.module_name,
    amount: fmtAmt(row.amount),
    rawAmount: Number(row.amount),
    status: row.status,                          // 'paid' | 'pending' | 'overdue'
    method: row.method || '--',
    dueDate: isoDate(row.due_date),
    paidAt: isoDate(row.paid_at),
    ownerName: row.owner_name || row.owner_username,
    ownerUsername: row.owner_username,
  };
}

// ── Billing page handlers ─────────────────────────────────────────────────────

export async function getInvoices(req, res) {
  const { status } = req.query;
  const rows = await listLatestInvoices(status ? { status } : {});
  res.json({ ok: true, invoices: rows.map(serializeInvoice) });
}

export async function getStats(req, res) {
  const stats = await getBillingStats();
  res.json({ ok: true, stats });
}

export async function getInvoiceDetail(req, res) {
  const result = await findInvoiceById(Number(req.params.id));
  if (!result) throw new ApiError(404, 'Invoice not found');

  const { invoice, totalBilledToDate, paymentHistory } = result;
  res.json({
    ok: true,
    invoice: serializeInvoice(invoice),
    totalBilledToDate,
    paymentHistory: paymentHistory.map(h => ({
      id: h.id,
      invoiceNumber: h.invoice_number,
      amount: fmtAmt(h.amount),
      rawAmount: Number(h.amount),
      paidAt: isoDate(h.paid_at),
      method: h.method || '--',
    })),
  });
}

export async function postInitiateInvoice(req, res) {
  const { businessId, amount, dueDate } = req.body;
  if (!businessId || !amount || !dueDate) {
    throw new ApiError(400, 'businessId, amount, and dueDate are required');
  }
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${ym}-${rand}`;

  const id = await createInvoice(Number(businessId), {
    invoiceNumber,
    amount: Number(amount),
    dueDate,
  });
  res.status(201).json({ ok: true, id, invoiceNumber });
}

// ── Payment page handlers ─────────────────────────────────────────────────────

export async function getPayments(req, res) {
  const { moduleCode, startDate, endDate } = req.query;
  const rows = await listPayments({
    moduleCode: moduleCode || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  res.json({
    ok: true,
    payments: rows.map(r => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      businessName: r.business_name,
      moduleCode: r.module_code,
      moduleName: r.module_name,
      amount: fmtAmt(r.amount),
      rawAmount: Number(r.amount),
      status: r.status,
      date: isoDate(r.paid_at) ?? isoDate(r.due_date),
    })),
  });
}

export async function getModuleStats(req, res) {
  const { moduleCode } = req.query;
  if (!moduleCode) throw new ApiError(400, 'moduleCode query param is required');
  const stats = await getPaymentModuleStats(moduleCode);
  res.json({ ok: true, stats });
}
