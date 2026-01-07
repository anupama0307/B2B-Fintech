import React from 'react';

export default function GrievanceCard({ grievance, isSelected, onClick }) {
  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      normal: 'bg-gray-100 text-gray-700',
      low: 'bg-gray-50 text-gray-500'
    };
    return badges[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition ${
        isSelected ?  'border-blue-500 bg-blue-50' :  'hover:bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-800 line-clamp-1">{grievance.subject}</p>
          <p className="text-sm text-gray-500">{grievance.user_name}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(grievance.status)}`}>
          {grievance.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(grievance. created_at).toLocaleDateString()}</span>
        <span className={`px-2 py-0.5 rounded ${getPriorityBadge(grievance.priority)}`}>
          {grievance.priority}
        </span>
      </div>

      {grievance.loan_id && (
        <p className="text-xs text-blue-600 mt-1">Loan #{grievance.loan_id}</p>
      )}
    </div>
  );
}