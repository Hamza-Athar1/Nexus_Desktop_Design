import {
  findItemById,
  findItemByBarcode,
  getAllItems,
  getLowStockItems,
  searchItems,
  createItem,
  updateItem,
  deleteItem,
} from '../models/inventoryModel.js';

export async function listItems(req, res) {
  try {
    const items = await getAllItems(req.user.id);
    return res.status(200).json({ items });
  } catch (err) {
    console.error('List inventory error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getItem(req, res) {
  try {
    const item = await findItemById(req.user.id, req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json({ item });
  } catch (err) {
    console.error('Get inventory item error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function addItem(req, res) {
  try {
    const { name, sku, barcode, category, stockQty, reorderLevel, price, moduleSpecificFields } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const item = await createItem(req.user.id, {
      name, sku, barcode, category, stockQty, reorderLevel, price, moduleSpecificFields,
    });

    return res.status(201).json({ message: 'Item created', item });
  } catch (err) {
    console.error('Add inventory item error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function editItem(req, res) {
  try {
    const existing = await findItemById(req.user.id, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { name, sku, barcode, category, stockQty, reorderLevel, price, moduleSpecificFields } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'Item name cannot be empty' });
    }
    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const item = await updateItem(req.user.id, req.params.id, {
      name, sku, barcode, category, stockQty, reorderLevel, price, moduleSpecificFields,
    });

    return res.status(200).json({ message: 'Item updated', item });
  } catch (err) {
    console.error('Edit inventory item error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function removeItem(req, res) {
  try {
    const deleted = await deleteItem(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Delete inventory item error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function lowStock(req, res) {
  try {
    const items = await getLowStockItems(req.user.id);
    return res.status(200).json({ items });
  } catch (err) {
    console.error('Low stock error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function scanBarcode(req, res) {
  try {
    const item = await findItemByBarcode(req.user.id, req.params.barcode);
    if (!item) {
      return res.status(404).json({ message: 'No item matches that barcode' });
    }
    return res.status(200).json({ item });
  } catch (err) {
    console.error('Barcode scan error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ message: 'A search query (?q=) is required' });
    }
    const items = await searchItems(req.user.id, q.trim());
    return res.status(200).json({ items });
  } catch (err) {
    console.error('Search inventory error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}