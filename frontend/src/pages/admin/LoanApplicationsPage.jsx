import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function LoanApplicationsPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    try {
      const url = filter === 'all' ? '/admin/loans' : `/admin/loans?status=${filter}`;
      const response = await api.get(url);
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (loanId, status, remarks = '') => {
    try {
      await api.put(`/admin/loans/${loanId}/status`, {
        status,
        admin_remarks: remarks,
        rejection_reason: status === 'rejected' ? remarks : null
      });
      fetchLoans();
    } catch (error) {
      console. error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved:  'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getRiskBadge = (category) => {
    const badges = {
      LOW: 'bg-green-100 text-green-700',
      MEDIUM:  'bg-yellow-100 text-yellow-700',
      HIGH: 'bg-red-100 text-red-700'
    };
    return badges[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Loan Applications</h1>
            
            {/* Filter Tabs */}
            <div className="flex space-x-2">
              {['all', 'pending', 'approved', 'rejected']. map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f. charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading applications..." />
          ) : loans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No loan applications found
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover: bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">#{loan.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{loan.user_name}</div>
                        <div className="text-sm text-gray-500">{loan.user_email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">{loan.loan_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{loan. loan_amount?. toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadge(loan.risk_category)}`}>
                          {loan.risk_category} ({Math.round(loan.risk_score * 100)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(loan.status)}`}>
                          {loan.status. toUpperCase()}
                          {loan.auto_decision && ' (Auto)'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {loan.status === 'pending' ?  (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(loan.id, 'approved', 'Approved by admin')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(loan.id, 'rejected', 'Rejected by admin')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/admin/loans/${loan. id}`)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover: bg-gray-200"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}