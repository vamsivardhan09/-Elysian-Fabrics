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
  const [registerSuccess, setRegisterSuccess] = useState(false);
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

        setRegisterSuccess(true);

        setTimeout(() => {
          if (!loginRes?.error) {
            router.push('/profile?welcome=true');
          } else {
            router.push('/login?registered=true');
          }
        }, 2200);
      } else {
        setError(data.error || 'OTP verification failed');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during account creation.');
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

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-50 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {registerSuccess ? (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-18 h-18 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-inner">
                <motion.svg
                  className="w-9 h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.polyline
                    points="20 6 9 17 4 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  />
                </motion.svg>
              </div>
              
              <h2 className="text-2xl font-serif text-[var(--color-dark-rosegold)] font-semibold mb-2">Account Created!</h2>
              <p className="text-sm text-gray-500 font-light max-w-[280px] leading-relaxed">
                Welcome to the Elysian family, <span className="font-semibold text-gray-800">{name || 'Customer'}</span>.<br />
                Setting up your bespoke traditional outfit catalog...
              </p>
              
              <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden mt-8">
                <motion.div
                  className="h-full bg-[var(--color-rosegold)]"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
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
                      className="input-base pl-11 focus:ring-2 focus:ring-[var(--color-rosegold)] focus:border-transparent focus:shadow-[0_0_15px_rgba(212,163,115,0.15)] transition-all duration-300 outline-none" 
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
                      className="input-base pl-11 focus:ring-2 focus:ring-[var(--color-rosegold)] focus:border-transparent focus:shadow-[0_0_15px_rgba(212,163,115,0.15)] transition-all duration-300 outline-none" 
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
                      className="input-base pl-11 pr-11 focus:ring-2 focus:ring-[var(--color-rosegold)] focus:border-transparent focus:shadow-[0_0_15px_rgba(212,163,115,0.15)] transition-all duration-300 outline-none" 
                      placeholder="••••••••"
                      required 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                      className="input-base pl-11 pr-11 focus:ring-2 focus:ring-[var(--color-rosegold)] focus:border-transparent focus:shadow-[0_0_15px_rgba(212,163,115,0.15)] transition-all duration-300 outline-none" 
                      placeholder="••••••••"
                      required 
                    />
                  </div>
                </div>
  
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending Verification...</>
                  ) : (
                    'Send Verification OTP'
                  )}
                </motion.button>
              </form>
  
              <div className="relative flex py-4 items-center justify-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider font-sans">Or continue with</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>
  
              <motion.button
                whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  try {
                    const checkRes = await fetch('/api/auth/google-config');
                    const config = await checkRes.json();
                    if (config.configured) {
                      signIn('google', { callbackUrl: '/' });
                    } else {
                      console.log('[Register] Google OAuth not configured. Authenticating with offline Google Mock user...');
                      const res = await signIn('credentials', {
                        redirect: false,
                        email: 'google-tester@example.com',
                        password: 'google_mock_password',
                      });
                      if (res?.error) {
                        setError('Google Mock Sign-In failed');
                        setLoading(false);
                      } else {
                        setSuccess(true);
                        setRegisterSuccess(true);
                        setTimeout(() => {
                          router.push('/');
                        }, 2000);
                      }
                    }
                  } catch {
                    signIn('google', { callbackUrl: '/' });
                  }
                }}
                disabled={loading}
                className="w-full py-3 bg-white border border-gray-100 rounded-xl font-semibold text-gray-600 hover:border-gray-200 transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </motion.button>
  
              <p className="text-center text-xs text-gray-500 mt-6 font-sans">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--color-rosegold)] font-semibold hover:underline">
                  Login here
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <button 
                onClick={() => setStep(1)} 
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[var(--color-rosegold)] transition-colors mb-6 cursor-pointer"
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
                      className="w-12 h-14 bg-gray-50 border border-gray-100 rounded-xl text-center text-xl font-bold text-gray-800 focus:bg-white focus:border-[var(--color-rosegold)] focus:ring-2 focus:ring-[var(--color-rosegold)] focus:shadow-[0_0_15px_rgba(212,163,115,0.15)] outline-none transition-all shadow-sm"
                      required
                    />
                  ))}
                </div>
  
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying Code...</>
                  ) : (
                    'Verify & Create Account'
                  )}
                </motion.button>
              </form>
  
              <div className="text-center mt-6">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--color-rosegold)] font-semibold hover:underline cursor-pointer"
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
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
