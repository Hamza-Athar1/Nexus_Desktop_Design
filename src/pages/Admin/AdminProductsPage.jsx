import React, { useState } from 'react';
import { Search, ChevronDown, PlusCircle } from 'lucide-react';

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Cooking Oil 1L',
    price: '1100',
    stock: 45,
    status: 'Active',
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    name: 'Lewis Bread',
    price: '400',
    stock: 35,
    status: 'Active',
    category: 'Frozen Items',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    name: 'Ramen Noodles',
    price: '650',
    stock: 0,
    status: 'Out of Stock',
    category: 'Noodles',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    name: 'Rice 5Kg',
    price: '3,500',
    stock: 20,
    status: 'Active',
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 5,
    name: 'Olpers',
    price: '5,500',
    stock: 40,
    status: 'Active',
    category: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&auto=format&fit=crop&q=60'
  },
  {
    id: 6,
    name: 'Takis',
    price: '2,200',
    stock: 9,
    status: 'Low Stock',
    category: 'Frozen Items',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60'
  }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Category and Status drop down open states
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const categories = ['All Categories', 'Frozen Items', 'Dairy Products', 'Spices', 'Noodles', '•••'];
  const statuses = ['All Status', 'Active', 'Out of Stock', 'Low Stock'];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-[#e2f0d9] text-[#385723] border border-[#385723]/30';
      case 'Out of Stock':
        return 'bg-[#aeaaaa]/20 text-[#595959] border border-[#595959]/30';
      case 'Low Stock':
        return 'bg-[#fce4d6] text-[#c65911] border border-[#c65911]/30';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-[28px] font-bold text-[#0c3818] tracking-tight">
          Manage Products
        </h2>
      </div>

      {/* Product List Subheader Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-transparent">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xl font-bold text-[#0c3818] font-serif">Product List</span>
          
          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <input
              type="text"
              placeholder="Search Product by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fcfbe8] border border-[#0c3818]/20 rounded-full px-5 py-2 pr-10 text-sm font-bold text-[#0c3818] placeholder-[#607455]/60 focus:outline-none focus:border-[#0c3818]/50"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0c3818] w-4 h-4 cursor-pointer" />
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCatDropdownOpen(!catDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-5 py-2 bg-[#fcfbe8] border border-[#0c3818]/20 rounded-full text-xs font-bold text-[#0c3818] hover:bg-[#efeacb]/50 transition cursor-pointer"
            >
              <span>{selectedCategory}</span>
              <ChevronDown size={14} />
            </button>
            {catDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-[#fbf9f0] border border-[#0c3818]/20 rounded-lg shadow-lg z-30 min-w-[150px] overflow-hidden flex flex-col divide-y divide-[#0c3818]/10 text-left">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCatDropdownOpen(false);
                    }}
                    className="px-4 py-2.5 text-left text-xs font-bold text-[#0c3818] hover:bg-[#efeacb] transition duration-150 cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setCatDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-5 py-2 bg-[#fcfbe8] border border-[#0c3818]/20 rounded-full text-xs font-bold text-[#0c3818] hover:bg-[#efeacb]/50 transition cursor-pointer"
            >
              <span>{selectedStatus}</span>
              <ChevronDown size={14} />
            </button>
            {statusDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#0c3818]/20 rounded-lg shadow-lg z-30 min-w-[150px] overflow-hidden flex flex-col py-1">
                {statuses.map((stat) => (
                  <button
                    key={stat}
                    onClick={() => {
                      setSelectedStatus(stat);
                      setStatusDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-left text-xs font-bold text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer"
                  >
                    {stat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Product Button */}
        <button className="flex items-center gap-2 px-5 py-2 bg-[#0c3818] text-[#efeacb] hover:text-white hover:bg-[#114720] text-xs font-bold rounded-lg transition duration-200 shadow-sm cursor-pointer ml-auto xl:ml-0">
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-[24px] border border-[#bfbc9b]/40 overflow-hidden shadow-xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f2e3] text-[#0c3818] text-sm lg:text-base font-black tracking-tight border-b border-[#bfbc9b]/40">
                <th className="py-5 px-6 text-center">Product Image</th>
                <th className="py-5 px-6">Product Name</th>
                <th className="py-5 px-6">Price</th>
                <th className="py-5 px-6">Stock</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bfbc9b]/25">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="text-[#0c3818] text-sm font-bold align-middle hover:bg-[#efeacb]/5 transition">
                  {/* Image */}
                  <td className="py-4 px-6 text-center">
                    <div className="w-16 h-16 mx-auto flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  </td>
                  {/* Name */}
                  <td className="py-4 px-6 text-base font-extrabold">{p.name}</td>
                  {/* Price */}
                  <td className="py-4 px-6 font-mono text-base">{p.price}</td>
                  {/* Stock */}
                  <td className="py-4 px-6 font-mono text-base">
                    {p.stock === 0 ? '0' : String(p.stock).padStart(2, '0')}
                  </td>
                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black text-center min-w-[96px] ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button className="px-5 py-1.5 border border-[#0c3818] text-[#0c3818] hover:bg-[#0c3818] hover:text-[#efeacb] font-bold text-xs rounded-lg transition cursor-pointer">
                        Edit
                      </button>
                      <button className="px-5 py-1.5 border border-[#c00000] text-[#c00000] hover:bg-[#c00000] hover:text-white font-bold text-xs rounded-lg transition cursor-pointer">
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

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <span className="text-[#0c3818] text-sm font-bold select-none">
          Showing 1 to {filteredProducts.length} of 95 Products
        </span>

        <div className="flex items-center gap-2 select-none">
          <button className="px-4 py-2 bg-white border border-[#0c3818]/20 rounded-lg text-xs font-bold text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer">
            Previous
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-[#0c3818] text-white text-xs font-bold rounded-lg cursor-pointer">
            1
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-[#0c3818]/20 text-[#0c3818] text-xs font-bold rounded-lg hover:bg-[#efeacb] transition cursor-pointer">
            2
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-[#0c3818]/20 text-[#0c3818] text-xs font-bold rounded-lg hover:bg-[#efeacb] transition cursor-pointer">
            3
          </button>

          <button className="w-8 h-8 flex items-center justify-center bg-white border border-[#0c3818]/20 rounded-lg cursor-default select-none">
            <span className="flex items-center gap-0.5">
              <span className="w-1 h-1 rounded-full bg-[#0c3818]" />
              <span className="w-1 h-1 rounded-full bg-[#0c3818]" />
              <span className="w-1 h-1 rounded-full bg-[#0c3818]" />
            </span>
          </button>

          <button className="w-8 h-8 flex items-center justify-center bg-white border border-[#0c3818]/20 text-[#0c3818] text-xs font-bold rounded-lg hover:bg-[#efeacb] transition cursor-pointer">
            15
          </button>

          <button className="px-4 py-2 bg-white border border-[#0c3818]/20 rounded-lg text-xs font-bold text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
