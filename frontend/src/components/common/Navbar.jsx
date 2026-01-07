import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user?.role === 'admin' ? '/admin' :  '/dashboard'} className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">🛡️ RISKON</span>
              {user?.role !== 'admin' && (
                <span className="ml-2 text-purple-600 font-semibold">+ VisualPe</span>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, <span className="font-semibold">{user?.full_name || user?.email}</span>
            </span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              user?.role === 'admin' ? 'bg-red-100 text-red-700' :  'bg-blue-100 text-blue-700'
            }`}>
              {user?.role === 'admin' ?  'ADMIN' : 'USER'}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover: text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}