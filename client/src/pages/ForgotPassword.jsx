import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.post('/forgot-password', { email });
      toast.success('OTP generated successfully! Check your console/messages.');
      // Pass the email to the reset password page via state
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to process request.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#3B82F6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-[400px] w-full bg-[#1A1D27] rounded-xl border border-white/5 p-8 shadow-2xl relative z-10">
        <Link to="/login" className="inline-flex items-center text-[#94A3B8] hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500/10 p-3 rounded-xl mb-4">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recover Password</h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-medium text-center">
            Enter your email to receive a secure OTP.
          </p>
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
                Processing...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
