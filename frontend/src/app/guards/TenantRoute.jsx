import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/context/useAuth';
import { ROUTES } from '../../core/constants/routes';

export const TenantRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, activeBusiness, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Must have an active business selected
  if (!activeBusiness) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // If specific roles required, check membership role
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.role);
    if (!hasRole) {
      return <Navigate to={ROUTES.DASHBOARD_HOME} replace />;
    }
  }

  return children;
};