import React from 'react';

interface ReflectionFormProps {
  refType: string;
  setRefType: (type: string) => void;
  refTitle: string;
  setRefTitle: (title: string) => void;
  refContent: string;
  setRefContent: (content: string) => void;
  refTag: string;
  setRefTag: (tag: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  refType,
  setRefType,
  refTitle,
  setRefTitle,
  refContent,
  setRefContent,
  refTag,
  setRefTag,
  onSubmit,
}) => {
  return (
    <div className="bg-[#FFF8F2] rounded-[32px] p-8 border border-[rgba(0,0,0,0.04)] shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
      
      <form onSubmit={onSubmit} className="relative z-10 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-display font-bold text-xl text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2d3b28]">edit_note</span>
            Write Reflection Letter
          </h3>
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#a3a3a3]">Template driven</span>
        </div>

        {/* Template selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
          {['Weekly Reflection', 'Sustainability Win', 'Progress Review', 'New Goal', 'Challenge Reflection'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRefType(t)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                refType === t
                  ? 'bg-[#1a1a1a] text-white border-transparent'
                  : 'bg-white border-neutral-100 text-[#525252] hover:bg-neutral-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Title Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#a3a3a3] block ml-1">Title / Focus</label>
          <input
            type="text"
            required
            placeholder="e.g. Setting kitchen compost bins"
            value={refTitle}
            onChange={(e) => setRefTitle(e.target.value)}
            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] font-medium"
          />
        </div>

        {/* Content Textarea */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#a3a3a3] block ml-1">My Thoughts</label>
          <textarea
            required
            rows={4}
            placeholder="Describe your environmental habits, wins, or feelings about your sustainability goals this week..."
            value={refContent}
            onChange={(e) => setRefContent(e.target.value)}
            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] font-medium"
          />
        </div>

        {/* Tags selection and submit button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="space-y-2 select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3] block ml-1">Tag emotional state:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Proud', 'Motivated', 'Inspired', 'Reflective', 'Challenged'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setRefTag(tag)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    refTag === tag
                      ? 'bg-[#2d3b28] text-white border-transparent'
                      : 'bg-white border-neutral-100 text-[#525252] hover:bg-[#FFF8F2]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-[#1a1a1a] hover:bg-black text-white font-semibold text-xs px-8 py-3.5 rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 hover-lift-button"
          >
            <span className="material-symbols-outlined text-[16px]">draw</span>
            Save Reflection
          </button>
        </div>
      </form>
    </div>
  );
};
