import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCcw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../services/api';
import FilterBar from '../components/transactions/FilterBar';
import RiskBadge from '../components/common/RiskBadge';
import { TransactionRowSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

const TransactionFeed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      
      const response = await transactionAPI.get(`?${params.toString()}`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load transactions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreateMock = async () => {
    try {
      setCreating(true);
      const response = await transactionAPI.post('/', {});
      if (response.data.success) {
        toast.success('Mock transaction created and queued for scoring!');
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Failed to create mock transaction');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'clean': return 'text-emerald-500';
      case 'fraudulent': return 'text-red-500';
      case 'suspicious': return 'text-amber-500';
      case 'pending': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">Transaction Monitoring</h2>
          <p className="text-[#F1F5F9] text-2xl font-bold mt-1">Live Transaction Feed</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTransactions}
            className="p-2 bg-[#1A1D27] border border-[#2A2D3E] rounded-lg text-[#94A3B8] hover:text-white transition-all"
            title="Refresh Feed"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreateMock}
            disabled={creating}
            className="flex items-center space-x-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {creating ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Generate Mock</span>
          </button>
        </div>
      </div>

      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        onApply={fetchTransactions} 
        onReset={() => {
          setFilters({ search: '', status: '', category: '', minAmount: '', maxAmount: '' });
          // Fetch will trigger due to effect or manual call
        }}
        loading={loading}
      />

      <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1D27] border-b border-[#2A2D3E]">
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D3E]">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7"><TransactionRowSkeleton /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="7" className="p-8">
                    <ErrorState message={error} onRetry={fetchTransactions} />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr 
                    key={txn.transactionId}
                    className="hover:bg-[#1A1D27] transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-[#3B82F6]">{txn.transactionId}</td>
                    <td className="px-6 py-4 text-sm text-[#94A3B8]">
                      {new Date(txn.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#F1F5F9]">{txn.merchantName}</div>
                      <div className="text-xs text-[#4B5563]">{txn.merchantCategory}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#F1F5F9]">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge score={txn.riskScore} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold uppercase tracking-widest ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/transactions/${txn.transactionId}`)}
                        className="p-2 text-[#4B5563] hover:text-[#3B82F6] hover:bg-blue-500/10 rounded-lg transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionFeed;
