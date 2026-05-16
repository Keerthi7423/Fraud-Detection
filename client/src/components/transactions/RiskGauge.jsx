import React from 'react';

const RiskGauge = ({ score = 0 }) => {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // SVG Path calculation for the semi-circle arc
  // Radius: 90, Center: 100, 100
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getRiskColor = (s) => {
    if (s <= 30) return '#22C55E'; // Emerald 500
    if (s <= 70) return '#F59E0B'; // Amber 500
    return '#EF4444'; // Red 500
  };

  const getRiskLevel = (s) => {
    if (s <= 30) return 'Low Risk';
    if (s <= 70) return 'Medium Risk';
    if (s <= 90) return 'High Risk';
    return 'Critical Risk';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      <div className="relative w-64 h-32">
        <svg className="w-full h-full transform -rotate-0" viewBox="0 0 200 100">
          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1F2937"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Colored Segments (Visual Guide) */}
          <path
            d="M 20 100 A 80 80 0 0 1 68 32"
            fill="none"
            stroke="#22C55E"
            strokeWidth="2"
            strokeDasharray="2, 4"
            opacity="0.3"
          />
          <path
            d="M 68 32 A 80 80 0 0 1 132 32"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeDasharray="2, 4"
            opacity="0.3"
          />
          <path
            d="M 132 32 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="2, 4"
            opacity="0.3"
          />

          {/* Active Progress */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getRiskColor(normalizedScore)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.5s ease-in-out, stroke 0.5s ease'
            }}
          />
        </svg>

        {/* Needle (Optional, but let's use a cleaner center display) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center translate-y-2">
           <span className="text-5xl font-black font-mono tracking-tighter" style={{ color: getRiskColor(normalizedScore) }}>
             {normalizedScore}
           </span>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B5563] mt-2">
             Risk Index
           </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block ${
          normalizedScore <= 30 ? 'bg-emerald-500/10 text-emerald-500' :
          normalizedScore <= 70 ? 'bg-amber-500/10 text-amber-500' :
          'bg-red-500/10 text-red-500 animate-pulse'
        }`}>
          {getRiskLevel(normalizedScore)}
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
