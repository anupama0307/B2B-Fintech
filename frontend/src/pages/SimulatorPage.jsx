import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function SimulatorPage() {
  const [formData, setFormData] = useState({
    amount: 5000,
    tenure_months: 12,
    income: 50000,
    expenses: 10000
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validate on load and change
  useEffect(() => {
    validateFields(formData);
  }, [formData]);

  const validateFields = (data) => {
    const errors = {};
    if (data.amount < 1000) {
      errors.amount = 'Loan amount must be at least $1,000';
    }
    if (data.income < 15000) {
      errors.income = 'Annual income must be at least $15,000';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: Number(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setResult(null);

    // Block if errors exist
    if (!validateFields(formData)) {
      setGeneralError('Please fix the errors above before continuing.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/simulator/calculate', formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setGeneralError('Simulation failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="mb-8">
            <Link to="/login" className="text-sm text-gray-500 hover:text-indigo-600 transition flex items-center gap-1 mb-4">
              &larr; Back to Login
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-800">
              Loan Simulator 🧮
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Instant AI-powered risk assessment. Zero impact on credit score.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Loan Amount ($) <span className="text-gray-300 font-normal normal-case">(Min: $1,000)</span>
                </label>
                <input
                  name="amount"
                  type="number"
                  min="1000"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition font-medium text-gray-700 ${fieldErrors.amount ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                  placeholder="e.g. 5000"
                />
                {fieldErrors.amount && (
                  <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">
                    {fieldErrors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Duration (Months)
                </label>
                <input
                  name="tenure_months"
                  type="number"
                  required
                  value={formData.tenure_months}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-medium text-gray-700"
                  placeholder="e.g. 12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Annual Income <span className="text-gray-300 font-normal normal-case">(Min: $15k)</span>
                  </label>
                  <input
                    name="income"
                    type="number"
                    min="15000"
                    required
                    value={formData.income}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition font-medium text-gray-700 ${fieldErrors.income ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                    placeholder="$$$"
                  />
                  {fieldErrors.income && (
                    <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">
                      {fieldErrors.income}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Monthly Expenses
                  </label>
                  <input
                    name="expenses"
                    type="number"
                    required
                    value={formData.expenses}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-medium text-gray-700"
                    placeholder="$$$"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Object.keys(fieldErrors).length > 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Analyzing...' : 'Calculate Risk'}
            </button>
          </form>

          {generalError && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              {generalError}
            </div>
          )}
        </div>

        {/* Right Side - Result Visualization */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 lg:p-12 flex flex-col justify-center items-center relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-200 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>

          {!result ? (
            <div className="text-center z-10 opacity-60">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                🚀
              </div>
              <h3 className="text-xl font-bold text-gray-400">Ready to Analyze</h3>
              <p className="text-gray-400 mt-2 text-sm max-w-xs mx-auto">
                Fill in the details to see your AI-generated approval odds.
              </p>
            </div>
          ) : (
            <div className="text-center z-10 w-full animate-fadeIn">
              <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-xl border-4 ${result.status === 'LOW' ? 'bg-green-100 border-green-400 text-green-600' :
                result.status === 'MEDIUM' ? 'bg-yellow-100 border-yellow-400 text-yellow-600' :
                  'bg-red-100 border-red-400 text-red-600'
                }`}>
                {result.score}
              </div>

              <h3 className="text-gray-500 font-medium uppercase tracking-widest text-xs">Risk Score</h3>
              <h2 className={`text-4xl font-black mt-1 mb-6 ${result.status === 'LOW' ? 'text-green-600' :
                result.status === 'MEDIUM' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                {result.status} RISK
              </h2>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left w-full">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📊</span> Analysis Report
                </h4>
                <ul className="space-y-2">
                  {result.reasons.length > 0 ? (
                    result.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="mt-1 text-xs">•</span> {reason}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 italic">No specific risk factors identified.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
