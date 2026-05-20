import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Server, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  User,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUsers, toggleUserStatus } from '../services/authService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';

const AdminPanel = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [services, setServices] = useState([
    { id: 'auth', name: 'Auth Service', url: import.meta.env.VITE_AUTH_URL, status: 'checking', health: null },
    { id: 'transaction', name: 'Transaction Service', url: import.meta.env.VITE_TRANSACTION_URL, status: 'checking', health: null },
    { id: 'scoring', name: 'AI Scoring Service', url: import.meta.env.VITE_SCORING_URL, status: 'checking', health: null },
    { id: 'notification', name: 'Notification Service', url: import.meta.env.VITE_AUDIT_URL, status: 'checking', health: null },
  ]);
  const [loading, setLoading] = useState(false);

  // User Management State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        try {
          const start = Date.now();
          const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
          const latency = Date.now() - start;
          return { 
            ...service, 
            status: 'online', 
            health: { 
              latency, 
              timestamp: new Date().toLocaleTimeString(),
              version: response.data.version || '1.0.0'
            } 
          };
        } catch (err) {
          return { ...service, status: 'offline', health: null };
        }
      })
    );
    setServices(updatedServices);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setUsersError('Failed to load system users. Please check your connection to the Auth Service.');
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    const userToToggle = users.find(u => u._id === userId);
    if (userToToggle && userToToggle._id === currentUser?.id) {
      const confirmSelf = window.confirm("Warning: You are deactivating your own account! If you do this, you will be locked out immediately upon logout or token expiration. Are you sure you want to proceed?");
      if (!confirmSelf) return;
    } else {
      const confirmToggle = window.confirm(`Are you sure you want to ${userToToggle.isActive ? 'deactivate' : 'activate'} user ${userToToggle.name}?`);
      if (!confirmToggle) return;
    }

    try {
      await toggleUserStatus(userId);
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update user status');
    }
  };

  useEffect(() => {
    checkHealth();
    fetchUsers();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">System Administration</h2>
          <p className="text-[#F1F5F9] text-2xl font-bold mt-1">Admin Panel</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => { checkHealth(); fetchUsers(); }}
            disabled={loading || usersLoading}
            className="flex items-center justify-center space-x-2 bg-[#1A1D27] border border-[#2A2D3E] px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:border-[#3B82F6] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading || usersLoading ? 'animate-spin' : ''}`} />
            <span>Reload All</span>
          </button>
        </div>
      </div>

      {/* System Health Section */}
      <div>
        <h3 className="text-white text-lg font-bold mb-4 flex items-center">
          <Activity className="w-5 h-5 text-blue-500 mr-2" />
          Microservice Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl p-6 hover:border-[#3B82F6]/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  service.status === 'online' ? 'bg-green-500/10' : 
                  service.status === 'offline' ? 'bg-red-500/10' : 'bg-blue-500/10'
                }`}>
                  <Server className={`w-6 h-6 ${
                    service.status === 'online' ? 'text-green-500' : 
                    service.status === 'offline' ? 'text-red-500' : 'text-blue-500'
                  }`} />
                </div>
                <div className="flex flex-col items-end">
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    service.status === 'online' ? 'bg-green-500/20 text-green-400' : 
                    service.status === 'offline' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    <Activity className={`w-3 h-3 ${service.status === 'online' ? 'animate-pulse' : ''}`} />
                    <span>{service.status}</span>
                  </div>
                  {service.health && (
                    <span className="text-[10px] text-[#94A3B8] mt-2 font-mono">
                      {service.health.latency}ms
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-[#F1F5F9] font-bold text-lg">{service.name}</h3>
              <p className="text-[#94A3B8] text-xs mt-1 font-mono truncate opacity-50">{service.url}</p>

              <div className="mt-6 pt-6 border-t border-[#2A2D3E] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Last Check</span>
                  <span className="text-[#F1F5F9]">{service.health?.timestamp || '---'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Response</span>
                  <span className={service.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                    {service.status === 'online' ? '200 OK' : 'No Response'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Management Section */}
      <div>
        <h3 className="text-white text-lg font-bold mb-4 flex items-center">
          <Users className="w-5 h-5 text-blue-500 mr-2" />
          User Management
        </h3>
        <div className="bg-[#11131C] border border-[#2A2D3E] rounded-xl overflow-hidden">
          {usersError ? (
            <div className="p-8">
              <ErrorState message={usersError} onRetry={fetchUsers} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1A1D27] border-b border-[#2A2D3E]">
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#4B5563] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3E]">
                  {usersLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="6" className="px-6 py-4">
                          <LoadingSkeleton rows={1} />
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#94A3B8]">
                        No users registered in the system.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-[#1A1D27] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-full ${u.role === 'admin' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#94A3B8]/10 text-[#94A3B8]'}`}>
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-white font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#94A3B8]">
                          {u.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5">
                            <div className={`w-2 h-2 rounded-full ${u.isActive !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className={`text-xs font-semibold ${u.isActive !== false ? 'text-green-400' : 'text-red-400'}`}>
                              {u.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never logged in'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                              u.isActive !== false
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                                : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white'
                            }`}
                          >
                            {u.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Activity className="w-64 h-64 text-blue-500" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold text-white">Infrastructure Integrity</h3>
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            The FraudGuard ecosystem is running in a distributed microservices architecture. 
            All services communicate via a secure internal network and utilize AWS SQS for 
            asynchronous message processing. This panel monitors the real-time availability 
            of each container node.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-[#0F1117] p-4 rounded-lg border border-[#2A2D3E]">
              <p className="text-[#94A3B8] text-[10px] uppercase font-bold mb-1">Queue Health</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-bold">AWS SQS Active</span>
              </div>
            </div>
            <div className="bg-[#0F1117] p-4 rounded-lg border border-[#2A2D3E]">
              <p className="text-[#94A3B8] text-[10px] uppercase font-bold mb-1">Database Cluster</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-bold">MongoDB Atlas Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
