import React, { createContext, useContext, useState, useEffect } from 'react';

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
        role: 'owner',
        businessId: 'b1',
        businessName: 'FitZone Gym',
        businessType: 'gym'
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
        role: 'owner',
        businessId: 'b3',
        businessName: 'Glow Beauty Salon',
        businessType: 'salon'
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
        role: 'owner',
        businessId: 'b2',
        businessName: 'Smile Dental Clinic',
        businessType: 'clinic'
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
          businessType: business.businessType,
          role: business.role
        };
        localStorage.setItem('saas_user', JSON.stringify(updated));
        return updated;
      });

      // Call backend if authenticated with real token
      const token = localStorage.getItem('saas_token');
      if (token && !token.startsWith('mock-')) {
        try {
          await fetch('http://localhost:5000/api/auth/select-business', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ businessId: business.businessId })
          });
        } catch (err) {
          console.warn('Failed to sync active business on backend:', err);
        }
      }
    } else {
      localStorage.removeItem('saas_active_business');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        const loggedUser = {
          ...data.user,
          avatarUrl: data.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        };
        
        // Auto-select first membership
        const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0 ? loggedUser.memberships[0] : null;
        if (firstMembership) {
          loggedUser.businessId = firstMembership.businessId;
          loggedUser.businessName = firstMembership.businessName;
          loggedUser.businessType = firstMembership.businessType;
          loggedUser.role = firstMembership.role;
        }

        setUser(loggedUser);
        localStorage.setItem('saas_user', JSON.stringify(loggedUser));
        
        setActiveBusiness(firstMembership);
        if (firstMembership) {
          localStorage.setItem('saas_active_business', JSON.stringify(firstMembership));
        } else {
          localStorage.removeItem('saas_active_business');
        }

        localStorage.setItem('saas_token', data.token);
        return loggedUser;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.warn('Backend login failed, falling back to mock login:', err.message);
      
      // Fallback mock login
      const found = mockAccounts[email.toLowerCase()];
      if (found) {
        const loggedUser = {
          ...found.user,
          memberships: found.memberships
        };
        
        const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0 ? loggedUser.memberships[0] : null;
        if (firstMembership) {
          loggedUser.businessId = firstMembership.businessId;
          loggedUser.businessName = firstMembership.businessName;
          loggedUser.businessType = firstMembership.businessType;
          loggedUser.role = firstMembership.role;
        }

        setUser(loggedUser);
        localStorage.setItem('saas_user', JSON.stringify(loggedUser));
        
        setActiveBusiness(firstMembership);
        if (firstMembership) {
          localStorage.setItem('saas_active_business', JSON.stringify(firstMembership));
        } else {
          localStorage.removeItem('saas_active_business');
        }

        localStorage.setItem('saas_token', found.token);
        return loggedUser;
      } else {
        // Allow dynamic registration login for demo purposes
        const dynamicUser = {
          id: 'dyn_' + Date.now(),
          email: email,
          name: email.split('@')[0],
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          role: 'owner',
          businessType: 'gym',
          businessName: 'My Custom Business',
          subscriptionPlan: 'starter',
          memberships: [
            {
              businessId: 'dyn_b_' + Date.now(),
              businessName: 'My Custom Business',
              businessType: 'gym',
              role: 'owner'
            }
          ]
        };

        dynamicUser.businessId = dynamicUser.memberships[0].businessId;
        dynamicUser.businessName = dynamicUser.memberships[0].businessName;
        dynamicUser.businessType = dynamicUser.memberships[0].businessType;
        dynamicUser.role = dynamicUser.memberships[0].role;

        setUser(dynamicUser);
        localStorage.setItem('saas_user', JSON.stringify(dynamicUser));
        
        setActiveBusiness(dynamicUser.memberships[0]);
        localStorage.setItem('saas_active_business', JSON.stringify(dynamicUser.memberships[0]));
        
        localStorage.setItem('saas_token', 'mock-jwt-token-dyn');
        return dynamicUser;
      }
    }
  };

  const register = async (name, email, password, businessName, businessType, subscriptionPlan) => {
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
        
        const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0 ? loggedUser.memberships[0] : null;
        if (firstMembership) {
          loggedUser.businessId = firstMembership.businessId;
          loggedUser.businessName = firstMembership.businessName;
          loggedUser.businessType = firstMembership.businessType;
          loggedUser.role = firstMembership.role;
        }

        setUser(loggedUser);
        localStorage.setItem('saas_user', JSON.stringify(loggedUser));
        
        setActiveBusiness(firstMembership);
        if (firstMembership) {
          localStorage.setItem('saas_active_business', JSON.stringify(firstMembership));
        }

        localStorage.setItem('saas_token', data.token);
        return loggedUser;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.warn('Backend registration failed, falling back to mock registration:', error.message);
      
      // Fallback mock registration
      const dynamicUser = {
        id: 'dyn_' + Date.now(),
        email: email,
        name: name,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        role: 'owner',
        businessType: businessType,
        businessName: businessName,
        subscriptionPlan: subscriptionPlan || 'starter',
        memberships: [
          {
            businessId: 'dyn_b_' + Date.now(),
            businessName: businessName,
            businessType: businessType,
            role: 'owner'
          }
        ]
      };
      
      dynamicUser.businessId = dynamicUser.memberships[0].businessId;
      dynamicUser.businessName = dynamicUser.memberships[0].businessName;
      dynamicUser.businessType = dynamicUser.memberships[0].businessType;
      dynamicUser.role = dynamicUser.memberships[0].role;
      
      setUser(dynamicUser);
      localStorage.setItem('saas_user', JSON.stringify(dynamicUser));
      
      setActiveBusiness(dynamicUser.memberships[0]);
      localStorage.setItem('saas_active_business', JSON.stringify(dynamicUser.memberships[0]));
      
      localStorage.setItem('saas_token', 'mock-jwt-token-register');
      return dynamicUser;
    }
  };

  const quickLogin = (presetEmail) => {
    const found = mockAccounts[presetEmail];
    if (found) {
      const loggedUser = {
        ...found.user,
        memberships: found.memberships
      };
      
      const firstMembership = loggedUser.memberships && loggedUser.memberships.length > 0 ? loggedUser.memberships[0] : null;
      if (firstMembership) {
        loggedUser.businessId = firstMembership.businessId;
        loggedUser.businessName = firstMembership.businessName;
        loggedUser.businessType = firstMembership.businessType;
        loggedUser.role = firstMembership.role;
      }
      
      setUser(loggedUser);
      localStorage.setItem('saas_user', JSON.stringify(loggedUser));
      
      setActiveBusiness(firstMembership);
      if (firstMembership) {
        localStorage.setItem('saas_active_business', JSON.stringify(firstMembership));
      } else {
        localStorage.removeItem('saas_active_business');
      }
      
      localStorage.setItem('saas_token', found.token);
      return loggedUser;
    }
    return null;
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
        businessType: updatedActive.businessType,
        role: updatedActive.role
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
      activeBusiness,
      setActiveBusiness: handleSetActiveBusiness,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role === 'superadmin' || user?.platformrole === 'super_admin',
      businessType: activeBusiness?.businessType || user?.businessType || 'gym',
      role: activeBusiness?.role || user?.role || 'owner'
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
