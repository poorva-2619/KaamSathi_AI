import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from './Loading';
import { isProfileComplete } from '../utils/profileMeta';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRole?: 'job_provider' | 'service_provider';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && profile && profile.role !== allowedRole) {
    return <Navigate to={profile.role === 'job_provider' ? '/job-provider' : '/service-provider'} replace />;
  }

  if (profile && location.pathname === '/onboarding' && isProfileComplete(profile)) {
    return <Navigate to={profile.role === 'job_provider' ? '/job-provider/home' : '/service-provider/home'} replace />;
  }

  if (profile && !isProfileComplete(profile) && (
    location.pathname === '/job-provider' ||
    location.pathname.startsWith('/job-provider/') ||
    location.pathname === '/service-provider' ||
    location.pathname.startsWith('/service-provider/')
  )) {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

