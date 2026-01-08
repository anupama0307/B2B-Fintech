import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // MATCH BACKEND: GET /admin/stats
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide loan statistics overview</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* ADMIN ONLY: System-wide Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Applications" value={stats?.total_loans || 0} icon="📋" color="blue" />
            <StatCard title="Pending Review" value={stats?.pending || 0} icon="⏳" color="yellow" />
            <StatCard title="Approved" value={stats?.approved || 0} icon="✅" color="green" />
            <StatCard title="Rejected" value={stats?.rejected || 0} icon="❌" color="red" />
          </div>

          {/* Volume and Rate Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">💰 Total Amount Requested</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ₹{(stats?.total_amount_requested || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total loan volume requested</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Approval Rate</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.total_loans > 0 
                  ? Math.round(((stats?.approved || 0) / stats.total_loans) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Of total applications</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">🚀 Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/admin/loans" 
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
              >
                <span className="text-2xl">📋</span>
                <p className="font-medium text-blue-700 dark:text-blue-400 mt-2">Review Loans</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">{stats?.pending || 0} pending</p>
              </Link>
              <Link 
                to="/admin/grievances" 
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
              >
                <span className="text-2xl">💬</span>
                <p className="font-medium text-purple-700 dark:text-purple-400 mt-2">Grievances</p>
                <p className="text-sm text-purple-600 dark:text-purple-300">Handle complaints</p>
              </Link>
              <Link 
                to="/admin/risk-analysis" 
                className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center"
              >
                <span className="text-2xl">🎯</span>
                <p className="font-medium text-orange-700 dark:text-orange-400 mt-2">Risk Analysis</p>
                <p className="text-sm text-orange-600 dark:text-orange-300">Analyze profiles</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorStyles[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
