import React, { useState, useEffect } from 'react';
import { History, RefreshCcw, User, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { auditAPI } from '../services/api';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const AuditLog = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditAPI.get('/audit');
      // notification service returns array directly or { success, logs }
      // looking at the controller, it returns logs directly
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action) => {
    if (action.includes('Approved')) return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    if (action.includes('Rejected')) return <ShieldAlert className="w-4 h-4 text-red-500" />;
    return <Zap className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">System Integrity</h2>
          <p className="text-[#F1F5F9] text-2xl font-bold mt-1">Audit Trail</p>
        </div>
        <button
          onClick={fetchLogs}
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
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Analyst</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D3E]">
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8">
                    <EmptyState 
                      title="No logs recorded" 
                      description="Action logs will appear here once analysts start reviewing transactions." 
                      icon={History}
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr 
                    key={log._id}
                    className="hover:bg-[#1A1D27] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[#94A3B8]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-[#4B5563]" />
                        <span className="text-sm text-white font-medium">{log.analystName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#3B82F6]">
                      {log.transactionId}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#94A3B8]">
                      {log.message}
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

export default AuditLog;
