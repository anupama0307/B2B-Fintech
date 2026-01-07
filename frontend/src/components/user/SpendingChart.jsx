import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function SpendingChart({ data, title = "Spending Breakdown" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No spending data available</p>
            <p className="text-sm">Upload a bank statement to see breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = data. map((item, index) => ({
    name:  item.category. charAt(0).toUpperCase() + item.category.slice(1),
    value: item.amount,
    color:  COLORS[index % COLORS.length]
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `₹${value. toLocaleString('en-IN')}`}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">
              {item. name} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t text-center">
        <p className="text-sm text-gray-500">Total Spending</p>
        <p className="text-xl font-bold text-gray-800">₹{total.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}