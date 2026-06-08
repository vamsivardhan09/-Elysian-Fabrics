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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (registered === 'true') {
      setSuccessMsg('Account registered successfully! Please login.');
      setTimeout(() => setSuccessMsg(''), 6000);
    }
  }, [registered]);

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
      } else {
        // Successful login - check session to redirect based on role, or go to home / profile
        // For simplicity: fetch session first or check credentials format.
        // Let's redirect to check role. NextAuth session check:
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/profile');
        }
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-50 relative">
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
              className="input-base pl-11" 
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

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing In...</>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-6 font-sans">
        Don't have an account yet?{' '}
        <Link href="/register" className="text-[var(--color-rosegold)] font-semibold hover:underline">
          Create one for free
        </Link>
      </p>
    </div>
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
