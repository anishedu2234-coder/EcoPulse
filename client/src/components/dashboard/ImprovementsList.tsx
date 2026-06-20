import React from 'react';

interface ImprovementItem {
  text: string;
  icon: string;
  color: string;
}

interface ImprovementsListProps {
  improvements: ImprovementItem[];
}

export const ImprovementsList: React.FC<ImprovementsListProps> = ({
  improvements,
}) => {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm hover-scale-card">
      <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block mb-3">Recent Improvements</span>
      <div className="space-y-3.5">
        {improvements.map((imp, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <span className={`material-symbols-outlined text-[20px] ${imp.color} mt-0.5`}>{imp.icon}</span>
            <p className="text-xs font-semibold text-[#525252] leading-relaxed">{imp.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
