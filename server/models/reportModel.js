import { pool } from '../config/db.js';

/** Daily/period sales overview for trend charts (Net Sales & Order Count) */
export async function getSalesOverview(businessId) {
  const [rows] = await pool.query(
    `SELECT 
       DATE_FORMAT(s.sold_at, '%d %b') AS name, 
       SUM(s.total_amount - COALESCE(r.refunded_amount, 0)) AS sales,
       COUNT(DISTINCT s.id) AS order_count
     FROM sales s
     LEFT JOIN (
       SELECT sale_id, SUM(total_amount) AS refunded_amount
       FROM refunds
       GROUP BY sale_id
     ) r ON r.sale_id = s.id
     WHERE s.business_id = ? AND s.status IN ('completed', 'partially_refunded', 'refunded')
     GROUP BY DATE(s.sold_at), DATE_FORMAT(s.sold_at, '%d %b')
     ORDER BY DATE(s.sold_at) ASC
     LIMIT 30`,
    [businessId]
  );
  return rows.map(r => ({
    name: r.name,
    sales: Number(r.sales || 0),
    orderCount: Number(r.order_count || 0),
  }));
}

/** Top selling products by net volume */
export async function getTopProducts(businessId) {
  const [rows] = await pool.query(
    `SELECT 
       si.product_name AS name, 
       SUM(si.quantity - COALESCE(ri.returned_qty, 0)) AS sales,
       SUM(si.line_total - COALESCE(ri.returned_amount, 0)) AS revenue
     FROM sale_items si
     JOIN sales s ON s.id = si.sale_id
     LEFT JOIN (
       SELECT sale_item_id, SUM(quantity) AS returned_qty, SUM(amount) AS returned_amount
       FROM refund_items
       GROUP BY sale_item_id
     ) ri ON ri.sale_item_id = si.id
     WHERE s.business_id = ? AND s.status IN ('completed', 'partially_refunded', 'refunded')
     GROUP BY si.product_name
     HAVING sales > 0
     ORDER BY sales DESC
     LIMIT 5`,
    [businessId]
  );
  return rows.map(r => ({
    name: r.name,
    sales: Number(r.sales || 0),
    revenue: Number(r.revenue || 0),
  }));
}

/** Category distribution breakdown (Net Category Revenue) */
export async function getCategoryDistribution(businessId) {
  const colors = ['#8B5CF6', '#3B82F6', '#FFA533', '#FF7676', '#38BDF8', '#10B981', '#F59E0B'];
  const [rows] = await pool.query(
    `SELECT 
       COALESCE(c.name, 'Uncategorized') AS name, 
       SUM(si.line_total - COALESCE(ri.returned_amount, 0)) AS value
     FROM sale_items si
     JOIN sales s ON s.id = si.sale_id
     LEFT JOIN products p ON p.id = si.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN (
       SELECT sale_item_id, SUM(amount) AS returned_amount
       FROM refund_items
       GROUP BY sale_item_id
     ) ri ON ri.sale_item_id = si.id
     WHERE s.business_id = ? AND s.status IN ('completed', 'partially_refunded', 'refunded')
     GROUP BY c.id, c.name
     HAVING value > 0
     ORDER BY value DESC`,
    [businessId]
  );

  return rows.map((row, index) => ({
    name: row.name,
    value: Number(row.value || 0),
    color: colors[index % colors.length],
  }));
}

/** Profit breakdown using historical unit_price, cost_price, and net return deductions */
export async function getProfitAnalysis(businessId) {
  const [rows] = await pool.query(
    `SELECT 
       DATE_FORMAT(s.sold_at, '%d %b') AS name,
       SUM(si.line_total - COALESCE(ri.returned_amount, 0)) AS revenue,
       SUM((si.quantity - COALESCE(ri.returned_qty, 0)) * si.cost_price) AS cost,
       SUM(
         (si.line_total - COALESCE(ri.returned_amount, 0)) -
         ((si.quantity - COALESCE(ri.returned_qty, 0)) * si.cost_price)
       ) AS profit
     FROM sale_items si
     JOIN sales s ON s.id = si.sale_id
     LEFT JOIN (
       SELECT sale_item_id, SUM(quantity) AS returned_qty, SUM(amount) AS returned_amount
       FROM refund_items
       GROUP BY sale_item_id
     ) ri ON ri.sale_item_id = si.id
     WHERE s.business_id = ? AND s.status IN ('completed', 'partially_refunded', 'refunded')
     GROUP BY DATE(s.sold_at), DATE_FORMAT(s.sold_at, '%d %b')
     ORDER BY DATE(s.sold_at) ASC
     LIMIT 30`,
    [businessId]
  );
  return rows.map(r => ({
    name: r.name,
    revenue: Number(r.revenue || 0),
    cost: Number(r.cost || 0),
    profit: Number(r.profit || 0),
  }));
}

/** Stock status distribution breakdown */
export async function getStockDistribution(businessId) {
  const [rows] = await pool.query(
    `SELECT 
       SUM(CASE WHEN stock_quantity > reorder_level THEN 1 ELSE 0 END) AS in_stock,
       SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= reorder_level THEN 1 ELSE 0 END) AS low_stock,
       SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) AS out_of_stock
     FROM products
     WHERE business_id = ? AND is_active = 1`,
    [businessId]
  );

  const stats = rows[0] || { in_stock: 0, low_stock: 0, out_of_stock: 0 };
  return [
    { name: 'In Stock', value: Number(stats.in_stock || 0), color: '#f94e2b' },
    { name: 'Low Stock', value: Number(stats.low_stock || 0), color: '#eab308' },
    { name: 'Out of Stock', value: Number(stats.out_of_stock || 0), color: '#0d9488' },
  ];
}
