import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/loans', label: 'Loan Applications', icon: '📋' },
    { path: '/admin/risk-analysis', label: 'Risk Analysis', icon: '🎯' },
    { path: '/admin/grievances', label: 'Grievances', icon: '💬' },
  ];

  const userLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/apply-loan', label: 'Apply for Loan', icon: '💰' },
    { path: '/my-loans', label: 'My Loans', icon: '📋' },
    { path: '/grievances', label: 'Grievances', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r">
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center px-4 py-3 rounded-lg transition ${location.pathname === link.path
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <span className="mr-3 text-xl">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}