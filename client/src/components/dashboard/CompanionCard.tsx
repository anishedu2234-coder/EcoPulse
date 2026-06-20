import React from 'react';

interface Recommendation {
  title: string;
  message: string;
  icon: string;
  actionLabel: string;
  actionPath: string;
}

interface CompanionCardProps {
  recommendation: Recommendation;
  onActionClick: (path: string) => void;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({
  recommendation,
  onActionClick,
}) => {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm flex items-start gap-4 hover-scale-card transition-all duration-300">
      <div className="w-12 h-12 rounded-full bg-[#FFF8F2] flex items-center justify-center shrink-0 text-[#2d3b28]">
        <span className="material-symbols-outlined text-[24px]">{recommendation.icon}</span>
      </div>
      <div className="space-y-1.5 flex-1">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Companion Recommendation</span>
        <h4 className="text-lg font-display font-bold text-[#1a1a1a]">{recommendation.title}</h4>
        <p className="text-sm text-[#525252] leading-relaxed font-medium pr-4">{recommendation.message}</p>
        <button
          onClick={() => onActionClick(recommendation.actionPath)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2d3b28] hover:underline"
        >
          {recommendation.actionLabel}
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
};
