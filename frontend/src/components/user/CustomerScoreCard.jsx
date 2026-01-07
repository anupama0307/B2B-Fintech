import React from 'react';

export default function CustomerScoreCard({ score, showDetails = false }) {
  const getScoreColor = (score) => {
    if (score >= 750) return { color: 'text-green-600', bg: 'bg-green-500', label: 'Excellent' };
    if (score >= 650) return { color: 'text-blue-600', bg:  'bg-blue-500', label:  'Good' };
    if (score >= 550) return { color: 'text-yellow-600', bg: 'bg-yellow-500', label: 'Fair' };
    if (score >= 400) return { color: 'text-orange-600', bg:  'bg-orange-500', label:  'Poor' };
    return { color: 'text-red-600', bg:  'bg-red-500', label:  'Very Poor' };
  };

  const scoreInfo = getScoreColor(score);
  const percentage = (score / 900) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Score</h3>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64" cy="64" r="56"
              fill="none" stroke="#E5E7EB" strokeWidth="12"
            />
            <circle
              cx="64" cy="64" r="56"
              fill="none"
              stroke={score >= 650 ? '#10B981' : score >= 550 ?  '#F59E0B' : '#EF4444'}
              strokeWidth="12"
              strokeDasharray={`${percentage * 3.5186} 351. 86`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${scoreInfo.color}`}>{score}</span>
            <span className="text-xs text-gray-500">/ 900</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${scoreInfo.color} ${scoreInfo.bg} bg-opacity-20`}>
          {scoreInfo.label}
        </span>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 text-center">
            {score >= 750 && "You're in excellent standing!  Most loans will be auto-approved."}
            {score >= 650 && score < 750 && "Good score!  You're likely to get favorable loan terms."}
            {score >= 550 && score < 650 && "Fair score.  Some loans may require manual review."}
            {score < 550 && "Consider improving your score before applying for loans."}
          </p>
        </div>
      )}
    </div>
  );
}