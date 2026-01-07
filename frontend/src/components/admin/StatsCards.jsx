import React from 'react';

export default function StatsCards({ stats }) {
  const cards = [
    { title: 'Total Applications', value: stats?. total_applications || 0, icon: '📋', color: 'blue' },
    { title: 'Pending Review', value: stats?. pending_applications || 0, icon: '⏳', color:  'yellow' },
    { title: 'Approved', value: stats?. approved_applications || 0, icon: '✅', color:  'green' },
    { title:  'Rejected', value: stats?.rejected_applications || 0, icon: '❌', color: 'red' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[card.color]}`}>
              {card. icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}