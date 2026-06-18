import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../api/auth.api';
import {
  setAuthToken,
  setActiveBusinessId,
  clearAuthState,
  setOn401Handler
} from '../api/client';
import { isTokenExpired } from '../utils/jwt';

const getInitialState = () => {
  const savedToken = sessionStorage.getItem('token');
  const savedBusiness = sessionStorage.getItem('activeBusiness');

  if (!savedToken || isTokenExpired(savedToken)) {
    return {
      user: null,
      token: null,
      activeBusiness: null,
      businesses: [],
      isLoading: false,
    };
  }

  setAuthToken(savedToken);

  let parsedBusiness = null;
  if (savedBusiness) {
    try {
      parsedBusiness = JSON.parse(savedBusiness);
      setActiveBusinessId(parsedBusiness._id);
    } catch {
      sessionStorage.removeItem('activeBusiness');
    }
  }

  return {
    user: null,
    token: savedToken,
    activeBusiness: parsedBusiness,
    businesses: [],
    isLoading: true,
  };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialState);

  const logout = useCallback(() => {
    clearAuthState();
    sessionStorage.clear();
    setAuthState({
      user: null,
      token: null,
      activeBusiness: null,
      businesses: [],
      isLoading: false,
    });
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    setOn401Handler(logout);
  }, [logout]);

  useEffect(() => {
    if (!authState.isLoading || !authState.token) return;

    let cancelled = false;

    authApi.getMe()
      .then(data => {
        if (cancelled) return;
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          businesses: data.businesses || [],
          isLoading: false,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        logout();
      });

    return () => { cancelled = true; };
  }, [authState.isLoading, authState.token, logout]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const { token: newToken, user: newUser, businesses: userBusinesses } = data;

    setAuthToken(newToken);
    sessionStorage.setItem('token', newToken);

    const firstBusiness = userBusinesses?.[0] || null;
    if (firstBusiness) {
      setActiveBusinessId(firstBusiness._id);
      sessionStorage.setItem('activeBusiness', JSON.stringify(firstBusiness));
    }

    setAuthState({
      user: newUser,
      token: newToken,
      activeBusiness: firstBusiness,
      businesses: userBusinesses || [],
      isLoading: false,
    });

    return { user: newUser, businesses: userBusinesses };
  };

  const register = async (data) => {
    return await authApi.register(data);
  };

  const switchBusiness = (business) => {
    setActiveBusinessId(business._id);
    sessionStorage.setItem('activeBusiness', JSON.stringify(business));
    setAuthState(prev => ({ ...prev, activeBusiness: business }));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      register,
      switchBusiness,
    }}>
      {authState.isLoading ? null : children}
    </AuthContext.Provider>
  );
};