import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lockUntilTime, setLockUntilTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (lockUntilTime) {
      interval = setInterval(() => {
        const remaining = Math.ceil((lockUntilTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setLockUntilTime(null);
          setError(null);
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockUntilTime]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  // If no email was passed in state, go back to forgot password
  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const otpString = otp.join('');
      if (otpString.length < 6) {
        setError('Please enter the full 6-digit OTP.');
        setIsLoading(false);
        return;
      }
      await authAPI.post('/reset-password', { email, otp: otpString, password });
      toast.success('Password reset successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = errData?.error || 'Failed to reset password.';
      setError(errMsg);
      toast.error(errMsg);
      
      if (err.response?.status === 429 && errData?.lockUntil) {
        setLockUntilTime(errData.lockUntil);
        setTimeLeft(Math.ceil((errData.lockUntil - Date.now()) / 1000));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLocked = timeLeft > 0;

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-medium text-center">
            Enter the OTP (use 123456 for testing) and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-[#0F1117] border border-white/10 rounded-lg px-4 py-3 text-white/50 focus:outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">OTP Code</label>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center bg-[#0F1117] border border-white/10 rounded-lg text-white font-bold text-xl focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="off"
                  disabled={isLocked}
                  required
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                placeholder="••••••••"
                disabled={isLocked}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                disabled={isLocked}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && !isLocked && (
            <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {isLocked && (
            <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex flex-col items-center">
              <span>Too many failed attempts.</span>
              <span className="font-bold mt-1 text-lg">Try again in {formatTime(timeLeft)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
