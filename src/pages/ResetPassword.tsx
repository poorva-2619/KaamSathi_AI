import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { Loader2, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    let isValid = true;
    setPasswordError('');
    setConfirmError('');
    setFormError('');

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
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
      await authService.updatePassword(password);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Update password error:', err);
      const message = err instanceof Error ? err.message : 'Unable to update password. Please try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card">
        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('passwordUpdated', 'Password Updated Successfully!')}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {t(
                'passwordUpdatedSubtitle',
                'Your password has been changed. You can now log in with your new password.'
              )}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center"
              >
                {t('logIn', 'Log In')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary-100">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('newPassword', 'New Password')}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t('enterNewPasswordPrompt', 'Enter your new password below.')}
              </p>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('newPassword', 'New Password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('newPasswordPlaceholder', 'Enter new password (min. 6 characters)')}
                  disabled={loading}
                  autoFocus
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('confirmNewPassword', 'Confirm New Password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPassword', 'Confirm Password')}
                  disabled={loading}
                  className={`w-full h-11 px-3.5 bg-slate-50 focus:bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    confirmError
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-primary-500 focus:border-transparent'
                  }`}
                />
                {confirmError && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{confirmError}</p>
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
                    <span>{t('updatingPassword', 'Updating password...')}</span>
                  </>
                ) : (
                  <span>{t('updatePassword', 'Update Password')}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                {t('backToLogin', 'Back to Log In')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
