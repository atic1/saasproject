/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('saas_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [activeBusiness, setActiveBusiness] = useState(() => {
    const stored = localStorage.getItem('saas_active_business');
    if (stored) return JSON.parse(stored);
    
    // Fallback: if user is logged in, auto-select first membership
    const storedUser = localStorage.getItem('saas_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.memberships && parsedUser.memberships.length > 0) {
        return parsedUser.memberships[0];
      }
    }
    return null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('saas_theme') || 'light';
  });

  // Apply theme class/attribute on load and theme toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('saas_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Mock accounts database structured like backend response (true multi-tenant)
  const mockAccounts = {
    'admin@saas.com': {
      user: {
        id: 'sa_1',
        email: 'admin@saas.com',
        name: 'Sarah Connor',
        platformrole: 'super_admin',
        role: 'superadmin',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        memberships: []
      },
      token: 'mock-jwt-token-admin',
      memberships: []
    },
    'gym-owner@fitzone.com': {
      user: {
        id: 'owner_gym',
        email: 'gym-owner@fitzone.com',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        platformrole: 'user'
      },
      token: 'mock-jwt-token-gym',
      memberships: [
        {
          businessId: 'b1',
          businessName: 'FitZone Gym',
          businessType: 'gym',
          role: 'owner'
        },
        {
          businessId: 'b4-gym-sec',
          businessName: 'FitZone Gym (Secondary Branch)',
          businessType: 'gym',
          role: 'manager'
        }
      ]
    },
    'salon-owner@glow.com': {
      user: {
        id: 'owner_salon',
        email: 'salon-owner@glow.com',
        name: 'Chloe Vane',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        platformrole: 'user'
      },
      token: 'mock-jwt-token-salon',
      memberships: [
        {
          businessId: 'b3',
          businessName: 'Glow Beauty Salon',
          businessType: 'salon',
          role: 'owner'
        }
      ]
    },
    'clinic-owner@smile.com': {
      user: {
        id: 'owner_clinic',
        email: 'clinic-owner@smile.com',
        name: 'Dr. Marcus Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        platformrole: 'user'
      },
      token: 'mock-jwt-token-clinic',
      memberships: [
        {
          businessId: 'b2',
          businessName: 'Smile Dental Clinic',
          businessType: 'clinic',
          role: 'owner'
        }
      ]
    }
  };

  const handleSetActiveBusiness = async (business) => {
    setActiveBusiness(business);
    if (business) {
      localStorage.setItem('saas_active_business', JSON.stringify(business));
      
      // Update user fallback fields for backward compatibility
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          businessId: business.businessId,
          businessName: business.businessName,
          businessType: business.businessType
        };
        localStorage.setItem('saas_user', JSON.stringify(updated));
        return updated;
      });

      // Call backend if authenticated with real token
      const token = localStorage.getItem('saas_token');
      if (token && !token.startsWith('mock-')) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/select-business', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ businessId: business.businessId })
          });
          const data = await response.json();

          if (response.ok && data.token) {
            localStorage.setItem('saas_token', data.token);
          }

          if (response.ok && data.activeBusiness) {
            const normalizedBusiness = {
              ...business,
              businessId: data.activeBusiness.id?.toString() || business.businessId,
              businessName: data.activeBusiness.name || business.businessName,
              businessType: data.activeBusiness.type || business.businessType,
              role: data.activeBusiness.role || business.role,
              businessStatus: data.activeBusiness.status,
              subscription: data.activeBusiness.subscription
            };

            setActiveBusiness(normalizedBusiness);
            localStorage.setItem('saas_active_business', JSON.stringify(normalizedBusiness));
          }
        } catch (err) {
          console.warn('Failed to sync active business on backend:', err);
        }
      }
    } else {
      localStorage.removeItem('saas_active_business');
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        delete updated.businessId;
        delete updated.businessName;
        delete updated.businessType;
        localStorage.setItem('saas_user', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      const isEmail = usernameOrEmail.includes('@');
      const isPhone = /^\d+$/.test(usernameOrEmail.trim());
      const payload = { password };
      if (isEmail) {
        payload.email = usernameOrEmail;
      } else if (isPhone) {
        payload.phone = usernameOrEmail.trim();
      } else {
        payload.username = usernameOrEmail;
      }

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok) {
        const loggedUser = {
          ...data.user,
          avatarUrl: data.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        };
        
        if (loggedUser.platformrole === 'super_admin') {
          loggedUser.role = 'superadmin';
        }

        setUser(loggedUser);
        localStorage.setItem('saas_user', JSON.stringify(loggedUser));
        localStorage.setItem('saas_token', data.token);
        
        const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0 ? loggedUser.memberships[0] : null;
        await handleSetActiveBusiness(firstMembership);

        const finalUser = firstMembership ? {
          ...loggedUser,
          businessId: firstMembership.businessId,
          businessName: firstMembership.businessName,
          businessType: firstMembership.businessType
        } : loggedUser;
        return finalUser;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Backend login failed:', err.message);
      throw err;
    }
  };

  const register = async (name, email, password, businessName, businessType) => {
    try {
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const phone = '98' + Math.floor(10000000 + Math.random() * 90000000); // Generate a mock phone matching regex
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          businessName,
          businessType,
          slug
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        const loggedUser = {
          ...data.user,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        };
        
        if (loggedUser.platformrole === 'super_admin') {
          loggedUser.role = 'superadmin';
        }

        setUser(loggedUser);
        localStorage.setItem('saas_user', JSON.stringify(loggedUser));
        localStorage.setItem('saas_token', data.token);

        const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0 ? loggedUser.memberships[0] : null;
        await handleSetActiveBusiness(firstMembership);

        const finalUser = firstMembership ? {
          ...loggedUser,
          businessId: firstMembership.businessId,
          businessName: firstMembership.businessName,
          businessType: firstMembership.businessType
        } : loggedUser;
        return finalUser;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Backend registration failed:', error.message);
      throw error;
    }
  };

  // Map quick-login preset emails to real backend shortcut credentials
  const backendCredentialMap = {
    'gym-owner@fitzone.com': { username: 'admin', password: 'admin123' },
    'admin@saas.com':        { username: 'superadmin', password: 'superadmin123' },
  };

  const quickLogin = async (presetEmail) => {
    const credentials = backendCredentialMap[presetEmail];

    // 1. Try real backend login first (gets real MongoDB ObjectIds)
    if (credentials) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (response.ok) {
          const loggedUser = {
            ...data.user,
            avatarUrl: data.user?.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
          };
          if (loggedUser.platformrole === 'super_admin') {
            loggedUser.role = 'superadmin';
          }
          setUser(loggedUser);
          localStorage.setItem('saas_user', JSON.stringify(loggedUser));
          localStorage.setItem('saas_token', data.token);

          const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0
            ? loggedUser.memberships[0] : null;
          await handleSetActiveBusiness(firstMembership);

          const finalUser = firstMembership ? {
            ...loggedUser,
            businessId: firstMembership.businessId,
            businessName: firstMembership.businessName,
            businessType: firstMembership.businessType
          } : loggedUser;
          return finalUser;
        }
      } catch (err) {
        console.warn('Backend quickLogin failed, using mock fallback:', err);
      }
    }

    // 2. Fallback to mock for accounts without backend shortcut (salon, clinic demo)
    const found = mockAccounts[presetEmail];
    if (found) {
      const loggedUser = { ...found.user, memberships: found.memberships };
      if (loggedUser.platformrole === 'super_admin') loggedUser.role = 'superadmin';
      setUser(loggedUser);
      localStorage.setItem('saas_user', JSON.stringify(loggedUser));
      localStorage.setItem('saas_token', found.token);
      const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0
        ? loggedUser.memberships[0] : null;
      await handleSetActiveBusiness(firstMembership);
      const finalUser = firstMembership ? {
        ...loggedUser,
        businessId: firstMembership.businessId,
        businessName: firstMembership.businessName,
        businessType: firstMembership.businessType
      } : loggedUser;
      return finalUser;
    }
    return null;
  };

  // Allows portal customer registration to auth without page reload
  const setAuthenticatedUser = (userData, token) => {
    const loggedUser = { ...userData };
    setUser(loggedUser);
    localStorage.setItem('saas_user', JSON.stringify(loggedUser));
    localStorage.setItem('saas_token', token);
    // Customers have no business memberships — skip activeBusiness handling
  };

  const logout = () => {
    setUser(null);
    setActiveBusiness(null);
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_active_business');
    localStorage.removeItem('saas_token');
  };

  const updateBusinessDetails = (updatedFields) => {
    if (!activeBusiness) return;
    
    // Update activeBusiness
    const updatedActive = { ...activeBusiness, ...updatedFields };
    setActiveBusiness(updatedActive);
    localStorage.setItem('saas_active_business', JSON.stringify(updatedActive));
    
    // Also update the membership in the user object
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedMemberships = (prevUser.memberships || []).map(m => 
        m.businessId === updatedActive.businessId ? { ...m, ...updatedFields } : m
      );
      
      const updatedUser = {
        ...prevUser,
        memberships: updatedMemberships,
        // Also update flat fields for backward compatibility
        businessId: updatedActive.businessId,
        businessName: updatedActive.businessName,
        businessType: updatedActive.businessType
      };
      
      localStorage.setItem('saas_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      theme,
      login,
      register,
      quickLogin,
      logout,
      toggleTheme,
      updateBusinessDetails,
      setAuthenticatedUser,
      activeBusiness,
      setActiveBusiness: handleSetActiveBusiness,
      isAuthenticated: !!user,
      isSuperAdmin: user?.platformrole === 'super_admin',
      businessId: activeBusiness?.businessId || null,
      businessType: activeBusiness?.businessType || null,
      businessRole: activeBusiness?.role || null,
      platformRole: user?.platformrole || null
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
