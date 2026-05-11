import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const FraudLineChart = ({ data }) => {
  return (
    <div className="bg-[#1A1D27] p-6 rounded-xl border border-[#2A2D3E] h-[400px]">
      <h3 className="text-[#F1F5F9] text-lg font-semibold mb-6">Fraud Trends (Last 7 Days)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3E" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(str) => {
                const date = new Date(str);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1A1D27', 
                border: '1px solid #2A2D3E',
                borderRadius: '8px',
                color: '#F1F5F9'
              }}
              itemStyle={{ color: '#EF4444' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#EF4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FraudLineChart;
