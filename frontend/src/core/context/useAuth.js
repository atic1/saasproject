import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { isTokenExpired, getTokenRole } from '../utils/jwt';
import { PLATFORM_ROLES } from '../constants/roles';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');

  const isSuperAdmin = () => {
    if (!ctx.token) return false;
    return getTokenRole(ctx.token) === PLATFORM_ROLES.SUPER_ADMIN;
  };

  const isAuthenticated = () => {
    return !!ctx.token && !isTokenExpired(ctx.token);
  };

  return {
    ...ctx,
    isSuperAdmin,
    isAuthenticated,
  };
};