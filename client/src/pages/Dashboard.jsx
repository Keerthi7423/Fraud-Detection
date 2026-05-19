import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  IndianRupee,
  RefreshCw,
  LayoutDashboard,
  FileDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import FraudLineChart from '../components/dashboard/FraudLineChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import HourlyBarChart from '../components/dashboard/HourlyBarChart';
import { CardSkeleton, ChartSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);
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
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load real-time intelligence. Please check your connection to the Transaction Service.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Preparing report...', { id: 'export' });
      const response = await transactionAPI.get('/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fraud_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully!', { id: 'export' });
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export report. Admin access required.', { id: 'export' });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">Operational Overview</h2>
          <p className="text-[#F1F5F9] text-2xl font-bold mt-1">Real-time Fraud Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center space-x-2 bg-[#3B82F6] hover:bg-[#2563EB] px-4 py-2 rounded-lg text-white transition-all shadow-lg shadow-blue-500/20"
          >
            <FileDown className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-[#1A1D27] border border-[#2A2D3E] px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:border-[#3B82F6] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Responsive 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {loading && !stats.total ? (
          Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Charts Grid - Responsive stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        {loading && trends.length === 0 ? (
          <>
            <div className="lg:col-span-2"><ChartSkeleton /></div>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <div className="lg:col-span-2 min-w-0">
              <FraudLineChart data={trends} />
            </div>
            <div className="min-w-0">
              <CategoryPieChart data={categories} />
            </div>
            <div className="min-w-0">
              <HourlyBarChart data={hours} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
