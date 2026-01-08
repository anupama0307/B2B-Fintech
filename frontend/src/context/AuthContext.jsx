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
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // MATCH BACKEND: POST /auth/login
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user_id, full_name, role } = response.data;
    
    const userData = {
        id: user_id,
        email,
        full_name,
        role: role || 'user'
    };

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    // MATCH BACKEND: POST /auth/signup
    const response = await api.post('/auth/signup', data);
    return response.data;
  };

  const logout = () => {
    try { api.post('/auth/logout'); } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
