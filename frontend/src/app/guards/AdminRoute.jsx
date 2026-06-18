import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/context/useAuth';
import { ROUTES } from '../../core/constants/routes';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  // Must be logged in AND have super_admin role from JWT
  // Never from headers — fixes Vulnerability #1
  if (!isAuthenticated() || !isSuperAdmin()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};