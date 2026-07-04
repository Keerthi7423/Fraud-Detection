import React from 'react';

const RiskBadge = ({ level, status }) => {
  const getStyles = () => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-[#052E16] text-[#22C55E] border-[#22C55E]/20';
      case 'medium':
        return 'bg-[#451A03] text-[#F59E0B] border-[#F59E0B]/20';
      case 'high':
        return 'bg-[#450A0A] text-[#EF4444] border-[#EF4444]/20';
      case 'critical':
        return 'bg-[#3F0000] text-[#DC2626] border-[#DC2626]/20 animate-pulse';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const displayStatus = (s) => {
    if (!s) return level;
    if (s.toLowerCase() === 'clean') return 'Approved';
    return s;
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1.5 w-fit ${getStyles()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level === 'critical' ? 'bg-red-500 animate-ping' : 'bg-current'}`} />
      {displayStatus(status)}
    </span>
  );
};

export default RiskBadge;

