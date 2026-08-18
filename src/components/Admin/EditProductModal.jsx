import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';

export default function EditProductModal({ isOpen, onClose, product, categories = [], subcategories = [], onSave }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [status, setStatus] = useState('Active');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price || '');
      setStock(product.stock !== undefined ? product.stock : '');
      setCategory(product.category || (categories[0]?.name || ''));
      setSubcategory(product.subcategory || (subcategories[0]?.name || ''));
      setStatus(product.status || 'Active');
      setImage(product.image || '');
    }
  }, [product, categories, subcategories]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (onSave) {
      onSave({
        ...product,
        name: name.trim(),
        price: String(price),
        stock: Number(stock),
        category,
        subcategory,
        status: Number(stock) === 0 ? 'Out of Stock' : status,
        image: image || product.image,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-[#fbf9f0] border border-[#0c3818]/20 rounded-3xl w-[94vw] max-w-lg p-5 sm:p-7 shadow-2xl flex flex-col gap-4 sm:gap-5 text-[#0c3818] z-10 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-[#0c3818]/60 hover:text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0c3818] text-[#efeacb] flex items-center justify-center font-bold text-sm shadow-sm">
            <Package size={18} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-[#0c3818]">Edit Product</h3>
            <p className="text-xs text-[#0c3818]/70 font-semibold">Update product details, pricing, and stock</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-[#0c3818]">Product Name*</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0c3818] focus:outline-none focus:ring-2 focus:ring-[#0c3818]/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-[#0c3818]">Price (Rs)*</label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0c3818] focus:outline-none focus:ring-2 focus:ring-[#0c3818]/40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-[#0c3818]">Stock Quantity*</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0c3818] focus:outline-none focus:ring-2 focus:ring-[#0c3818]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-[#0c3818]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0c3818] outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-[#0c3818]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0c3818] outline-none"
              >
                <option value="Active">Active</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0c3818]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-[#0c3818]/30 hover:bg-gray-50 text-[#0c3818] text-xs font-extrabold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-xs font-extrabold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
            >
              Save Product Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
