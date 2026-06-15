import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  generateOtp,
  verifyOtp,
  resetStep,
  clearError,
  selectAuthStep,
  selectOtpLoading,
  selectAuthLoading,
  selectAuthError,
} from '../store/slices/authSlice';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const step = useAppSelector(selectAuthStep);
  const otpLoading = useAppSelector(selectOtpLoading);
  const verifyLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // Local form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);

  const loading = step === 1 ? otpLoading : verifyLoading;

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(generateOtp({ email, name }));
    if (generateOtp.fulfilled.match(result)) {
      // step automatically goes to 2 in the reducer
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const otpValue = otp.join('');
    const result = await dispatch(verifyOtp({ email, otp: otpValue }));
    if (verifyOtp.fulfilled.match(result)) {
      navigate('/products');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    dispatch(clearError());
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 4) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(resetStep());
    setOtp(['', '', '', '', '']);
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="flex w-full min-h-screen bg-white overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden md:flex w-1/2 relative bg-indigo-50 items-center justify-center h-full">
        <img
          src="/image.png"
          alt="Uplist your product to market"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 py-12 bg-[#f8f9fa] min-h-screen">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <span className="text-2xl font-bold text-indigo-900 tracking-tight">Productr</span>
            <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center overflow-hidden">
              <div className="w-4 h-4 border-2 border-white rounded-full" />
            </div>
          </div>

          <h1 className="text-[12px] font-bold text-[#0f172a] mb-10 text-left tracking-tight">
            Login to your Productr Account
          </h1>

          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step 1 — Email + Name */}
          {step === 1 ? (
            <form onSubmit={handleGenerateOTP} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); dispatch(clearError()); }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors outline-none"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); dispatch(clearError()); }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors outline-none`}
                  placeholder="Acme@gmail.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0a0a4a] text-white py-3.5 rounded-lg font-medium hover:bg-indigo-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                )}
                {loading ? 'Sending OTP...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Step 2 — OTP */
            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter OTP sent to <span className="text-indigo-700 font-semibold">{email}</span>
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-semibold rounded-lg border ${
                        error ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none`}
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0a0a4a] text-white py-3.5 rounded-lg font-medium hover:bg-indigo-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                )}
                {loading ? 'Verifying...' : 'Enter your OTP'}
              </button>

              <div className="text-center text-sm text-gray-500">
                Didn't receive OTP?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-indigo-800 font-semibold hover:underline"
                >
                  Resend
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
