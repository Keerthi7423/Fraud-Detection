import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  AlertTriangle, 
  ClipboardList, 
  LogOut,
  Shield,
  Settings,
  X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setQueueCount } from '../../store/slices/authSlice';
import transactionService from '../../services/transactionService';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, queueCount } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;
    const fetchQueueCount = async () => {
      try {
        const data = await transactionService.getQueue();
        dispatch(setQueueCount(data.count || 0));
      } catch (err) {
        console.error('Failed to fetch queue count', err);
      }
    };
    fetchQueueCount();
    const interval = setInterval(fetchQueueCount, 30000);
    return () => clearInterval(interval);
  }, [dispatch, user]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Review Queue', path: '/queue', icon: AlertTriangle, badge: queueCount },
    { name: 'Audit Log', path: '/audit', icon: ClipboardList },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Settings });
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-60 bg-[#13151F] border-r border-[#2A2D3E] flex flex-col h-screen 
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
            <Shield className="text-[#3B82F6] w-8 h-8" />
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
                `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-150 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1A1D27] to-[#13151F] text-white border-l-[3px] border-[#3B82F6] rounded-l-none'
                    : 'text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3 relative z-10">
                <item.icon className={`w-5 h-5 transition-colors duration-150 ${
                  item.name === 'Review Queue' ? 'group-hover:text-red-400' : 'group-hover:text-[#3B82F6]'
                }`} />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full relative z-10 animate-pulse">
                  {item.badge}
                </span>
              )}
              {/* Subtle hover glow effect */}
              <div className="absolute inset-0 bg-[#3B82F6]/0 group-hover:bg-[#3B82F6]/5 transition-colors duration-150" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2A2D3E] space-y-4">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Analyst'}</p>
            <p className="text-xs text-[#94A3B8] capitalize">{user?.role || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150"
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

