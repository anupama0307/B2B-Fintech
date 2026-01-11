import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/solid';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
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
            <LoadingSpinner text="Loading dashboard..." />
          </main>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total_loans || 0,
      icon: DocumentTextIcon,
      color: 'primary',
      bg: 'bg-primary-100 dark:bg-primary-900/30',
      text: 'text-primary-600 dark:text-primary-400'
    },
    {
      title: 'Pending Review',
      value: stats?.pending || 0,
      icon: ClockIcon,
      color: 'yellow',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircleIcon,
      color: 'accent',
      bg: 'bg-accent-100 dark:bg-accent-900/30',
      text: 'text-accent-600 dark:text-accent-400'
    },
    {
      title: 'Rejected',
      value: stats?.rejected || 0,
      icon: XCircleIcon,
      color: 'red',
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400'
    },
  ];

  const approvalRate = stats?.total_loans > 0
    ? Math.round(((stats?.approved || 0) / stats.total_loans) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide loan statistics overview</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div
                key={card.title}
                className="stat-card group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${card.bg}`}>
                    <card.icon className={`w-6 h-6 ${card.text}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Volume and Rate Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-xl">
                  <BanknotesIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Amount Requested</h3>
              </div>
              <p className="text-4xl font-bold gradient-text">
                ₹{(stats?.total_amount_requested || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total loan volume requested</p>
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                  <ChartBarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Approval Rate</h3>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-gray-800 dark:text-white">{approvalRate}%</p>
                <span className="text-accent-500 mb-1">
                  {approvalRate >= 50 ? '↑' : '↓'}
                </span>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Of total applications</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card animate-slide-up" style={{ animationDelay: '600ms' }}>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">🚀 Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/loans"
                className="group p-5 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-600 rounded-lg group-hover:scale-110 transition-transform">
                    <DocumentTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-700 dark:text-primary-400">Review Loans</p>
                    <p className="text-sm text-primary-600 dark:text-primary-300">{stats?.pending || 0} pending</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/grievances"
                className="group p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-400">Grievances</p>
                    <p className="text-sm text-purple-600 dark:text-purple-300">Handle complaints</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/risk-analysis"
                className="group p-5 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                    <ShieldExclamationIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-700 dark:text-orange-400">Risk Analysis</p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">Analyze profiles</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
