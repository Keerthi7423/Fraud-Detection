import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, User, Search } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 bg-[#0F1117]/80 backdrop-blur-md border-b border-[#2A2D3E] flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-[#F1F5F9]">{title}</h2>
      
      <div className="flex items-center space-x-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-[#1A1D27] border border-[#2A2D3E] rounded-lg py-2 pl-10 pr-4 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] w-64 transition-all"
          />
        </div>

        <button className="relative p-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F1117]"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-[#2A2D3E]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[#F1F5F9]">{user?.name || 'Analyst'}</p>
            <p className="text-xs text-[#94A3B8] capitalize">{user?.role || 'User'}</p>
          </div>
          <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || <User className="w-5 h-5" />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
