import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/context/useAuth';
import { ROUTES } from '../../core/constants/routes';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to={ROUTES.DASHBOARD_HOME} replace />;
  }

  return children;
};