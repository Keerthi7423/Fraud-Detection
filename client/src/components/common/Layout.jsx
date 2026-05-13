import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/transactions/')) return 'Transaction Detail';
    switch (pathname) {
      case '/':
      case '/dashboard': return 'Dashboard Overview';
      case '/transactions': return 'Transaction Feed';
      case '/queue': return 'Review Queue';
      case '/audit': return 'System Audit Logs';
      case '/admin': return 'Admin Control Panel';
      default: return 'FraudGuard Terminal';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F1117] text-[#F1F5F9]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title={getPageTitle(location.pathname)} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
