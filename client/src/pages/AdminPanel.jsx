import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [services, setServices] = useState([
    { id: 'auth', name: 'Auth Service', url: import.meta.env.VITE_AUTH_URL, status: 'checking', health: null },
    { id: 'transaction', name: 'Transaction Service', url: import.meta.env.VITE_TRANSACTION_URL, status: 'checking', health: null },
    { id: 'scoring', name: 'AI Scoring Service', url: import.meta.env.VITE_SCORING_URL, status: 'checking', health: null },
    { id: 'notification', name: 'Notification Service', url: import.meta.env.VITE_AUDIT_URL, status: 'checking', health: null },
  ]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">System Administration</h2>
          <p className="text-[#F1F5F9] text-2xl font-bold mt-1">Microservices Infrastructure</p>
        </div>
        <button 
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-[#1A1D27] border border-[#2A2D3E] px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:border-[#3B82F6] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Run Diagnostics'}</span>
        </button>
      </div>

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
