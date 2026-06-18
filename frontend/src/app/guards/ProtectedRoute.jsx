import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/context/useAuth';
import { ROUTES } from '../../core/constants/routes';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};