// frontend/src/components/ProtectedRoute.tsx
// Protected route component with role-based access

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User doesn't have permission, redirect to their appropriate dashboard
    const redirectPath = user.role === 'SUPERADMIN' 
      ? '/admin' 
      : user.role === 'MANAGER' 
        ? '/manager' 
        : '/associate';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

