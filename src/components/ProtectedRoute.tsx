import React from 'react';
import { Outlet } from 'react-router-dom';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * ProtectedRoute passthrough stub for scaffolding.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
