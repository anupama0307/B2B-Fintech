import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';

export default function UploadStatementPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (! file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/statement/upload', formData, {
        headers:  { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload statement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">📄 Upload Bank Statement</h1>

          <div className="max-w-2xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <div className="text-center">
                <div className="text-6xl mb-4">📤</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Your Bank Statement</h2>
                <p className="text-gray-500 mb-6">
                  Upload a CSV file to analyze your spending patterns and verify expenses
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover: text-blue-800"
                  >
                    {file ? (
                      <span className="text-green-600">✓ {file.name}</span>
                    ) : (
                      <span>Click to select CSV file</span>
                    )}
                  </label>
                </div>

                {error && (
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                )}

                <button
                  onClick={handleUpload}
                  disabled={! file || loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover: bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : '📊 Analyze Statement'}
                </button>
              </div>
            </div>

            {/* CSV Format Info */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Expected CSV Format</h3>
              <p className="text-sm text-blue-700 mb-3">
                Your CSV should have columns: Date, Description, Debit, Credit, Balance
              </p>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
{`Date,Description,Debit,Credit,Balance
2024-01-01,Salary Credit,0,50000,150000
2024-01-02,Swiggy Order,500,0,149500
2024-01-03,Amazon Shopping,2500,0,147000`}
              </pre>
            </div>

            {/* Results */}
            {result && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Analysis Results</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Transactions Analyzed</p>
                    <p className="text-2xl font-bold">{result.total_transactions}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Monthly Expenses (Statement)</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{result.monthly_expenses_from_statement?. toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Stated Monthly Expenses</p>
                    <p className="text-2xl font-bold">
                      ₹{result.stated_monthly_expenses?. toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">New Customer Score</p>
                    <p className="text-2xl font-bold text-blue-600">{result.new_customer_score}/900</p>
                  </div>
                </div>

                {/* Mismatch Warning */}
                {result.expense_mismatch && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                    <p className="text-red-700 font-medium">
                      ⚠️ Expense Mismatch Detected:  {result.mismatch_percent}%
                    </p>
                    <p className="text-sm text-red-600">
                      Your stated expenses don't match your bank statement.  This may affect your loan eligibility.
                    </p>
                  </div>
                )}

                {/* Spending Breakdown */}
                {result.spending_breakdown && result.spending_breakdown. length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Spending Breakdown</h4>
                    <div className="space-y-2">
                      {result.spending_breakdown. map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="capitalize text-gray-600">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-16 text-right">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}