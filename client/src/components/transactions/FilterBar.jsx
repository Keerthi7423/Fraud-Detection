import React from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FilterBar = ({ filters, setFilters, onApply, onReset, loading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFilters(prev => ({ ...prev, [name]: date }));
  };

  return (
    <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
              className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-[#3B82F6] outline-none transition-all"
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
            className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg px-4 py-2 text-white text-sm focus:border-[#3B82F6] outline-none transition-all appearance-none"
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
            className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg px-4 py-2 text-white text-sm focus:border-[#3B82F6] outline-none transition-all appearance-none"
          >
            <option value="">All Categories</option>
            <option value="food">Food & Dining</option>
            <option value="travel">Travel</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="fuel">Fuel</option>
            <option value="medical">Medical</option>
          </select>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Amount Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleChange}
              placeholder="Min"
              className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] outline-none transition-all"
            />
            <span className="text-[#4B5563]">-</span>
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleChange}
              placeholder="Max"
              className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] outline-none transition-all"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2 lg:col-span-2 xl:col-span-1">
          <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Date Range</label>
          <div className="flex items-center space-x-2">
            <div className="relative w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] z-10" />
              <DatePicker
                selected={filters.fromDate}
                onChange={(date) => handleDateChange('fromDate', date)}
                placeholderText="From"
                className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-[#3B82F6] outline-none transition-all"
              />
            </div>
            <div className="relative w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] z-10" />
              <DatePicker
                selected={filters.toDate}
                onChange={(date) => handleDateChange('toDate', date)}
                placeholderText="To"
                className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-[#3B82F6] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-end space-x-3">
          <button
            onClick={onApply}
            disabled={loading}
            className="flex-1 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 h-[42px]"
          >
            <Filter className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
          <button
            onClick={onReset}
            className="bg-[#1A1D27] hover:bg-[#2A2D3E] text-[#94A3B8] p-2 rounded-lg transition-all border border-[#2A2D3E] h-[42px] w-[42px] flex items-center justify-center"
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

