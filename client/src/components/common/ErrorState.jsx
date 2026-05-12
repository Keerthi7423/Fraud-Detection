import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const ErrorState = ({ message = "Failed to load data", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#11131C] border border-red-900/20 rounded-xl">
      <div className="bg-red-500/10 p-4 rounded-full mb-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
      <p className="text-[#94A3B8] mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all font-medium"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
