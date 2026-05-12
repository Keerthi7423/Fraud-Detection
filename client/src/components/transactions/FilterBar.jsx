import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const FilterBar = ({ filters, setFilters, onApply, onReset, loading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="ID or Merchant..."
              className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#3B82F6] outline-none transition-all"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg px-4 py-2 text-white focus:border-[#3B82F6] outline-none transition-all appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="clean">Clean</option>
            <option value="suspicious">Suspicious</option>
            <option value="fraudulent">Fraudulent</option>
          </select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg px-4 py-2 text-white focus:border-[#3B82F6] outline-none transition-all appearance-none"
          >
            <option value="">All Categories</option>
            <option value="food">Food & Dining</option>
            <option value="travel">Travel</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="medical">Medical</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end space-x-3">
          <button
            onClick={onApply}
            disabled={loading}
            className="flex-1 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Filter className="w-4 h-4" />
            <span>Apply</span>
          </button>
          <button
            onClick={onReset}
            className="bg-[#1A1D27] hover:bg-[#2A2D3E] text-[#94A3B8] p-2 rounded-lg transition-all"
            title="Reset Filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
