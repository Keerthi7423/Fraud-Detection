import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TransactionTable from '../components/transactions/TransactionTable';
import ActionModal from '../components/transactions/ActionModal';
import { transactionAPI } from '../services/api';

const ReviewQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approved' or 'rejected'

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.get('/queue');
      // Assume response.data returns the array directly based on transactionService, or handles .data.transactions
      const data = response.data.transactions || response.data;
      setQueue(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch queue', err);
      setError('Failed to load review queue. Please try again.');
      toast.error('Failed to load review queue');
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
    try {
      await transactionAPI.patch(`/${selectedTxn}`, {
        status: actionType,
        reviewNote: note
      });
      toast.success(`Transaction ${selectedTxn} ${actionType} successfully`);
      setModalOpen(false);
      fetchQueue();
    } catch (err) {
      console.error(`Failed to ${actionType} transaction`, err);
      toast.error(err.response?.data?.error || `Failed to ${actionType} transaction`);
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
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchQueue}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : queue.length === 0 && !loading ? (
        <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-green-500/10 text-green-500 p-4 rounded-full mb-4">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
          <p className="text-gray-400">No transactions need review.</p>
        </div>
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
      />
    </div>
  );
};

export default ReviewQueue;
