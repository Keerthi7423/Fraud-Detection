import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bell, User, Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import transactionService from '../../services/transactionService';

const Navbar = ({ title, onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        // Fetch recent transactions to match the notifications page
        const res = await transactionService.getTransactions({ limit: 5 });
        if (res && res.success) {
          const isAllRead = localStorage.getItem('notificationsAllRead') === 'true';
          if (!isAllRead) {
            setUnreadCount((res.transactions?.length || 0) + 1); // +1 for sys-1
          } else {
             // If marked all as read, we can just keep it at 0
             // (In a real app, we'd check timestamps)
             setUnreadCount(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);

    const handleClear = () => setUnreadCount(0);
    const handleReadOne = () => setUnreadCount(prev => Math.max(0, prev - 1));
    
    window.addEventListener('notificationsRead', handleClear);
    window.addEventListener('notificationReadOne', handleReadOne);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsRead', handleClear);
      window.removeEventListener('notificationReadOne', handleReadOne);
    };
  }, []);

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

        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 ? (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border border-[#0F1117] text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
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
