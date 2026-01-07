import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function LoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoanDetail();
  }, [id]);

  const fetchLoanDetail = async () => {
    try {
      const response = await api.get(`/admin/loans/${id}`);
      setData(response.data);
    } catch (error) {
      console. error('Error fetching loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await api.put(`/admin/loans/${id}/status`, {
        status,
        admin_remarks: status === 'approved' ? 'Approved by admin' : 'Rejected by admin'
      });
      fetchLoanDetail();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <LoadingSpinner text="Loading loan details..." />
          </main>
        </div>
      </div>
    );
  }

  const { loan, user } = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <button
            onClick={() => navigate('/admin/loans')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Loans
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Loan Application #{id}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Loan Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Loan Type</span>
                  <span className="font-medium capitalize">{loan?.loan_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Provider</span>
                  <span className="font-medium">{loan?.loan_provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">₹{loan?.loan_amount?. toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenure</span>
                  <span className="font-medium">{loan?.loan_tenure_months} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly EMI</span>
                  <span className="font-medium text-blue-600">₹{loan?. monthly_emi?. toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">EMI to Income</span>
                  <span className="font-medium">{loan?.emi_to_income_ratio}%</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-500">Risk Score</span>
                  <span className={`font-bold ${
                    loan?.risk_category === 'LOW' ? 'text-green-600' : 
                    loan?. risk_category === 'MEDIUM' ?  'text-yellow-600' :  'text-red-600'
                  }`}>
                    {Math.round(loan?. risk_score * 100)}% ({loan?.risk_category})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    loan?.status === 'approved' ? 'bg-green-100 text-green-700' :
                    loan?.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {loan?.status?. toUpperCase()}
                    {loan?.auto_decision && ' (Auto)'}
                  </span>
                </div>
              </div>

              {loan?.status === 'pending' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}

              {loan?.rejection_reason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">Rejection Reason: </p>
                  <p className="text-sm text-red-600">{loan.rejection_reason}</p>
                </div>
              )}

              {loan?. ai_rejection_reason && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">AI Generated Reason:</p>
                  <p className="text-sm text-blue-600 whitespace-pre-wrap">{loan. ai_rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{user?. email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Occupation</span>
                  <span className="font-medium">{user?.occupation || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Employment Years</span>
                  <span className="font-medium">{user?.employment_years} years</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual Income</span>
                  <span className="font-medium">₹{user?. annual_income?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Expenses</span>
                  <span className="font-medium">₹{user?. monthly_expenses?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Existing Loans</span>
                  <span className="font-medium">₹{user?. existing_loan_amount?.toLocaleString('en-IN')}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Score</span>
                  <span className="font-bold text-blue-600">{user?.customer_score}/900</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expense Mismatch</span>
                  <span className={`font-medium ${user?.expense_mismatch ?  'text-red-600' : 'text-green-600'}`}>
                    {user?.expense_mismatch ? `Yes (${user?.expense_mismatch_percent}%)` : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}