import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCcw, CreditCard } from 'lucide-react';
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

  const handleRazorpayPayment = async () => {
    try {
      // 1. Create order on backend
      const response = await fetch('http://localhost:3002/transactions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const order = await response.json();

      if (!order.id) {
        throw new Error('Failed to create Razorpay order');
      }

      // 2. Open Razorpay Checkout with Order ID
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_...',
        amount: order.amount,
        currency: order.currency,
        name: "FraudGuard Demo",
        description: "Auto-Capture Transaction",
        order_id: order.id, // THE MAGIC KEY FOR AUTOMATIC CAPTURE
        handler: function (response) {
          console.log("Razorpay Payment Success:", response);
          toast.success('Payment successful! Automatic capture in progress...');
          setTimeout(fetchTransactions, 3000);
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },
        theme: { color: "#3B82F6" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Payment failed to initialize');
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
            className="flex items-center space-x-2 bg-[#1A1D27] border border-[#2A2D3E] text-[#94A3B8] hover:text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {creating ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Mock</span>
          </button>
          <button
            onClick={handleRazorpayPayment}
            className="flex items-center space-x-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Now (UPI/Card)</span>
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
