import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Applications"
              value={stats?.total_applications || 0}
              icon="📋"
              color="blue"
            />
            <StatCard
              title="Pending Review"
              value={stats?.pending_applications || 0}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              title="Approved"
              value={stats?.approved_applications || 0}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Rejected"
              value={stats?.rejected_applications || 0}
              icon="❌"
              color="red"
            />
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Auto Approved"
              value={stats?.auto_approved || 0}
              icon="🤖"
              color="green"
            />
            <StatCard
              title="Auto Rejected"
              value={stats?.auto_rejected || 0}
              icon="🤖"
              color="red"
            />
            <StatCard
              title="Open Grievances"
              value={stats?. open_grievances || 0}
              icon="💬"
              color="purple"
            />
            <StatCard
              title="Fraud Alerts"
              value={stats?.fraud_alerts || 0}
              icon="🚨"
              color="red"
            />
          </div>

          {/* Total Disbursed */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Amount Disbursed</h3>
            <p className="text-3xl font-bold text-green-600">
              ₹{(stats?.total_disbursed || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    purple:  'bg-purple-50 text-purple-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}