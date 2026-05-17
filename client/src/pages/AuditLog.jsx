import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { History, RefreshCcw, User, ShieldCheck, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getAuditLogs } from '../services/auditService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const AuditLog = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    analystName: '',
    action: '',
    startDate: null,
    endDate: null
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = {};
      if (filters.analystName) queryParams.analystName = filters.analystName;
      if (filters.action) queryParams.action = filters.action;
      if (filters.startDate) queryParams.startDate = filters.startDate.toISOString();
      if (filters.endDate) queryParams.endDate = filters.endDate.toISOString();

      const data = await getAuditLogs(queryParams);
      setLogs(Array.isArray(data) ? data : (data.logs || []));
    } catch (err) {
      toast.error('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      analystName: '',
      action: '',
      startDate: null,
      endDate: null
    });
    // Need a timeout to allow state to update before fetch if we don't use useEffect
    setTimeout(() => {
      fetchLogs();
    }, 0);
  };

  const getActionStyles = (action) => {
    switch (action?.toLowerCase()) {
      case 'approved':
        return { color: '#22C55E', icon: <ShieldCheck className="w-4 h-4 mr-2" /> };
      case 'rejected':
        return { color: '#EF4444', icon: <ShieldAlert className="w-4 h-4 mr-2" /> };
      case 'escalated':
        return { color: '#F59E0B', icon: <AlertTriangle className="w-4 h-4 mr-2" /> };
      case 'auto-flagged':
        return { color: '#3B82F6', icon: <Zap className="w-4 h-4 mr-2" /> };
      default:
        return { color: '#94A3B8', icon: <ShieldCheck className="w-4 h-4 mr-2" /> };
    }
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

      <div className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3E] flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">Analyst Name</label>
          <input
            type="text"
            className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6]"
            placeholder="Search by name..."
            value={filters.analystName}
            onChange={(e) => setFilters({ ...filters, analystName: e.target.value })}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">Action</label>
          <select
            className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6]"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
            <option value="auto-flagged">Auto-Flagged</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">From Date</label>
          <DatePicker
            selected={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date })}
            className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6]"
            placeholderText="Start Date"
            isClearable
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">To Date</label>
          <DatePicker
            selected={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date })}
            className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6]"
            placeholderText="End Date"
            isClearable
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#2A2D3E] hover:bg-[#3B4054] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1D27] border-b border-[#2A2D3E]">
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Analyst</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2D3E]">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5" className="px-6 py-4">
                      <LoadingSkeleton rows={1} />
                    </td>
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
                logs.map((log) => {
                  const actionStyle = getActionStyles(log.action);
                  return (
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
                          <span className="text-sm text-white font-medium">{log.analystName || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#3B82F6]">
                        {log.transactionId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center" style={{ color: actionStyle.color }}>
                          {actionStyle.icon}
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8] max-w-xs truncate" title={log.note || log.message}>
                        {log.note || log.message || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
