import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  List, 
  ShieldAlert, 
  History, 
  LogOut,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: List },
    { name: 'Review Queue', path: '/queue', icon: ShieldAlert },
    { name: 'Audit Log', path: '/audit', icon: History },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Settings });
  }

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-[#13151F] border-r border-[#2A2D3E] flex flex-col h-screen 
    transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#3B82F6] p-2 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">FraudGuard</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-[#94A3B8] hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
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
    </>
  );
};

export default Sidebar;
