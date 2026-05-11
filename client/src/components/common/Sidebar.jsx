import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  List, 
  ShieldAlert, 
  History, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: List },
    { name: 'Review Queue', path: '/queue', icon: ShieldAlert },
    { name: 'Audit Log', path: '/audit', icon: History },
  ];

  return (
    <div className="w-64 bg-[#13151F] border-r border-[#2A2D3E] flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-[#3B82F6] p-2 rounded-lg">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">FraudGuard</h1>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20'
                  : 'text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2A2D3E]">
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center space-x-3 px-4 py-3 w-full text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
