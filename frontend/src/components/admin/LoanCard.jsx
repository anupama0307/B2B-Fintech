import React from 'react';

export default function LoanCard({ loan, onApprove, onReject, onView }) {
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
    <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">#{loan.id} - {loan.user_name}</h3>
          <p className="text-sm text-gray-500">{loan.user_email}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(loan.status)}`}>
          {loan.status. toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500">Loan Type</p>
          <p className="font-medium capitalize">{loan.loan_type}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="font-medium">₹{loan. loan_amount?. toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">EMI</p>
          <p className="font-medium text-blue-600">₹{loan. monthly_emi?.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Risk</p>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskBadge(loan.risk_category)}`}>
            {loan. risk_category} ({Math.round(loan.risk_score * 100)}%)
          </span>
        </div>
      </div>

      {loan.status === 'pending' ?  (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(loan. id)}
            className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => onReject(loan.id)}
            className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200"
          >
            ✗ Reject
          </button>
        </div>
      ) : (
        <button
          onClick={() => onView(loan. id)}
          className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
        >
          View Details
        </button>
      )}
    </div>
  );
}