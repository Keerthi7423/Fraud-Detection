import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const response = await authAPI.post('/login', { email, password });
      const { user, token } = response.data;
      dispatch(setCredentials({ user, token }));
      navigate('/');
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#3B82F6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-[400px] w-full bg-[#1A1D27] rounded-xl border border-white/5 p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500/10 p-3 rounded-xl mb-4">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FraudGuard</h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-medium">Secure. Real-time. Intelligent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="admin@fraudguard.ai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Access Terminal'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[#94A3B8] text-xs">
            Internal Analyst Terminal. Unauthorized access is monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
