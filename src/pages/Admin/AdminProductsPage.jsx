import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  Package,
  Snowflake,
  Milk,
  Flame,
  Soup,
  Check,
  Trash2,
} from 'lucide-react';

// Modals imported cleanly from separate component files
import AddProductForm from '../../components/Admin/AddProductForm';
import AddCategoryModal from '../../components/Admin/AddCategoryModal';
import EditCategoryModal from '../../components/Admin/EditCategoryModal';
import DeleteCategoryModal from '../../components/Admin/DeleteCategoryModal';
import AddSubcategoryModal from '../../components/Admin/AddSubcategoryModal';
import EditSubcategoryModal from '../../components/Admin/EditSubcategoryModal';
import DeleteSubcategoryModal from '../../components/Admin/DeleteSubcategoryModal';
import EditProductModal from '../../components/Admin/EditProductModal';
import DeleteProductModal from '../../components/Admin/DeleteProductModal';

export function getCategoryIcon(category, size = 24) {
  switch (category) {
    case 'Frozen Items':
      return <Snowflake size={size} className="text-[#3b82f6]" />;
    case 'Dairy Products':
      return <Milk size={size} className="text-[#b45309]" />;
    case 'Spices':
      return <Flame size={size} className="text-[#ef4444]" />;
    case 'Noodles':
      return <Soup size={size} className="text-[#eab308]" />;
    default:
      return <Package size={size} className="text-[#0c3818]" />;
  }
}

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Grocery & Dairy' },
  { id: 2, name: 'Home & Essentials' },
  { id: 3, name: 'Meat & Fish' },
  { id: 4, name: 'Beverages' },
  { id: 5, name: 'Snacks' },
];

const INITIAL_SUBCATEGORIES = [
  { id: 1, name: 'Oil & Ghee' },
  { id: 2, name: 'Milk & Eggs' },
  { id: 3, name: 'Bread & Buns' },
  { id: 4, name: 'Rice & Flour' },
  { id: 5, name: 'Cheese & Butter' },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Cooking Oil 1L',
    price: '1,100',
    stock: 45,
    status: 'Active',
    category: 'Grocery & Dairy',
    subcategory: 'Oil & Ghee',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&auto=format&fit=crop&q=60',
  },
  {
    id: 2,
    name: 'Lewis Bread',
    price: '400',
    stock: 35,
    status: 'Active',
    category: 'Grocery & Dairy',
    subcategory: 'Bread & Buns',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&auto=format&fit=crop&q=60',
  },
  {
    id: 3,
    name: 'Rice 5Kg',
    price: '3,500',
    stock: 0,
    status: 'Out of Stock',
    category: 'Grocery & Dairy',
    subcategory: 'Rice & Flour',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&auto=format&fit=crop&q=60',
  },
  {
    id: 4,
    name: 'Olpers Milk 1L',
    price: '320',
    stock: 40,
    status: 'Active',
    category: 'Grocery & Dairy',
    subcategory: 'Milk & Eggs',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&auto=format&fit=crop&q=60',
  },
];

export default function AdminProductsPage() {
  const { setHeaderDetails } = useOutletContext() || {};

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails]);

  // Categories & Subcategories State
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('Grocery & Dairy');
  const [subcategories, setSubcategories] = useState(INITIAL_SUBCATEGORIES);
  const [selectedSubcategory, setSelectedSubcategory] = useState('Oil & Ghee');

  // Products State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Category Edit/Delete Popover & Modal State
  const [catMenuOpenId, setCatMenuOpenId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);

  // Subcategory Edit/Delete Popover & Modal State
  const [subcatMenuOpenId, setSubcatMenuOpenId] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState(null);
  const [isAddSubcatModalOpen, setIsAddSubcatModalOpen] = useState(false);

  // Product Edit/Delete Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const statuses = ['All Status', 'Active', 'Low Stock', 'Out of Stock'];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || p.status === selectedStatus;
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCat;
  });

  // ── Category Handlers ─────────────────────────────────────────────────────
  const handleAddCategory = (newCat) => {
    const created = { id: Date.now(), name: newCat.name };
    setCategories((prev) => [...prev, created]);
    setSelectedCategory(created.name);
  };

  const handleSaveEditCategory = (id, newName) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
    if (selectedCategory === categories.find((c) => c.id === id)?.name) {
      setSelectedCategory(newName);
    }
  };

  const handleDeleteCategory = (id) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (selectedCategory === target?.name) {
      const remaining = categories.filter((c) => c.id !== id);
      setSelectedCategory(remaining[0]?.name || '');
    }
  };

  // ── Subcategory Handlers ──────────────────────────────────────────────────
  const handleAddSubcategory = (newSubcat) => {
    const created = { id: Date.now(), name: newSubcat.name };
    setSubcategories((prev) => [...prev, created]);
    setSelectedSubcategory(created.name);
  };

  const handleSaveEditSubcategory = (id, newName) => {
    setSubcategories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
    if (selectedSubcategory === subcategories.find((s) => s.id === id)?.name) {
      setSelectedSubcategory(newName);
    }
  };

  const handleDeleteSubcategory = (id) => {
    const target = subcategories.find((s) => s.id === id);
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
    if (selectedSubcategory === target?.name) {
      const remaining = subcategories.filter((s) => s.id !== id);
      setSelectedSubcategory(remaining[0]?.name || '');
    }
  };

  // ── Product Handlers ──────────────────────────────────────────────────────
  const handleSaveNewProduct = (newProdData) => {
    const newProduct = {
      id: Date.now(),
      name: newProdData.name || 'New Product',
      price: newProdData.sellingPrice || '0',
      stock: Number(newProdData.stockQuantity) || 0,
      status: Number(newProdData.stockQuantity) === 0 ? 'Out of Stock' : (Number(newProdData.stockQuantity) <= Number(newProdData.minStockLevel) ? 'Low Stock' : 'Active'),
      category: newProdData.category || selectedCategory || 'Grocery & Dairy',
      subcategory: selectedSubcategory || 'General',
      image: newProdData.imagePreview || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60',
    };
    setProducts([newProduct, ...products]);
    setIsAddingProduct(false);
  };

  const handleSaveEditedProduct = (updatedProd) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold text-[#0c3818] bg-[#efeacb] border border-[#0c3818]/30 text-center shadow-2xs">
            Active
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold text-[#595959] bg-[#e6e6e6] border border-[#595959]/30 text-center">
            Out of Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold text-[#c65911] bg-[#fce4d6] border border-[#c65911]/30 text-center">
            Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold text-gray-700 bg-gray-100 text-center">
            {status}
          </span>
        );
    }
  };

  if (isAddingProduct) {
    return (
      <AddProductForm
        onCancel={() => setIsAddingProduct(false)}
        onSave={handleSaveNewProduct}
        categories={categories.map((c) => c.name)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 2xl:gap-8 w-full max-w-full overflow-x-hidden pb-12 select-none px-1 sm:px-0">

      {/* ── Modals Integrated Cleanly ────────────────────────────────────────── */}
      <AddCategoryModal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        onSave={handleAddCategory}
      />

      <EditCategoryModal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSave={handleSaveEditCategory}
      />

      <DeleteCategoryModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
        onDelete={handleDeleteCategory}
      />

      <AddSubcategoryModal
        isOpen={isAddSubcatModalOpen}
        onClose={() => setIsAddSubcatModalOpen(false)}
        onSave={handleAddSubcategory}
        categories={categories.map((c) => c.name)}
      />

      <EditSubcategoryModal
        isOpen={Boolean(editingSubcategory)}
        onClose={() => setEditingSubcategory(null)}
        subcategory={editingSubcategory}
        onSave={handleSaveEditSubcategory}
      />

      <DeleteSubcategoryModal
        isOpen={Boolean(deletingSubcategory)}
        onClose={() => setDeletingSubcategory(null)}
        subcategory={deletingSubcategory}
        onDelete={handleDeleteSubcategory}
      />

      <EditProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        categories={categories}
        subcategories={subcategories}
        onSave={handleSaveEditedProduct}
      />

      <DeleteProductModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        productName={productToDelete?.name}
      />

      {/* ── 1. Main Category Section ───────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <h3 className="text-base sm:text-lg 2xl:text-xl font-extrabold text-[#0c3818]">Category</h3>
          <button
            type="button"
            onClick={() => setIsAddCatModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] hover:text-white text-xs font-extrabold rounded-xl transition duration-200 shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Main Category</span>
          </button>
        </div>

        {/* Category Pills Row (Scrollable on Mobile, Wrap on Desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 sm:pb-0 sm:flex-wrap scrollbar-none max-w-full">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const isMenuOpen = catMenuOpenId === cat.id;

            return (
              <div key={cat.id} className="relative shrink-0">
                <div
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0c3818] text-[#efeacb] border-[#0c3818] shadow-sm'
                      : 'bg-[#efeacb] text-[#0c3818] border-[#0c3818]/20 hover:bg-[#e4ddb6]'
                  }`}
                >
                  {/* Checkmark badge when active */}
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-[#efeacb] text-[#0c3818] flex items-center justify-center shadow-2xs shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}

                  <span className="whitespace-nowrap">{cat.name}</span>

                  {/* Edit Pencil Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCatMenuOpenId(isMenuOpen ? null : cat.id);
                    }}
                    className={`p-1 rounded-md border transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#efeacb]/20 text-[#efeacb] border-[#efeacb]/30 hover:bg-[#efeacb] hover:text-[#0c3818]'
                        : 'bg-[#0c3818]/10 text-[#0c3818] border-[#0c3818]/20 hover:bg-[#0c3818] hover:text-[#efeacb]'
                    }`}
                    title="Category options"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>

                {/* Category Actions Popover */}
                {isMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 bg-[#fbf9f0] border border-[#0c3818]/25 rounded-xl shadow-xl z-40 py-1 min-w-[140px] text-xs font-bold animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setCatMenuOpenId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCatMenuOpenId(null);
                        setEditingCategory(cat);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#efeacb] text-[#0c3818] flex items-center gap-2 transition"
                    >
                      <Edit2 size={13} />
                      <span>Edit Name</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCatMenuOpenId(null);
                        setDeletingCategory(cat);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 transition border-t border-[#0c3818]/10"
                    >
                      <Trash2 size={13} />
                      <span>Delete Category</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Subcategory Section ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <h3 className="text-base sm:text-lg 2xl:text-xl font-extrabold text-[#0c3818]">Subcategory</h3>
          <button
            type="button"
            onClick={() => setIsAddSubcatModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] hover:text-white text-xs font-extrabold rounded-xl transition duration-200 shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Sub Category</span>
          </button>
        </div>

        {/* Subcategory Pills Row (Scrollable on Mobile, Wrap on Desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 sm:pb-0 sm:flex-wrap scrollbar-none max-w-full">
          {subcategories.map((subcat) => {
            const isSelected = selectedSubcategory === subcat.name;
            const isMenuOpen = subcatMenuOpenId === subcat.id;

            return (
              <div key={subcat.id} className="relative shrink-0">
                <div
                  onClick={() => setSelectedSubcategory(subcat.name)}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0c3818] text-[#efeacb] border-[#0c3818] shadow-sm'
                      : 'bg-[#efeacb] text-[#0c3818] border-[#0c3818]/20 hover:bg-[#e4ddb6]'
                  }`}
                >
                  {/* Checkmark badge when active */}
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-[#efeacb] text-[#0c3818] flex items-center justify-center shadow-2xs shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}

                  <span className="whitespace-nowrap">{subcat.name}</span>

                  {/* Edit Pencil Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubcatMenuOpenId(isMenuOpen ? null : subcat.id);
                    }}
                    className={`p-1 rounded-md border transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#efeacb]/20 text-[#efeacb] border-[#efeacb]/30 hover:bg-[#efeacb] hover:text-[#0c3818]'
                        : 'bg-[#0c3818]/10 text-[#0c3818] border-[#0c3818]/20 hover:bg-[#0c3818] hover:text-[#efeacb]'
                    }`}
                    title="Subcategory options"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>

                {/* Subcategory Actions Popover */}
                {isMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 bg-[#fbf9f0] border border-[#0c3818]/25 rounded-xl shadow-xl z-40 py-1 min-w-[150px] text-xs font-bold animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setSubcatMenuOpenId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSubcatMenuOpenId(null);
                        setEditingSubcategory(subcat);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#efeacb] text-[#0c3818] flex items-center gap-2 transition"
                    >
                      <Edit2 size={13} />
                      <span>Edit Name</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubcatMenuOpenId(null);
                        setDeletingSubcategory(subcat);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 transition border-t border-[#0c3818]/10"
                    >
                      <Trash2 size={13} />
                      <span>Delete Subcategory</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Product List Header & Controls ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <h3 className="text-lg sm:text-xl 2xl:text-2xl font-black text-[#0c3818] shrink-0">Product List</h3>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 md:w-72">
            <input
              type="text"
              placeholder="Search Product by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fbf9f0] border border-[#0c3818]/20 rounded-full px-4 py-2 pr-9 text-xs font-bold text-[#0c3818] placeholder-[#0c3818]/50 focus:outline-none focus:border-[#0c3818]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/70 w-4 h-4 cursor-pointer" />
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 bg-[#fbf9f0] border border-[#0c3818]/20 rounded-xl text-xs font-bold text-[#0c3818] hover:bg-[#efeacb]/50 transition cursor-pointer min-w-[130px]"
            >
              <span>{selectedStatus}</span>
              {statusDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Dropdown Options */}
            {statusDropdownOpen && (
              <div className="absolute left-0 right-0 sm:right-auto top-full mt-1 bg-white border border-[#0c3818]/20 rounded-xl shadow-lg z-30 min-w-[130px] overflow-hidden flex flex-col py-1">
                {statuses.map((stat) => (
                  <button
                    key={stat}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(stat);
                      setStatusDropdownOpen(false);
                    }}
                    className={`px-3.5 py-2 text-left text-xs font-bold border-b last:border-b-0 border-gray-100 hover:bg-[#efeacb]/40 transition cursor-pointer ${
                      selectedStatus === stat ? 'text-[#0c3818] font-extrabold bg-[#efeacb]/30' : 'text-gray-700'
                    }`}
                  >
                    {stat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add New Product Button */}
        <button
          type="button"
          onClick={() => setIsAddingProduct(true)}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] hover:text-white text-xs font-extrabold rounded-xl transition duration-200 shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* ── 4. Responsive Product Display (Mobile Cards + Desktop Table) ────── */}

      {/* A. Mobile View: Touch-Friendly Product Cards (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-xs font-semibold text-[#0c3818]/60 bg-[#fbf9f0] rounded-2xl border border-[#0c3818]/15">
            No products found matching criteria.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-[#fbf9f0] border border-[#0c3818]/15 rounded-2xl p-4 shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#0c3818]/15 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#0c3818]">{p.name}</h4>
                    <p className="text-[11px] font-semibold text-[#0c3818]/70">{p.category}</p>
                  </div>
                </div>
                {getStatusBadge(p.status)}
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-[#0c3818]/10">
                <div>
                  <span className="text-[#0c3818]/60 font-semibold block text-[10px] uppercase">Price</span>
                  <span className="font-black text-[#0c3818]">Rs {p.price}</span>
                </div>
                <div>
                  <span className="text-[#0c3818]/60 font-semibold block text-[10px] uppercase text-center">Stock</span>
                  <span className="font-black text-[#0c3818] text-center block">{p.stock}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                    className="px-3.5 py-1.5 bg-white border border-[#0c3818] text-[#0c3818] font-black text-xs rounded-xl hover:bg-[#0c3818] hover:text-[#efeacb] transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductToDelete(p)}
                    className="px-3.5 py-1.5 bg-white border border-red-600 text-red-600 font-black text-xs rounded-xl hover:bg-red-600 hover:text-white transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* B. Desktop View: Full Table (hidden md:block) */}
      <div className="hidden md:block bg-[#fbf9f0]/80 rounded-2xl border border-[#0c3818]/15 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#0c3818]/15 text-[#0c3818] text-xs font-black uppercase tracking-wider bg-[#efeacb]/40">
                <th className="py-3.5 px-6">Product Image</th>
                <th className="py-3.5 px-6">Product Name</th>
                <th className="py-3.5 px-6">Price (Rs)</th>
                <th className="py-3.5 px-6">Stock</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0c3818]/10 text-xs font-bold text-[#0c3818]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#0c3818]/60 font-semibold">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="align-middle hover:bg-[#efeacb]/30 transition">
                    {/* Image Column */}
                    <td className="py-3 px-6">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#0c3818]/15 overflow-hidden shadow-2xs">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-6 font-extrabold text-[#0c3818]">{p.name}</td>

                    {/* Price */}
                    <td className="py-3 px-6 font-extrabold text-[#0c3818]">Rs {p.price}</td>

                    {/* Stock */}
                    <td className="py-3 px-6 font-extrabold text-[#0c3818]">{p.stock}</td>

                    {/* Status Badge */}
                    <td className="py-3 px-6">{getStatusBadge(p.status)}</td>

                    {/* Action Buttons */}
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="px-4 py-1.5 bg-white border border-[#0c3818] text-[#0c3818] hover:bg-[#0c3818] hover:text-[#efeacb] font-extrabold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="px-4 py-1.5 bg-white border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
