import React, { useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import EditPOSModal from '../../components/Super-User/EditPOSModal';
import AddPOSModal from '../../components/Super-User/AddPOSModal';

const PRESETS_THEMES = [
  { name: 'Bakery', colors: ['#8c52ff', '#e0b0ff', '#5c3a21', '#3e2723'] }, // Custom brown tones based on screenshot: brown, light brown, beige, dark brown
  { name: 'Forest', colors: ['#14391a', '#2e7d32', '#81c784', '#e8f5e9'] }, // green shades
  { name: 'Ocean', colors: ['#0d47a1', '#2196f3', '#90caf9', '#0a192f'] }, // blue shades
  { name: 'Slate', colors: ['#424242', '#9e9e9e', '#e0e0e0', '#1a1a1a'] }, // gray/black shades
  { name: 'Berry', colors: ['#880e4f', '#e91e63', '#f48fb1', '#4a148c'] }, // purple/pink shades
];

const INITIAL_POS = [
  {
    id: 1,
    name: 'Bakery POS',
    price: 'Rs 3,500/mo',
    theme: { name: 'Bakery', colors: ['#a0522d', '#cd853f', '#deb887', '#3e2723'] },
    status: 'active',
  },
  {
    id: 2,
    name: 'Grocery POS',
    price: 'Rs 4,200/mo',
    theme: { name: 'Forest', colors: ['#14391a', '#4caf50', '#81c784', '#e8f5e9'] },
    status: 'active',
  },
  {
    id: 3,
    name: 'Restaurant POS',
    price: 'Rs 5,000/mo',
    theme: { name: 'Ocean', colors: ['#0d47a1', '#2196f3', '#90caf9', '#0a192f'] },
    status: 'active',
  },
  {
    id: 4,
    name: 'Clothing POS',
    price: 'Rs 3,000/mo',
    theme: { name: 'Slate', colors: ['#424242', '#9e9e9e', '#e0e0e0', '#1a1a1a'] },
    status: 'active',
  },
  {
    id: 5,
    name: 'Gifting POS',
    price: 'Rs 2,700/mo',
    theme: { name: 'Berry', colors: ['#880e4f', '#e91e63', '#f48fb1', '#4a148c'] },
    status: 'inactive',
  },
];

export default function SuperAdminPOSPage() {
  const [posList, setPosList] = useState(INITIAL_POS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form States
  const [selectedPOS, setSelectedPOS] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    priceNumber: '',
    themeName: 'Forest',
    status: 'active',
  });

  // Derived calculations
  const totalPOS = posList.length;
  const activePOS = posList.filter((item) => item.status === 'active').length;
  const themesAssigned = posList.filter((item) => item.theme?.name).length;

  const openAddModal = () => {
    setFormData({
      name: '',
      priceNumber: '3000',
      themeName: 'Forest',
      status: 'active',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (pos) => {
    setSelectedPOS(pos);
    const parsedPrice = pos.price.replace(/[^\d]/g, '');
    setFormData({
      name: pos.name,
      priceNumber: parsedPrice,
      themeName: pos.theme?.name || 'Forest',
      status: pos.status,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pos) => {
    setSelectedPOS(pos);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const formattedPrice = `Rs ${Number(formData.priceNumber).toLocaleString()}/mo`;
    const selectedTheme = PRESETS_THEMES.find((t) => t.name === formData.themeName) || PRESETS_THEMES[0];

    if (isAddModalOpen) {
      const newPOS = {
        id: Date.now(),
        name: formData.name.trim(),
        price: formattedPrice,
        theme: selectedTheme,
        status: formData.status,
      };
      setPosList([...posList, newPOS]);
      setIsAddModalOpen(false);
    } else if (isEditModalOpen && selectedPOS) {
      setPosList(
        posList.map((item) =>
          item.id === selectedPOS.id
            ? {
                ...item,
                name: formData.name.trim(),
                price: formattedPrice,
                theme: selectedTheme,
                status: formData.status,
              }
            : item
        )
      );
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedPOS) {
      setPosList(posList.filter((item) => item.id !== selectedPOS.id));
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl sm:text-[44px] font-black text-[#14391a] leading-none mb-1">
            POS management
          </h1>
          <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold mt-2 flex items-center gap-2">
            <span>{totalPOS} POS modules</span>
            <span className="text-[#14391a]/30">•</span>
            <span>themed with color palettes</span>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add POS</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total POS */}
        <div className="bg-[#113819] text-white rounded-[20px] p-6.5 shadow-sm flex flex-col justify-between h-[115px]">
          <span className="text-[12px] font-extrabold tracking-wider uppercase opacity-80">
            Total POS
          </span>
          <span className="text-4xl font-black">{totalPOS}</span>
        </div>

        {/* Active POS */}
        <div className="bg-[#113819] text-white rounded-[20px] p-6.5 shadow-sm flex flex-col justify-between h-[115px]">
          <span className="text-[12px] font-extrabold tracking-wider uppercase opacity-80">
            Active
          </span>
          <span className="text-4xl font-black">{activePOS}</span>
        </div>

        {/* Themes Assigned */}
        <div className="bg-[#113819] text-white rounded-[20px] p-6.5 shadow-sm flex flex-col justify-between h-[115px]">
          <span className="text-[12px] font-extrabold tracking-wider uppercase opacity-80">
            Themes Assigned
          </span>
          <span className="text-4xl font-black text-[#deb887]">{themesAssigned}</span>
        </div>
      </div>

      {/* POS Table Container */}
      <div className="bg-[#ede7cd]/40 rounded-[20px] border border-[#14391a]/15 shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#e4dcbc] border-b border-[#14391a]/15 text-[14px] font-extrabold text-[#14391a]">
              <th className="py-5 px-6">POS name</th>
              <th className="py-5 px-6">Price</th>
              <th className="py-5 px-6">Theme</th>
              <th className="py-5 px-6">Status</th>
              <th className="py-5 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14391a]/10 bg-[#fbf9f0]">
            {posList.map((row) => (
              <tr key={row.id} className="hover:bg-[#e9e3cb]/30 transition text-[15px] font-semibold text-[#14391a]">
                {/* POS Name */}
                <td className="py-5 px-6 font-black">{row.name}</td>
                {/* Price */}
                <td className="py-5 px-6 font-bold">{row.price}</td>
                {/* Theme colors and text */}
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {row.theme?.colors?.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-4.5 h-4.5 rounded-full border border-white/60 shadow-xs shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[#14391a]/85">{row.theme?.name}</span>
                  </div>
                </td>
                {/* Status badge */}
                <td className="py-5 px-6">
                  {row.status === 'active' ? (
                    <span className="inline-flex px-3.5 py-1.5 bg-[#cbebc7] border border-[#14391a]/25 rounded-[10px] text-[13px] font-extrabold text-[#14391a]">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex px-3.5 py-1.5 bg-[#f7d6d3] border border-[#d65f57]/30 rounded-[10px] text-[13px] font-extrabold text-[#99221b]">
                      Inactive
                    </span>
                  )}
                </td>
                {/* Action buttons */}
                <td className="py-5 px-6 text-center">
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => openEditModal(row)}
                      className="px-4 py-2 border border-[#14391a]/35 rounded-[10px] text-[13px] font-extrabold text-[#14391a] hover:bg-[#14391a]/5 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(row)}
                      className="px-4 py-2 border border-[#99221b]/35 rounded-[10px] text-[13px] font-extrabold text-[#99221b] hover:bg-[#99221b]/5 transition cursor-pointer"
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

      {/* Add Modal Component */}
      <AddPOSModal
        isOpen={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSave={(newPOS) => {
          setPosList([...posList, newPOS]);
          setIsAddModalOpen(false);
        }}
      />

      {/* Edit Modal Component */}
      <EditPOSModal
        pos={selectedPOS}
        isOpen={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onSave={(updatedPOS) => {
          setPosList(posList.map((item) => (item.id === updatedPOS.id ? updatedPOS : item)));
          setIsEditModalOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedPOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[#fcfbfa] border border-[#99221b]/15 rounded-[24px] w-full max-w-sm p-6.5 flex flex-col gap-5 shadow-lg">
            <div>
              <h2 className="text-[20px] font-black text-[#99221b] leading-none mb-1">
                Delete POS Module?
              </h2>
              <p className="text-sm text-[#99221b]/80 font-semibold mt-2.5 leading-snug">
                Are you sure you want to delete <strong>{selectedPOS.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4.5 py-2.5 border border-gray-300 rounded-[12px] text-xs font-extrabold text-[#14391a]/60 hover:text-[#14391a] hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-[#99221b] hover:bg-[#b03026] text-white text-xs font-extrabold rounded-[12px] transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
