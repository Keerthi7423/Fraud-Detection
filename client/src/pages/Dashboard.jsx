import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import FraudLineChart from '../components/dashboard/FraudLineChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import HourlyBarChart from '../components/dashboard/HourlyBarChart';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    confirmed: 0,
    saved: 0
  });
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hours, setHours] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, categoriesRes, hoursRes] = await Promise.all([
        transactionAPI.get('/stats'),
        transactionAPI.get('/trends'),
        transactionAPI.get('/categories'),
        transactionAPI.get('/hours')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (trendsRes.data.success) setTrends(trendsRes.data.trends);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      if (hoursRes.data.success) setHours(hoursRes.data.hours);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats.total) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">Operational Overview</h2>
          <p className="text-[#F1F5F9] text-2xl font-bold mt-1">Real-time Fraud Intelligence</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 bg-[#1A1D27] border border-[#2A2D3E] px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:border-[#3B82F6] transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Transactions" 
          value={stats.total.toLocaleString()} 
          icon={ShieldCheck} 
          color="bg-blue-500"
        />
        <StatsCard 
          title="Flagged (AI/System)" 
          value={stats.flagged.toLocaleString()} 
          icon={AlertTriangle} 
          color="bg-amber-500"
          trend={stats.total > 0 ? Math.round((stats.flagged / stats.total) * 100) : 0}
        />
        <StatsCard 
          title="Confirmed Fraud" 
          value={stats.confirmed.toLocaleString()} 
          icon={ShieldCheck} 
          color="bg-red-500"
        />
        <StatsCard 
          title="Amount Saved" 
          value={`₹${stats.saved.toLocaleString()}`} 
          icon={IndianRupee} 
          color="bg-green-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <FraudLineChart data={trends} />
        </div>
        <div className="min-w-0">
          <CategoryPieChart data={categories} />
        </div>
        <div className="min-w-0">
          <HourlyBarChart data={hours} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
