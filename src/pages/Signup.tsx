import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth';
import { profilesService } from '../services/profiles';
import type { UserRole } from '../types/database.types';
import { Briefcase, UserCheck, Loader2, AlertCircle } from 'lucide-react';

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRole: UserRole =
    searchParams.get('role') === 'job_provider' ? 'job_provider' : 'service_provider';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFormError('');

    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError('');

    try {
      // 1. Sign up user via Supabase Auth
      const { user } = await authService.signUp(email, password);

      if (!user) {
        throw new Error('Account creation failed. Please check your details and try again.');
      }

      // 2. Insert bare profiles row
      await profilesService.createBareProfile(user.id, role, '');

      // 3. Redirect to onboarding
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      console.error('Signup error:', err);
      const message = err instanceof Error ? err.message : 'Failed to create account.';
      if (message.toLowerCase().includes('already registered')) {
        setEmailError('This email address is already registered. Try logging in.');
      } else if (message.toLowerCase().includes('weak') || message.toLowerCase().includes('password')) {
        setPasswordError(message);
      } else {
        setFormError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Join <span className="font-semibold text-primary-600">KaamSathi AI</span> to get started
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('job_provider')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                role === 'job_provider'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Provider</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('service_provider')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                role === 'service_provider'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Service Worker</span>
            </button>
          </div>
        </div>

        {/* Global Form Error Banner */}
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className={`w-full h-11 px-3.5 bg-slate-50 focus:bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                emailError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-primary-500 focus:border-transparent'
              }`}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600 font-medium">{emailError}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={loading}
              className={`w-full h-11 px-3.5 bg-slate-50 focus:bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-primary-500 focus:border-transparent'
              }`}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-600 font-medium">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              disabled={loading}
              className={`w-full h-11 px-3.5 bg-slate-50 focus:bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                confirmPasswordError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-primary-500 focus:border-transparent'
              }`}
            />
            {confirmPasswordError && (
              <p className="mt-1 text-xs text-red-600 font-medium">{confirmPasswordError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up as {role === 'job_provider' ? 'Job Provider' : 'Service Worker'}</span>
            )}
          </button>

        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;

