import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('meditrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('meditrack_token') || null);
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('meditrack_shop');
    return saved ? JSON.parse(saved) : null;
  });
  const [healthProfile, setHealthProfile] = useState(() => {
    const saved = localStorage.getItem('meditrack_health');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('meditrack_user', JSON.stringify(res.data.user));
            if (res.data.shop) {
              setShop(res.data.shop);
              localStorage.setItem('meditrack_shop', JSON.stringify(res.data.shop));
            }
            if (res.data.healthProfile) {
              setHealthProfile(res.data.healthProfile);
              localStorage.setItem('meditrack_health', JSON.stringify(res.data.healthProfile));
            }
          }
        } catch {
          // Token invalid, clear state
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password, requiredRole = null) => {
    const res = await api.post('/auth/login', { email, password, requiredRole });
    if (res.data.success) {
      const { token: newToken, user: newUser, shop: newShop, healthProfile: newHealth } = res.data;
      setToken(newToken);
      setUser(newUser);
      setShop(newShop || null);
      setHealthProfile(newHealth || null);

      localStorage.setItem('meditrack_token', newToken);
      localStorage.setItem('meditrack_user', JSON.stringify(newUser));
      if (newShop) localStorage.setItem('meditrack_shop', JSON.stringify(newShop));
      if (newHealth) localStorage.setItem('meditrack_health', JSON.stringify(newHealth));

      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const registerCustomer = async (data) => {
    const res = await api.post('/auth/register-customer', data);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      setShop(null);

      localStorage.setItem('meditrack_token', newToken);
      localStorage.setItem('meditrack_user', JSON.stringify(newUser));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const registerShop = async (data) => {
    const res = await api.post('/auth/register-shop', data);
    if (res.data.success) {
      const { token: newToken, user: newUser, shop: newShop } = res.data;
      setToken(newToken);
      setUser(newUser);
      setShop(newShop);

      localStorage.setItem('meditrack_token', newToken);
      localStorage.setItem('meditrack_user', JSON.stringify(newUser));
      localStorage.setItem('meditrack_shop', JSON.stringify(newShop));
      return res.data;
    }
    throw new Error(res.data.message || 'Shop registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setShop(null);
    setHealthProfile(null);
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
    localStorage.removeItem('meditrack_shop');
    localStorage.removeItem('meditrack_health');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('meditrack_user', JSON.stringify(updatedUser));
  };

  const updateHealthProfileState = (updatedProfile) => {
    setHealthProfile(updatedProfile);
    localStorage.setItem('meditrack_health', JSON.stringify(updatedProfile));
    if (updatedProfile.isCompleted && user) {
      const u = { ...user, isHealthProfileComplete: true };
      setUser(u);
      localStorage.setItem('meditrack_user', JSON.stringify(u));
    }
  };

  const updateShopProfileState = (updatedShop) => {
    setShop(updatedShop);
    localStorage.setItem('meditrack_shop', JSON.stringify(updatedShop));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        shop,
        healthProfile,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        registerCustomer,
        registerShop,
        logout,
        updateUserProfile,
        updateHealthProfileState,
        updateShopProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
