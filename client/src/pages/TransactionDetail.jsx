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
  Clock,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import transactionService from '../services/transactionService';
import RiskBadge from '../components/common/RiskBadge';
import RiskGauge from '../components/transactions/RiskGauge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

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
      const response = await transactionService.getTransaction(id);
      if (response.success) {
        setTxn(response.transaction);
        // If already reviewed, set the note
        if (response.transaction.reviewNote) {
          setNote(response.transaction.reviewNote);
        }
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

    if (!window.confirm(`Are you sure you want to mark this transaction as ${status}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await transactionService.updateTransaction(id, {
        status,
        reviewNote: note
      });
      if (response.success) {
        toast.success(`Transaction successfully marked as ${status}`);
        // Navigate back to queue or refresh
        navigate('/queue');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={15} />;

  if (!txn) return (
    <div className="flex flex-col items-center justify-center h-96">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-white">Transaction Not Found</h2>
      <button onClick={() => navigate('/transactions')} className="mt-4 text-[#3B82F6] flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to feed
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#94A3B8] hover:text-white transition-all group"
        >
          <div className="p-1.5 bg-[#1A1D27] rounded-lg border border-[#2A2D3E] group-hover:border-[#4B5563]">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to Operations</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-[#4B5563]">
          <span>Dashboard</span>
          <span>/</span>
          <span>Transactions</span>
          <span>/</span>
          <span className="text-white">{txn.transactionId}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-[#F1F5F9] text-3xl font-bold tracking-tight">{txn.transactionId}</h2>
            <RiskBadge level={txn.riskLevel} status={txn.status} />
          </div>
          <p className="text-[#94A3B8] mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Merchant: {txn.merchantName} ({txn.merchantCategory})
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-[#1A1D27] px-6 py-3 rounded-xl border border-[#2A2D3E] text-center min-w-[140px]">
            <span className="text-[#4B5563] text-[10px] uppercase font-black block tracking-widest mb-1">Current Status</span>
            <span className={`font-bold uppercase tracking-widest text-sm ${
              txn.status === 'clean' ? 'text-emerald-500' : 
              txn.status === 'fraudulent' ? 'text-red-500' : 'text-amber-500'
            }`}>
              {txn.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11131C] border border-[#2A2D3E] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity className="w-32 h-32 text-white" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-8 flex items-center relative z-10">
              <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                <Activity className="w-5 h-5 text-[#3B82F6]" />
              </div>
              Core Transaction Data
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-[#1A1D27] rounded-lg">
                    <CreditCard className="w-5 h-5 text-[#4B5563]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4B5563] uppercase font-black tracking-widest block mb-1">Payment Method</span>
                    <span className="text-white font-medium capitalize">{txn.cardType} Card</span>
                    <span className="text-[#94A3B8] block text-sm mt-0.5">Ending in •••• {txn.cardLastFour}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-[#1A1D27] rounded-lg">
                    <MapPin className="w-5 h-5 text-[#4B5563]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4B5563] uppercase font-black tracking-widest block mb-1">Location Context</span>
                    <span className="text-white font-medium">{txn.location.city}, {txn.location.country || 'India'}</span>
                    <span className="text-[#94A3B8] block text-sm mt-0.5">IP: {txn.location.ipAddress || 'Not Captured'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-[#1A1D27] rounded-lg">
                    <Calendar className="w-5 h-5 text-[#4B5563]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4B5563] uppercase font-black tracking-widest block mb-1">Network Timestamp</span>
                    <span className="text-white font-medium">{new Date(txn.timestamp).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-[#1A1D27] rounded-lg">
                    <Shield className="w-5 h-5 text-[#4B5563]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4B5563] uppercase font-black tracking-widest block mb-1">Authorized Amount</span>
                    <span className="text-3xl font-bold text-white tracking-tighter">₹{txn.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Reasoning Section */}
          <div className="bg-[#11131C] border border-[#2A2D3E] rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              Gemini AI Security Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest">Reasoning Engine</h4>
                {txn.aiReasons && txn.aiReasons.length > 0 ? (
                  txn.aiReasons.map((reason, i) => (
                    <div key={i} className="flex items-start space-x-3 bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3E] hover:border-purple-500/30 transition-all">
                      <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      <p className="text-[#F1F5F9] text-sm leading-relaxed">{reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-[#1A1D27] rounded-xl border border-[#2A2D3E] border-dashed">
                    <Clock className="w-10 h-10 mx-auto mb-3 text-[#4B5563] opacity-20" />
                    <p className="text-[#94A3B8] text-sm">AI Scoring in progress...</p>
                  </div>
                )}
              </div>
              
              <div className="bg-[#0F1117] rounded-xl p-6 border border-[#2A2D3E] flex flex-col justify-center">
                <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mb-4 text-center">Recommendation</h4>
                <div className={`text-center py-4 rounded-lg font-black uppercase tracking-widest border ${
                  txn.aiRecommendation === 'approve' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  txn.aiRecommendation === 'block' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {txn.aiRecommendation || 'PENDING'}
                </div>
                <p className="text-[10px] text-[#4B5563] mt-4 text-center">
                  Based on behavioral analysis and historical pattern matching.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Actions */}
        <div className="space-y-6">
          {/* Risk Gauge Card */}
          <div className="bg-[#11131C] border border-[#2A2D3E] rounded-2xl p-8">
             <h3 className="text-lg font-bold text-white mb-2 text-center">Risk Assessment</h3>
             <RiskGauge score={txn.riskScore} />
          </div>

          <div className="bg-[#11131C] border border-[#2A2D3E] rounded-2xl p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Analyst Decision</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest block mb-2">Internal Review Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Summarize the fraud indicators observed..."
                  className="w-full bg-[#1A1D27] border border-[#2A2D3E] rounded-xl p-4 text-white text-sm focus:border-[#3B82F6] outline-none h-40 transition-all resize-none placeholder:text-[#4B5563]"
                  disabled={txn.status !== 'pending' && txn.status !== 'suspicious'}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-[#4B5563] italic">Mandatory audit trail</span>
                  <span className={`text-[10px] font-bold ${note.length < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {note.length}/10 chars
                  </span>
                </div>
              </div>

              {txn.status === 'pending' || txn.status === 'suspicious' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction('approved')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Approve (Mark Clean)</span>
                  </button>
                  <button
                    onClick={() => handleAction('rejected')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject (Confirm Fraud)</span>
                  </button>
                  <button
                    onClick={() => handleAction('escalated')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Activity className="w-5 h-5" />
                    <span>Escalate for L2 Review</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#1A1D27] p-6 rounded-2xl border border-[#2A2D3E] text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-white font-bold text-lg">Case Closed</p>
                  <p className="text-[#94A3B8] text-xs mt-2 leading-relaxed">
                    Reviewed by <span className="text-white font-medium">{txn.reviewedByName}</span><br/>
                    on {new Date(txn.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;

