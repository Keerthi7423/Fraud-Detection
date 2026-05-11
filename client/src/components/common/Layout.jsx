import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Dashboard Overview';
      case '/transactions': return 'Transaction Feed';
      case '/queue': return 'Review Queue';
      case '/audit': return 'System Audit Logs';
      default: return 'FraudGuard';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F1117] text-[#F1F5F9]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
