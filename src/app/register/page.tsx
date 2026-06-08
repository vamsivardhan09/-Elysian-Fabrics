"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Flow state
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const otpRefs = useRef<HTMLInputElement[]>([]);
  
  // Async states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // OTP Timer countdown
  useEffect(() => {
    if (step !== 2 || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Request OTP from server (Step 1 submit)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setTimer(60);
        setCanResend(false);
        // If in development mode without SMTP, auto-fill the code for easy local testing
        if (data.devMode && data.code) {
          console.log("Auto-filling development OTP:", data.code);
          const splitCode = data.code.split('');
          setOtp(splitCode);
        }
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimer(60);
        setCanResend(false);
        setOtp(new Array(6).fill(''));
        if (otpRefs.current[0]) otpRefs.current[0].focus();
        // Notify user
        const originalSuccess = success;
        setSuccess(true);
        setTimeout(() => setSuccess(originalSuccess), 3000);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Complete Signup (Step 2 submit)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Create user directly (verifying the OTP concurrently)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, code: fullCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Automatically sign in the user to establish NextAuth session
        const loginRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        setTimeout(() => {
          if (!loginRes?.error) {
            router.push('/profile?welcome=true');
          } else {
            router.push('/login?registered=true');
          }
        }, 2000);
      } else {
        setError(data.error || 'OTP verification failed');
      }
    } catch (err) {
      setError('An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  // OTP inputs keyboard navigation
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    // Take only the last character entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // numbers only

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last or next input
    const nextFocusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4">
      {/* Toast Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-white text-red-600 px-6 py-4 rounded-full shadow-2xl border border-red-100 text-sm font-medium"
          >
            <AlertTriangle className="w-4 h-4 text-red-500" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-white text-green-600 px-6 py-4 rounded-full shadow-2xl border border-green-100 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {step === 2 ? 'Account created successfully! Customizing boutique...' : 'Verification code sent!'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-50 relative overflow-hidden">
        {/* Step 1: Input Credentials */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[var(--color-rosegold)] transition-colors mb-6">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>

            <h2 className="text-3xl font-serif text-[var(--color-dark-rosegold)] text-center mb-1">Create Account</h2>
            <p className="text-gray-400 text-center text-xs font-light mb-8">Join Elysian Fabrics to track orders & book tailoring sessions</p>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base pl-11" 
                    placeholder="Enter your name"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base pl-11" 
                    placeholder="you@email.com"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base pl-11 pr-11" 
                    placeholder="••••••••"
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-base pl-11 pr-11" 
                    placeholder="••••••••"
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending Verification...</>
                ) : (
                  'Send Verification OTP'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-6 font-sans">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--color-rosegold)] font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </motion.div>
        )}

        {/* Step 2: Input OTP */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => setStep(1)} 
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[var(--color-rosegold)] transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to details
            </button>

            <div className="w-16 h-16 bg-[var(--color-lightrose)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-dark-rosegold)]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-serif text-[var(--color-dark-rosegold)] text-center mb-1">Verify Email</h2>
            <p className="text-gray-400 text-center text-xs font-light mb-6">
              Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>
            </p>

            {/* Welcoming Psychological Greetings Box */}
            <div className="bg-[var(--color-lightrose)]/40 border border-[var(--color-rosegold)]/10 rounded-2xl p-4 mb-6 flex gap-3">
              <Sparkles className="w-5 h-5 text-[var(--color-rosegold)] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[var(--color-dark-rosegold)] font-light leading-relaxed">
                🌸 <span className="font-medium">Every thread tells a story.</span> Let's verify your address to welcome you into our family and begin crafting outfit collections suited just for you.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* Code Input boxes */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { if (el) otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className="w-12 h-14 bg-gray-50 border border-gray-100 rounded-xl text-center text-xl font-bold text-gray-800 focus:bg-white focus:border-[var(--color-rosegold)] focus:ring-1 focus:ring-[var(--color-rosegold)] outline-none transition-all shadow-sm"
                    required
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying Code...</>
                ) : (
                  'Verify & Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--color-rosegold)] font-semibold hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Verification OTP
                </button>
              ) : (
                <p className="text-xs text-gray-400 font-light font-sans">
                  Resend code in <span className="font-semibold text-gray-600">{timer}s</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
