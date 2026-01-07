import React from 'react';

export default function RiskResult({ result }) {
  if (!result) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-700">Risk Analysis Result</h3>
        <p className="text-gray-500 mt-2">Fill the form and click "Analyze Risk"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Decision Card */}
      <div className={`rounded-xl p-6 text-center ${
        result.decision === 'AUTO_APPROVE' ?  'bg-green-50 border-2 border-green-500' : 
        result.decision === 'MANUAL_REVIEW' ? 'bg-yellow-50 border-2 border-yellow-500' :
        'bg-red-50 border-2 border-red-500'
      }`}>
        <div className="text-4xl mb-2">
          {result.decision === 'AUTO_APPROVE' ? '✅' : 
           result.decision === 'MANUAL_REVIEW' ? '⚠️' :  '❌'}
        </div>
        <h2 className="text-2xl font-bold">
          {result.decision === 'AUTO_APPROVE' ? 'Auto Approve' : 
           result.decision === 'MANUAL_REVIEW' ?  'Manual Review' : 'Auto Reject'}
        </h2>
        <div className="mt-4">
          <p className="text-sm">Risk Score</p>
          <p className="text-3xl font-bold">{result.risk_percentage}%</p>
          <p className="text-sm font-semibold mt-1">{result.risk_category} RISK</p>
        </div>
      </div>

      {/* EMI Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📊 EMI Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monthly EMI</p>
            <p className="text-xl font-bold text-blue-600">
              ₹{result.monthly_emi?.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">EMI to Income</p>
            <p className="text-xl font-bold">{result. emi_to_income_ratio}%</p>
          </div>
        </div>
      </div>

      {/* Max Loan */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-2">💰 Max Recommended Loan</h3>
        <p className="text-2xl font-bold text-green-600">
          ₹{result.max_recommended_loan?.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Risk Factors */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-3">🔍 Risk Factors</h3>
        <ul className="space-y-2">
          {result. risk_factors?. map((factor, index) => (
            <li key={index} className="flex items-start text-sm">
              <span className="text-red-500 mr-2">•</span>
              {factor}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 Recommendation</h3>
        <p className="text-yellow-900">{result.recommendation}</p>
      </div>
    </div>
  );
}