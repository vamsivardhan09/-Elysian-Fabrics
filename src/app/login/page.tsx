"use client";

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');

  useEffect(() => {
    if (registered === 'true') {
      setSuccessMsg('Account registered successfully! Please login.');
      setTimeout(() => setSuccessMsg(''), 6000);
    }
  }, [registered]);

  useEffect(() => {
    if (authError) {
      console.log('[Login] NextAuth redirect error:', authError);
      if (authError === 'OAuthSignin') {
        setError('Could not sign in with Google. Check OAuth credentials or try again.');
      } else if (authError === 'OAuthCallback') {
        setError('Error receiving callback from Google. Check whitelisted URIs.');
      } else if (authError === 'OAuthCreateAccount') {
        setError('Failed to create account profile with Google details.');
      } else if (authError === 'Callback') {
        setError('Verification callback failed. Please try again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      setTimeout(() => setError(''), 7050);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        setLoggedInUser(session?.user?.name || email);
        setLoginSuccess(true);
        
        setTimeout(() => {
          if (session?.user?.role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push('/profile');
          }
        }, 1800);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-50 relative"
    >
      {/* Alerts */}
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
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-white text-green-600 px-6 py-4 rounded-full shadow-2xl border border-green-100 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
 
      <AnimatePresence mode="wait">
        {!loginSuccess ? (
          <motion.div
            key="login-form-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[var(--color-rosegold)] transition-colors mb-6">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
        
            <h2 className="text-3xl font-serif text-[var(--color-dark-rosegold)] text-center mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-center text-xs font-light mb-8 font-sans">Login to manage bookings, track orders & view history</p>
        
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Password</label>
                  <a href="#" className="text-xs text-[var(--color-rosegold)] hover:underline">Forgot password?</a>
                </div>
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
        
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing In...</>
                ) : (
                  'Sign In'
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
                  if (config.configured || config.isProduction) {
                    signIn('google', { callbackUrl: '/' });
                  } else {
                    console.log('[Login] Google OAuth not configured. Authenticating with offline Google Mock user...');
                    const res = await signIn('credentials', {
                      redirect: false,
                      email: 'google-tester@example.com',
                      password: 'google_mock_password',
                    });
                    if (res?.error) {
                      setError('Google Mock Sign-In failed');
                      setLoading(false);
                    } else {
                      const sessionRes = await fetch('/api/auth/session');
                      const session = await sessionRes.json();
                      setLoggedInUser(session?.user?.name || 'Google Test User');
                      setLoginSuccess(true);
                      setTimeout(() => {
                        router.push('/');
                      }, 1800);
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
              Don't have an account yet?{' '}
              <Link href="/register" className="text-[var(--color-rosegold)] font-semibold hover:underline">
                Create one for free
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="login-success-panel"
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
            
            <h2 className="text-2xl font-serif text-[var(--color-dark-rosegold)] font-semibold mb-2">Welcome Back!</h2>
            <p className="text-sm text-gray-500 font-light max-w-[280px] leading-relaxed">
              Namaste, <span className="font-semibold text-gray-800">{loggedInUser}</span>.<br />
              Setting up your tailor boutique styling panel...
            </p>
            
            <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden mt-8">
              <motion.div
                className="h-full bg-[var(--color-rosegold)]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] p-4">
      <Suspense fallback={<div className="text-center py-10">Loading login form...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
