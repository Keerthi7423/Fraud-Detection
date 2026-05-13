import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../services/api';
import FilterBar from '../components/transactions/FilterBar';
import TransactionTable from '../components/transactions/TransactionTable';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
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

      {loading ? (
        <LoadingSkeleton rows={10} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTransactions} />
      ) : transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <TransactionTable data={transactions} />
      )}

    </div>
  );
};

export default TransactionFeed;
