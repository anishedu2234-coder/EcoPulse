import React from 'react';

interface BudgetGaugeProps {
  isOverBudget: boolean;
  todayTotal: number;
  dailyBaseline: number;
  budgetPercent: number;
  budgetLeft: number;
}

export const BudgetGauge: React.FC<BudgetGaugeProps> = ({
  isOverBudget,
  todayTotal,
  dailyBaseline,
  budgetPercent,
  budgetLeft,
}) => {
  return (
    <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-white rounded-full border border-neutral-100 shadow-sm relative">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle cx="48" cy="48" r="42" stroke="#f6f5f3" strokeWidth="6" fill="transparent" />
        <circle
          cx="48"
          cy="48"
          r="42"
          stroke={isOverBudget ? '#FFE5DD' : '#2d3b28'}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={2 * Math.PI * 42}
          strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(1.0, todayTotal / dailyBaseline))}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#a3a3a3]">{budgetPercent}% used</span>
        <span className="text-lg font-display font-extrabold text-[#1a1a1a]">{budgetLeft}</span>
        <span className="text-[8px] text-[#a3a3a3] font-bold">kg CO₂ Left</span>
      </div>
    </div>
  );
};
