import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { profilesService } from '../services/profiles';
import { Loader2, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
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
      // 1. Sign in via Supabase Auth
      const { user } = await authService.signIn(email, password);

      if (!user) {
        throw new Error('Login failed. Please check your credentials.');
      }

      // 2. Fetch user profile
      const profile = await profilesService.getProfile(user.id);

      // 3. Check profile completeness & redirect
      if (!profile || !profile.full_name || profile.full_name.trim() === '') {
        navigate('/onboarding', { replace: true });
      } else {
        // Redirect to target path or role home
        const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
        if (fromPath && fromPath !== '/login' && fromPath !== '/signup') {
          navigate(fromPath, { replace: true });
        } else if (profile.role === 'job_provider') {
          navigate('/job-provider', { replace: true });
        } else {
          navigate('/service-provider', { replace: true });
        }
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message : 'Invalid login credentials.';
      if (message.toLowerCase().includes('invalid login credentials')) {
        setFormError('Invalid email or password. Please try again.');
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
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your <span className="font-semibold text-primary-600">KaamSathi AI</span> account
          </p>
        </div>

        {/* Global Error Banner */}
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-primary-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;

