import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
      // MATCH BACKEND: Use available endpoint /loans/my-loans
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user?.full_name}</h1>
              <p className="text-gray-500 dark:text-gray-400">Here is your financial overview</p>
            </div>
            <Link to="/apply-loan" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
              + New Loan
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Borrowed</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{stats.totalBorrowed.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Loans</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Pending Applications</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
