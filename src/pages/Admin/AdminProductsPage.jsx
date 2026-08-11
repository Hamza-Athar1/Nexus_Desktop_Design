import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Edit2, Plus, Package, Snowflake, Milk, Flame, Soup } from 'lucide-react';
import AddProductForm from '../../components/Admin/AddProductForm';
import AddSubcategoryModal from '../../components/Admin/AddSubcategoryModal';
import AddCategoryModal from '../../components/Admin/AddCategoryModal';
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
  { id: 2, name: 'Fruits & vegetable' },
  { id: 3, name: 'Meat & Fish' },
  { id: 4, name: 'Beverages' },
  { id: 5, name: 'Snacks' }
];

const INITIAL_SUBCATEGORIES = [
  { id: 1, name: 'Oil & Grains' },
  { id: 2, name: 'Milk & eggs' },
  { id: 3, name: 'Bread & Buns' },
  { id: 4, name: 'Rice & Flour' },
  { id: 5, name: 'Cheese & Butter' }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Cooking Oil 1L',
    price: '1100',
    stock: 45,
    status: 'Active',
    category: 'Grocery & Dairy',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    name: 'Lewis Bread',
    price: '400',
    stock: 35,
    status: 'Active',
    category: 'Grocery & Dairy',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    name: 'Rice 5Kg',
    price: '3,500',
    stock: 0,
    status: 'Out of Stock',
    category: 'Grocery & Dairy',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    name: 'Olpers',
    price: '5,500',
    stock: 40,
    status: 'Active',
    category: 'Grocery & Dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&auto=format&fit=crop&q=60'
  }
];

export default function AdminProductsPage() {
  const { setHeaderDetails } = useOutletContext() || {};

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'IMTIAZ SUPER MARKET',
        subtitle: null
      });
    }
  }, [setHeaderDetails]);

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('Grocery & Dairy');
  const [subcategories, setSubcategories] = useState(INITIAL_SUBCATEGORIES);
  const [selectedSubcategory, setSelectedSubcategory] = useState('Oil & Grains');
  
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const statuses = ['All Status', 'Active', 'Low Stock', 'Out of Stock'];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSaveProduct = (newProdData) => {
    const newProduct = {
      id: Date.now(),
      name: newProdData.name || 'New Product',
      price: newProdData.sellingPrice || '0',
      stock: Number(newProdData.stockQuantity) || 0,
      status: Number(newProdData.stockQuantity) === 0 ? 'Out of Stock' : (Number(newProdData.stockQuantity) <= Number(newProdData.minStockLevel) ? 'Low Stock' : 'Active'),
      category: newProdData.category || 'Grocery & Dairy',
      image: newProdData.imagePreview || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60'
    };
    setProducts([newProduct, ...products]);
    setIsAddingProduct(false);
  };

  const handleAddSubcategory = (newSubcat) => {
    setSubcategories((prev) => [
      ...prev,
      { id: Date.now(), name: newSubcat.name }
    ]);
  };

  const handleAddCategory = (newCat) => {
    setCategories((prev) => [
      ...prev,
      { id: Date.now(), name: newCat.name }
    ]);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-block px-4 py-1 rounded-full text-xs font-extrabold text-[#0c3818] bg-[#efeacb] border border-[#0c3818]/30 min-w-[90px] text-center">
            Active
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-block px-4 py-1 rounded-full text-xs font-extrabold text-[#595959] bg-[#e6e6e6] border border-[#595959]/30 min-w-[90px] text-center">
            Out of Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-block px-4 py-1 rounded-full text-xs font-extrabold text-[#c65911] bg-[#fce4d6] border border-[#c65911]/30 min-w-[90px] text-center">
            Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold text-gray-700 bg-gray-100 min-w-[90px] text-center">
            {status}
          </span>
        );
    }
  };

  if (isAddingProduct) {
    return (
      <AddProductForm
        onCancel={() => setIsAddingProduct(false)}
        onSave={handleSaveProduct}
        categories={categories.map(c => c.name)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 2xl:gap-10 w-full pb-10">
      {/* Delete Product Confirmation Modal */}
      <DeleteProductModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        productName={productToDelete?.name}
      />

      {/* Add Subcategory Modal */}
      <AddSubcategoryModal
        isOpen={isSubcatModalOpen}
        onClose={() => setIsSubcatModalOpen(false)}
        onSave={handleAddSubcategory}
        categories={categories.map(c => c.name)}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleAddCategory}
      />

      {/* 1. Category Section */}
      <div className="flex flex-col gap-3 2xl:gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg 2xl:text-2xl font-black text-[#0c3818]">Category</h3>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 2xl:px-6 2xl:py-3 bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] hover:text-white text-xs 2xl:text-sm font-bold rounded-lg transition duration-200 shadow-xs cursor-pointer min-w-[170px] 2xl:min-w-[210px]"
          >
            <Plus size={14} className="2xl:w-4 2xl:h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 2xl:gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 2xl:px-6 2xl:py-3 rounded-xl text-xs 2xl:text-sm font-bold transition duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0c3818] text-[#efeacb] border-[#0c3818]'
                    : 'bg-[#efeacb] text-[#0c3818] border-[#0c3818]/20 hover:bg-[#e4ddb6]'
                }`}
              >
                <span>{cat.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={`p-1 rounded-full border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#efeacb] text-[#0c3818] border-transparent hover:bg-white'
                      : 'bg-[#0c3818] text-[#efeacb] border-transparent hover:bg-[#114720]'
                  }`}
                >
                  <Edit2 size={12} className="2xl:w-3.5 2xl:h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Subcategory Section */}
      <div className="flex flex-col gap-3 2xl:gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg 2xl:text-2xl font-black text-[#0c3818]">Subcategory</h3>
          <button
            onClick={() => setIsSubcatModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 2xl:px-6 2xl:py-3 bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] hover:text-white text-xs 2xl:text-sm font-bold rounded-lg transition duration-200 shadow-xs cursor-pointer min-w-[170px] 2xl:min-w-[210px]"
          >
            <Plus size={14} className="2xl:w-4 2xl:h-4" />
            <span>Add New Subcategory</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 2xl:gap-4">
          {subcategories.map((subcat) => {
            const isSelected = selectedSubcategory === subcat.name;
            return (
              <div
                key={subcat.id}
                onClick={() => setSelectedSubcategory(subcat.name)}
                className={`flex items-center gap-2 px-4 py-2 2xl:px-6 2xl:py-3 rounded-xl text-xs 2xl:text-sm font-bold transition duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0c3818] text-[#efeacb] border-[#0c3818]'
                    : 'bg-[#efeacb] text-[#0c3818] border-[#0c3818]/20 hover:bg-[#e4ddb6]'
                }`}
              >
                <span>{subcat.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={`p-1 rounded-full border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#efeacb] text-[#0c3818] border-transparent hover:bg-white'
                      : 'bg-[#0c3818] text-[#efeacb] border-transparent hover:bg-[#114720]'
                  }`}
                >
                  <Edit2 size={12} className="2xl:w-3.5 2xl:h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Product List Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 2xl:gap-6">
          <h3 className="text-xl 2xl:text-3xl font-black text-[#0c3818]">Product List</h3>

          {/* Search Input */}
          <div className="relative min-w-[220px] sm:min-w-[260px] 2xl:min-w-[340px]">
            <input
              type="text"
              placeholder="Search Product by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fbf9f0] border border-[#0c3818]/20 rounded-full px-4 py-1.5 2xl:px-6 2xl:py-2.5 pr-9 2xl:pr-11 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-[#0c3818]/50 focus:outline-none focus:border-[#0c3818]"
            />
            <Search className="absolute right-3 2xl:right-4 top-1/2 -translate-y-1/2 text-[#0c3818]/70 w-3.5 h-3.5 2xl:w-4 2xl:h-4 cursor-pointer" />
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-1.5 2xl:px-6 2xl:py-2.5 bg-[#fbf9f0] border border-[#0c3818]/20 rounded-lg text-xs 2xl:text-sm font-bold text-[#0c3818] hover:bg-[#e4ddb6]/50 transition cursor-pointer min-w-[110px] 2xl:min-w-[140px] justify-between"
            >
              <span>{selectedStatus}</span>
              {statusDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Dropdown Options Popup */}
            {statusDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#0c3818]/20 rounded-md shadow-md z-30 min-w-[130px] 2xl:min-w-[160px] overflow-hidden flex flex-col py-1">
                {statuses.slice(1).map((stat) => (
                  <button
                    key={stat}
                    onClick={() => {
                      setSelectedStatus(stat === selectedStatus ? 'All Status' : stat);
                      setStatusDropdownOpen(false);
                    }}
                    className={`px-3 py-1.5 2xl:px-4 2xl:py-2 text-left text-xs 2xl:text-sm font-bold border-b last:border-b-0 border-gray-100 hover:bg-[#efeacb]/40 transition cursor-pointer ${
                      selectedStatus === stat ? 'text-[#0c3818] font-extrabold bg-[#efeacb]/20' : 'text-gray-700'
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
          onClick={() => setIsAddingProduct(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 2xl:px-6 2xl:py-3 bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] hover:text-white text-xs 2xl:text-sm font-bold rounded-lg transition duration-200 shadow-xs cursor-pointer self-start md:self-auto min-w-[170px] 2xl:min-w-[210px]"
        >
          <Plus size={14} className="2xl:w-4 2xl:h-4" />
          <span>Add New Product</span>
        </button>
      </div>


      {/* 4. Products Table */}
      <div className="bg-[#fbf9f0]/60 rounded-2xl border border-[#0c3818]/15 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#0c3818]/15 text-[#0c3818] text-sm 2xl:text-base font-extrabold">
                <th className="py-4 px-6 2xl:py-6 2xl:px-8">Product Image</th>
                <th className="py-4 px-6 2xl:py-6 2xl:px-8">Product Name</th>
                <th className="py-4 px-6 2xl:py-6 2xl:px-8">Price</th>
                <th className="py-4 px-6 2xl:py-6 2xl:px-8">Stock</th>
                <th className="py-4 px-6 2xl:py-6 2xl:px-8">Status</th>
                <th className="py-4 px-6 2xl:py-6 2xl:px-8 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0c3818]/10">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="text-[#0c3818] text-sm 2xl:text-base font-bold align-middle hover:bg-[#efeacb]/30 transition">
                  {/* Image Column */}
                  <td className="py-3 px-6 2xl:py-5 2xl:px-8">
                    <div className="w-10 h-10 2xl:w-14 2xl:h-14 flex items-center justify-center rounded-md bg-transparent overflow-hidden">
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
                  </td>

                  {/* Product Name */}
                  <td className="py-3 px-6 2xl:py-5 2xl:px-8 text-sm 2xl:text-base font-black text-[#0c3818]">{p.name}</td>

                  {/* Price */}
                  <td className="py-3 px-6 2xl:py-5 2xl:px-8 text-sm 2xl:text-base font-black text-[#0c3818]">{p.price}</td>

                  {/* Stock */}
                  <td className="py-3 px-6 2xl:py-5 2xl:px-8 text-sm 2xl:text-base font-black text-[#0c3818]">{p.stock}</td>

                  {/* Status Badge */}
                  <td className="py-3 px-6 2xl:py-5 2xl:px-8">{getStatusBadge(p.status)}</td>

                  {/* Action Buttons */}
                  <td className="py-3 px-6 2xl:py-5 2xl:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 2xl:gap-3">
                      <button className="px-4 py-1 2xl:px-6 2xl:py-2 bg-white border border-[#0c3818] text-[#0c3818] hover:bg-[#0c3818] hover:text-[#efeacb] font-extrabold text-xs 2xl:text-sm rounded-lg transition cursor-pointer">
                        Edit
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="px-4 py-1 2xl:px-6 2xl:py-2 bg-white border border-[#c00000] text-[#c00000] hover:bg-[#c00000] hover:text-white font-extrabold text-xs 2xl:text-sm rounded-lg transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

