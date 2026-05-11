import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const HourlyBarChart = ({ data }) => {
  return (
    <div className="bg-[#1A1D27] p-6 rounded-xl border border-[#2A2D3E] h-[400px]">
      <h3 className="text-[#F1F5F9] text-lg font-semibold mb-6">Peak Fraud Hours</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3E" vertical={false} />
            <XAxis 
              dataKey="hour" 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: '#1F2235' }}
              contentStyle={{ 
                backgroundColor: '#1A1D27', 
                border: '1px solid #2A2D3E',
                borderRadius: '8px',
                color: '#F1F5F9'
              }}
              formatter={(value) => [`${value} incidents`, 'Fraud Count']}
            />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.count > 5 ? '#EF4444' : '#3B82F6'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyBarChart;
