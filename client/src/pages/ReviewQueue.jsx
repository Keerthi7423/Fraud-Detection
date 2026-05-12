import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCcw, Eye, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { TransactionRowSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const ReviewQueue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.get('/queue');
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">Manual Review</h2>
          <p className="text-[#F1F5F9] text-2xl font-bold mt-1">High Risk Queue</p>
        </div>
        <button
          onClick={fetchQueue}
          className="p-2 bg-[#1A1D27] border border-[#2A2D3E] rounded-lg text-[#94A3B8] hover:text-white transition-all"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1D27] border-b border-[#2A2D3E]">
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">AI Flags</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D3E]">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5"><TransactionRowSkeleton /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8">
                    <EmptyState 
                      title="Queue is empty" 
                      description="Great job! All high-risk transactions have been reviewed." 
                      icon={ShieldAlert}
                    />
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr 
                    key={txn.transactionId}
                    className="hover:bg-[#1A1D27] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <RiskBadge score={txn.riskScore} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#F1F5F9]">{txn.merchantName}</div>
                      <div className="text-xs text-[#4B5563]">{txn.transactionId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#F1F5F9]">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-purple-400">
                        <span className="bg-purple-500/10 px-2 py-1 rounded">
                          {txn.aiReasons?.length || 0} reasons detected
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/transactions/${txn.transactionId}`)}
                        className="flex items-center space-x-2 bg-[#1A1D27] border border-[#2A2D3E] px-4 py-2 rounded-lg text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-all text-sm font-bold"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Review</span>
                        <ArrowRight className="w-4 h-4" />
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

export default ReviewQueue;
