import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers. common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api. post('/auth/login', { email, password });
    return response.data;
  };

  const verifyOTP = async (email, otp) => {
    const response = await api.post('/auth/login/verify', { email, otp });
    const { access_token, user:  userData } = response. data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers. common['Authorization'] = `Bearer ${access_token}`;
    
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  };

  const verifyRegisterOTP = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage. removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOTP, register, verifyRegisterOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);