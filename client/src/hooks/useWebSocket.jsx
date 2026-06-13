import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3004';

export const useWebSocket = () => {
  useEffect(() => {
    const socket = io(NOTIFICATION_SERVICE_URL);

    socket.on('connect', () => {
      console.log('Connected to real-time notification service');
    });

    socket.on('NEW_NOTIFICATION', (data) => {
      const { transactionId, action, riskScore, newStatus, note } = data;
      
      // We only care about auto-flagged AI items for the wow-factor toast
      // You can expand this logic to show different toasts for different actions
      if (action === 'auto-flagged') {
        const isCritical = riskScore > 90;
        
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#1A1D27] border ${isCritical ? 'border-red-500/50' : 'border-yellow-500/50'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-bold ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                    AI Alert: {newStatus.toUpperCase()} ({riskScore}/100)
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    <span className="font-semibold text-white">{transactionId}</span> flagged.
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Reason: {note}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 6000 });
      } else if (action === 'status-update') {
          // Analyst manual review update
          toast.success(`Analyst updated ${transactionId} to ${newStatus}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time notification service');
    });

    return () => {
      socket.disconnect();
    };
  }, []);
};
