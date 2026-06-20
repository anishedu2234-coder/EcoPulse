import React from 'react';

interface UserReflection {
  id: string;
  type: string;
  title: string;
  content: string;
  tag: string;
  timestamp: string;
}

interface ReflectionListProps {
  reflections: UserReflection[];
  onDelete: (id: string) => void;
}

export const ReflectionList: React.FC<ReflectionListProps> = ({
  reflections,
  onDelete,
}) => {
  return (
    <div className="space-y-6">
      <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#a3a3a3] select-none pl-1">Reflection Timeline</h4>
      {reflections.length === 0 ? (
        <p className="text-center text-sm text-[#a3a3a3] py-10">
          You have no reflections recorded. Choose a template above and share your thoughts.
        </p>
      ) : (
        <div className="space-y-4">
          {reflections.map((ref) => (
            <div key={ref.id} className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-sm relative group hover-scale-card transition-all duration-300">
              <div className="flex justify-between items-start gap-4 mb-3 select-none">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a3a3a3]">{ref.type}</span>
                  <h4 className="font-display font-bold text-base text-[#1a1a1a]">{ref.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white bg-[#2d3b28]">
                    {ref.tag}
                  </span>
                  <button 
                    onClick={() => onDelete(ref.id)}
                    className="w-7 h-7 rounded-full bg-neutral-50 text-neutral-300 hover:bg-neutral-100 hover:text-[#cc431c] flex items-center justify-center transition-colors"
                    title="Delete reflection"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#525252] leading-relaxed font-medium mb-3">{ref.content}</p>
              <span className="text-[9px] text-[#a3a3a3] font-mono block select-none">
                Logged {new Date(ref.timestamp).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(ref.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
