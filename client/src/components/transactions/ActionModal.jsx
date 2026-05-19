import React, { useState, useEffect } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';

const ActionModal = ({ isOpen, transactionId, action, onClose, onConfirm, loading }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmDisabled = note.trim().length < 10 || loading;
  
  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      onConfirm(note);
    }
  };

  const actionText = action === 'approved' ? 'Approve' : action === 'rejected' ? 'Reject' : 'Review';
  const headerColor = action === 'approved' ? 'text-green-500' : action === 'rejected' ? 'text-red-500' : 'text-blue-500';
  const buttonColor = action === 'approved' 
    ? 'bg-green-500 hover:bg-green-600 text-white' 
    : action === 'rejected' 
      ? 'bg-red-500 hover:bg-red-600 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1D27] w-full max-w-md rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#2A2D3E]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle size={20} className={headerColor} />
            Confirm {actionText}
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 mb-4 text-sm">
            You are about to <strong className={headerColor}>{actionText.toLowerCase()}</strong> transaction <span className="font-mono text-blue-400 bg-blue-400/10 px-1 rounded">{transactionId}</span>.
          </p>
          
          <div className="space-y-2">
            <label htmlFor="review-note" className="block text-sm font-medium text-gray-400">
              Review Note <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              placeholder="Add a note explaining your decision (minimum 10 characters)..."
              className="w-full bg-[#11131C] border border-[#2A2D3E] rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-28 text-sm disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Required for audit trail</span>
              <span className={note.length > 0 && note.length < 10 ? 'text-red-400' : ''}>
                {note.length}/10 chars min
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-[#2A2D3E] bg-[#11131C]/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2A2D3E] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${buttonColor} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            <span>{loading ? 'Processing...' : `Confirm ${actionText}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
