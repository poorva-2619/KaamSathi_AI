import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Loader2, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useTranslation } from 'react-i18next';

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    setEmailError('');
    setFormError('');

    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError('');

    try {
      await authService.resetPasswordForEmail(email);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Password reset request error:', err);
      const message = err instanceof Error ? err.message : 'Unable to send reset email. Please try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card relative">
        <div className="absolute top-4 left-4">
          <BackButton />
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('resetLinkSent', 'Reset Link Sent')}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {t(
                'resetLinkSentMessage',
                'Check your email for instructions to reset your password. If it doesn’t appear in a few minutes, check your spam folder.'
              )}
            </p>
            <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-700 border border-slate-200">
              {email}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                {t('tryAnotherEmail', 'Try another email')}
              </button>
              <Link
                to="/login"
                className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backToLogin', 'Back to Log In')}</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 mt-2">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary-100">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('forgotPasswordTitle', 'Reset Password')}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t(
                  'forgotPasswordSubtitle',
                  'Enter your email address and we’ll send you a password reset link.'
                )}
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('emailAddress', 'Email Address')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder', 'you@example.com')}
                  disabled={loading}
                  autoFocus
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('sendingResetLink', 'Sending reset link...')}</span>
                  </>
                ) : (
                  <span>{t('sendResetLink', 'Send Reset Link')}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-primary-600 font-semibold hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('backToLogin', 'Back to Log In')}</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
