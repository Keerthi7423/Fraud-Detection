import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, User, Search, Menu } from 'lucide-react';

const Navbar = ({ title, onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 bg-[#0F1117]/80 backdrop-blur-md border-b border-[#2A2D3E] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#94A3B8] hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg lg:text-xl font-semibold text-[#F1F5F9] truncate">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-3 lg:space-x-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors" />
          <input 
            type="text" 
            placeholder="Search terminal..." 
            className="bg-[#1A1D27] border border-[#2A2D3E] rounded-lg py-2 pl-10 pr-4 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] w-32 lg:w-64 transition-all"
          />
        </div>

        <button className="relative p-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F1117]"></span>
        </button>

        <div className="flex items-center space-x-3 lg:pl-4 lg:border-l lg:border-[#2A2D3E]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[#F1F5F9]">{user?.name || 'Analyst'}</p>
            <p className="text-xs text-[#94A3B8] capitalize">{user?.role || 'User'}</p>
          </div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            {user?.name?.charAt(0) || <User className="w-5 h-5" />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
