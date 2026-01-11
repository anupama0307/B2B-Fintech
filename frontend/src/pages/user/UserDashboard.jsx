import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/solid';

export default function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState({ active: 0, pending: 0, totalBorrowed: 0 });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/loans/my-loans');
      const loanData = response.data.loans || [];
      setLoans(loanData);

      const active = loanData.filter(l => l.status === 'APPROVED').length;
      const pending = loanData.filter(l => l.status === 'PENDING').length;
      const totalBorrowed = loanData
        .filter(l => l.status === 'APPROVED')
        .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
      setStats({ active, pending, totalBorrowed });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <LoadingSpinner text="Loading your dashboard..." />
          </main>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: PlusIcon, label: 'Apply for Loan', path: '/apply-loan', color: 'from-primary-500 to-primary-600' },
    { icon: MicrophoneIcon, label: 'Voice Assistant', path: '/voice', color: 'from-accent-500 to-accent-600' },
    { icon: DocumentTextIcon, label: 'My Loans', path: '/my-loans', color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'User'}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your financial overview</p>
            </div>
            <Link
              to="/apply-loan"
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Loan
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Borrowed */}
            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <BanknotesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Lifetime</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Borrowed</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                ₹{stats.totalBorrowed.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Active Loans */}
            <div className="stat-card group animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircleIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <span className="text-xs font-medium text-accent-500 uppercase tracking-wide">Active</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Loans</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.active}</p>
            </div>

            {/* Pending Applications */}
            <div className="stat-card group animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-xs font-medium text-yellow-500 uppercase tracking-wide">Pending</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Applications</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.pending}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group card hover:shadow-xl transition-all duration-300 flex items-center gap-4"
                >
                  <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Loans */}
          {loans.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Loans</h2>
                <Link to="/my-loans" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  View all →
                </Link>
              </div>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-dark-border">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purpose</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">EMI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.slice(0, 3).map((loan, index) => (
                      <tr key={loan.id || index} className="border-b border-gray-50 dark:border-dark-border/50 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                        <td className="py-4 px-4 font-semibold text-gray-800 dark:text-white">
                          ₹{parseFloat(loan.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{loan.purpose || 'Personal'}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${loan.status === 'APPROVED' ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400' :
                              loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                          {loan.emi ? `₹${parseFloat(loan.emi).toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {loans.length === 0 && (
            <div className="card text-center py-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-border rounded-full mb-4">
                <ChartBarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No loans yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by applying for your first loan</p>
              <Link to="/apply-loan" className="btn-primary inline-flex items-center gap-2">
                <PlusIcon className="w-5 h-5" />
                Apply Now
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
