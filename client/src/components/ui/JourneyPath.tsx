import React from 'react';

interface JourneyPathProps {
  milestones: string[];
  className?: string;
}

export const JourneyPath: React.FC<JourneyPathProps> = ({ milestones, className = '' }) => {
  return (
    <div className={`relative w-full ${className}`}>
      {/* SVG Path */}
      <svg className="absolute left-[11px] top-6 bottom-0 w-8 h-[calc(100%-24px)] opacity-40 text-[#DDE8D8] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 20 100">
        <path 
          d="M10,0 C10,20 -5,40 10,60 C25,80 10,95 10,100" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeDasharray="4 4"
          className="animate-[dash_30s_linear_infinite]"
        />
      </svg>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>

      {/* Milestones */}
      <div className="flex flex-col gap-8 relative z-10">
        {milestones.map((milestone, idx) => (
          <div key={idx} className="flex items-center gap-4 group">
            <div className="w-6 h-6 rounded-full bg-[#DDE8D8]/30 border border-[#DDE8D8] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110">
              <div className="w-2 h-2 rounded-full bg-[#2d3b28] opacity-60"></div>
            </div>
            <span className="text-sm font-medium text-[#525252] tracking-wide opacity-80 transition-opacity duration-300 group-hover:opacity-100">{milestone}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
