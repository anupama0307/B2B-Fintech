import React from 'react';

export default function RiskAnalysisForm({ formData, onChange, onSubmit, loading }) {
  const getTenureDisplay = (months) => {
    if (months < 12) return `${months} months`;
    return `${(months / 12).toFixed(1)} years`;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
          <input
            type="number"
            name="annual_income"
            value={formData.annual_income}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Years</label>
          <input
            type="number"
            name="employment_years"
            value={formData.employment_years}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses (₹)</label>
          <input
            type="number"
            name="monthly_expenses"
            value={formData.monthly_expenses}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Existing Loan Amount (₹)</label>
          <input
            type="number"
            name="existing_loan_amount"
            value={formData.existing_loan_amount}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Score (0-900)</label>
          <input
            type="number"
            name="customer_score"
            value={formData.customer_score}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
            min="0"
            max="900"
          />
        </div>
      </div>

      <hr className="my-4" />
      <h3 className="font-semibold text-gray-800">Loan Details</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
          <input
            type="number"
            name="loan_amount_requested"
            value={formData.loan_amount_requested}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tenure:  {getTenureDisplay(formData.loan_tenure_months)}
          </label>
          <input
            type="range"
            name="loan_tenure_months"
            value={formData.loan_tenure_months}
            onChange={onChange}
            className="w-full"
            min="6"
            max="240"
            step="6"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="has_expense_mismatch"
          checked={formData.has_expense_mismatch}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">Has Expense Mismatch (Fraud Flag)</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : '🎯 Analyze Risk'}
      </button>
    </form>
  );
}