import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import Skeleton from '../components/common/Skeleton';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [txn, setTxn] = useState(null);
  const [note, setNote] = useState('');

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.get(`/${id}`);
      if (response.data.success) {
        setTxn(response.data.transaction);
      }
    } catch (err) {
      toast.error('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const handleAction = async (status) => {
    if (!note || note.length < 10) {
      toast.error('Please provide a note (min 10 chars)');
      return;
    }

    try {
      setActionLoading(true);
      const response = await transactionAPI.patch(`/${id}`, {
        status,
        reviewNote: note
      });
      if (response.data.success) {
        toast.success(`Transaction marked as ${status}`);
        fetchTransaction();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="lg:col-span-2 h-[600px] rounded-xl" />
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    </div>
  );

  if (!txn) return (
    <div className="flex flex-col items-center justify-center h-96">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-white">Transaction Not Found</h2>
      <button onClick={() => navigate('/transactions')} className="mt-4 text-[#3B82F6]">Back to feed</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-[#94A3B8] hover:text-white transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Operations</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-[#F1F5F9] text-2xl font-bold">{txn.transactionId}</h2>
            <RiskBadge level={txn.riskLevel} status={txn.status} />
          </div>
          <p className="text-[#94A3B8] mt-1">Merchant: {txn.merchantName}</p>
        </div>
        <div className="bg-[#1A1D27] px-4 py-2 rounded-lg border border-[#2A2D3E]">
          <span className="text-[#94A3B8] text-xs uppercase block">Current Status</span>
          <span className={`font-bold uppercase tracking-widest ${
            txn.status === 'clean' ? 'text-emerald-500' : 
            txn.status === 'fraudulent' ? 'text-red-500' : 'text-amber-500'
          }`}>
            {txn.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#3B82F6]" />
              Core Transaction Data
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-[#4B5563] mt-1" />
                  <div>
                    <span className="text-xs text-[#4B5563] uppercase font-bold block">Payment Method</span>
                    <span className="text-white capitalize">{txn.cardType} ending in •••• {txn.cardLastFour}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#4B5563] mt-1" />
                  <div>
                    <span className="text-xs text-[#4B5563] uppercase font-bold block">Location</span>
                    <span className="text-white">{txn.location.city}, {txn.location.country || 'India'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-[#4B5563] mt-1" />
                  <div>
                    <span className="text-xs text-[#4B5563] uppercase font-bold block">Timestamp</span>
                    <span className="text-white">{new Date(txn.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-[#4B5563] mt-1" />
                  <div>
                    <span className="text-xs text-[#4B5563] uppercase font-bold block">Amount (INR)</span>
                    <span className="text-2xl font-bold text-[#F1F5F9]">₹{txn.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Reasoning Section */}
          <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-500" />
              Gemini AI Security Analysis
            </h3>
            <div className="space-y-4">
              {txn.aiReasons && txn.aiReasons.length > 0 ? (
                txn.aiReasons.map((reason, i) => (
                  <div key={i} className="flex items-start space-x-3 bg-[#1A1D27] p-4 rounded-lg border-l-4 border-purple-500">
                    <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-[#F1F5F9] text-sm leading-relaxed">{reason}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#4B5563]">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>AI Scoring in progress or no flags detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Actions */}
        <div className="space-y-6">
          <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Analyst Action</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[#4B5563] uppercase block mb-2">Review Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe your findings..."
                  className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-lg p-4 text-white focus:border-[#3B82F6] outline-none h-32 transition-all resize-none"
                  disabled={txn.status !== 'pending' && txn.status !== 'suspicious'}
                />
                <p className="text-[10px] text-[#4B5563] mt-2 italic">Minimum 10 characters required for audit trail.</p>
              </div>

              {txn.status === 'pending' || txn.status === 'suspicious' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction('approved')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Approve Transaction</span>
                  </button>
                  <button
                    onClick={() => handleAction('rejected')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject (Confirm Fraud)</span>
                  </button>
                  <button
                    onClick={() => handleAction('escalated')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    <Activity className="w-5 h-5" />
                    <span>Escalate to Senior</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#1A1D27] p-4 rounded-lg border border-[#2A2D3E] text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-white font-bold">Review Completed</p>
                  <p className="text-[#94A3B8] text-sm mt-1">By {txn.reviewedByName} at {new Date(txn.reviewedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1A1D27] to-[#11131C] border border-[#2A2D3E] rounded-xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-24 h-24 text-white" />
             </div>
             <h4 className="text-xs font-bold text-[#3B82F6] uppercase tracking-widest mb-2">Audit Insight</h4>
             <p className="text-[#94A3B8] text-sm relative z-10">
               Confirming fraud will automatically block the associated card and alert the user via SMS.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
