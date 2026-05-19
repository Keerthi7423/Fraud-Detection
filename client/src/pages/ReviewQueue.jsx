import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TransactionTable from '../components/transactions/TransactionTable';
import ActionModal from '../components/transactions/ActionModal';
import { transactionAPI } from '../services/api';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const ReviewQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approved' or 'rejected'

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.get('/queue');
      const data = response.data.transactions || response.data;
      setQueue(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch queue', err);
      setError('Failed to load review queue. Please check your connection to the Transaction Service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleActionClick = (transactionId, action) => {
    setSelectedTxn(transactionId);
    setActionType(action);
    setModalOpen(true);
  };

  const handleConfirmAction = async (note) => {
    setActionLoading(true);
    try {
      await transactionAPI.patch(`/${selectedTxn}`, {
        status: actionType,
        reviewNote: note
      });
      toast.success(`Transaction ${selectedTxn} marked as ${actionType === 'approved' ? 'clean' : 'fraudulent'} successfully`);
      setModalOpen(false);
      fetchQueue();
    } catch (err) {
      console.error(`Failed to ${actionType} transaction`, err);
      toast.error(err.response?.data?.message || `Failed to ${actionType} transaction`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#F1F5F9]">Review Queue</h1>
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-sm font-semibold flex items-center justify-center">
              {queue.length} Pending
            </span>
          </div>
          <p className="text-gray-400 mt-1">Sorted by risk — highest risk first</p>
        </div>
        <button
          onClick={fetchQueue}
          className="p-2 bg-[#1A1D27] border border-[#2A2D3E] rounded-lg text-[#94A3B8] hover:text-white transition-all flex items-center"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState message={error} onRetry={fetchQueue} />
      ) : queue.length === 0 && !loading ? (
        <EmptyState 
          title="All caught up!" 
          description="No transactions need review. There are currently no pending or suspicious events requiring manual review." 
          icon={AlertTriangle}
        />
      ) : (
        <TransactionTable 
          data={queue} 
          loading={loading} 
          isQueueView={true} 
          onAction={handleActionClick} 
        />
      )}

      {/* Modal */}
      <ActionModal
        isOpen={modalOpen}
        transactionId={selectedTxn}
        action={actionType}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
      />
    </div>
  );
};

export default ReviewQueue;
