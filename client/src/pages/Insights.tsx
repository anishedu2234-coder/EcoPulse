import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { ReflectionForm } from '../components/insights/ReflectionForm';
import { ReflectionList } from '../components/insights/ReflectionList';
import { ReflectionStats } from '../components/insights/ReflectionStats';
import { ForecastChart } from '../components/insights/ForecastChart';

interface AnalyticsData {
  totalCo2e: number;
  categoryBreakdown: Record<string, number>;
}

interface UserReflection {
  id: string;
  type: string;
  title: string;
  content: string;
  tag: string;
  timestamp: string;
}

const DEFAULT_REFLECTIONS: UserReflection[] = [
  {
    id: '1',
    type: 'Weekly Reflection',
    title: 'Focusing on low-carbon commuting',
    content: 'This week, I replaced two car trips with walking and public transit. I noticed that transport emissions dropped significantly. Feels great to walk more!',
    tag: 'Proud',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'Sustainability Win',
    title: 'First full plant-based day',
    content: 'Soured ingredients for a fully vegan day. Meal logging made me realize how low-impact vegetables are compared to dairy cuts.',
    tag: 'Inspired',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const Insights: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reflections state
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [refType, setRefType] = useState('Weekly Reflection');
  const [refTitle, setRefTitle] = useState('');
  const [refContent, setRefContent] = useState('');
  const [refTag, setRefTag] = useState('Reflective');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsRes = await api.get('/analytics');
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load insights data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const stored = localStorage.getItem('user_reflections');
    if (stored) {
      setReflections(JSON.parse(stored));
    } else {
      setReflections(DEFAULT_REFLECTIONS);
      localStorage.setItem('user_reflections', JSON.stringify(DEFAULT_REFLECTIONS));
    }
  }, []);

  const breakdown = useMemo(() => analytics?.categoryBreakdown || {}, [analytics]);
  const total = useMemo(() => Object.values(breakdown).reduce((sum, val) => sum + val, 0), [breakdown]);

  const dominant = useMemo(() => {
    const sorted = Object.entries(breakdown)
      .map(([category, val]) => ({ category, val, percentage: total > 0 ? Math.round((val / total) * 100) : 0 }))
      .sort((a, b) => b.val - a.val);
    return sorted.length > 0 ? sorted[0] : { category: 'None', val: 0, percentage: 0 };
  }, [breakdown, total]);

  const forecastData = useMemo(() => {
    const userMonthlyEmissions = Math.max(80, Math.round(total));
    return [
      { month: 'Apr', co2: Math.round(userMonthlyEmissions * 1.2), projected: null },
      { month: 'May', co2: Math.round(userMonthlyEmissions * 1.1), projected: null },
      { month: 'Jun (Now)', co2: userMonthlyEmissions, projected: userMonthlyEmissions },
      { month: 'Jul (Est)', co2: null, projected: Math.round(userMonthlyEmissions * 0.85) },
      { month: 'Aug (Est)', co2: null, projected: Math.round(userMonthlyEmissions * 0.72) }
    ];
  }, [total]);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refTitle || !refContent) return;

    const newRef: UserReflection = {
      id: Date.now().toString(),
      type: refType,
      title: refTitle,
      content: refContent,
      tag: refTag,
      timestamp: new Date().toISOString()
    };

    const updated = [newRef, ...reflections];
    setReflections(updated);
    localStorage.setItem('user_reflections', JSON.stringify(updated));

    setRefTitle('');
    setRefContent('');
  };

  const handleDeleteReflection = (id: string) => {
    const updated = reflections.filter(r => r.id !== id);
    setReflections(updated);
    localStorage.setItem('user_reflections', JSON.stringify(updated));
  };

  const totalWritten = reflections.length;
  const uniqueThemes = useMemo(() => new Set(reflections.map(r => r.type)).size, [reflections]);
  const mostUsedTag = useMemo(() => {
    if (reflections.length === 0) return 'None';
    const counts: Record<string, number> = {};
    reflections.forEach(r => counts[r.tag] = (counts[r.tag] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [reflections]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 text-[#1a1a1a] page-fade">
        <span className="material-symbols-outlined text-4xl animate-pulse text-[#2d3b28] mb-4">edit_note</span>
        <p className="font-sans font-medium text-sm uppercase tracking-wider text-[#a3a3a3]">Opening reflections...</p>
      </div>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1100px] mx-auto px-6 py-12 md:py-20 font-sans text-[#1a1a1a] relative page-fade">
      
      {/* Header */}
      <div className="mb-12 text-center max-w-lg mx-auto select-none">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-4">Journal & Findings</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Reflections
        </h1>
        <p className="text-lg text-[#525252] font-medium leading-relaxed">
          Record your sustainability thoughts, set intentions, and examine dynamic progress forecasts.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns (Span 2) - Reflections Journal */}
        <div className="lg:col-span-2 space-y-8">
          <ReflectionForm
            refType={refType}
            setRefType={setRefType}
            refTitle={refTitle}
            setRefTitle={setRefTitle}
            refContent={refContent}
            setRefContent={setRefContent}
            refTag={refTag}
            setRefTag={setRefTag}
            onSubmit={handleSaveReflection}
          />

          <ReflectionStats
            totalWritten={totalWritten}
            uniqueThemes={uniqueThemes}
            mostUsedTag={mostUsedTag}
          />

          <ReflectionList
            reflections={reflections}
            onDelete={handleDeleteReflection}
          />
        </div>

        {/* Right Column (Span 1) - Insights Findings & Projections */}
        <div className="space-y-6">
          
          {/* Biggest Impact Area Card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFE5DD] flex items-center justify-center shrink-0 text-[#c96c57]">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Biggest Impact Area</span>
              <h4 className="text-lg font-display font-bold text-[#1a1a1a]">{dominant.category}</h4>
              <p className="text-xs font-bold text-[#cc431c]">{dominant.percentage}% of total footprint</p>
              <p className="text-[11px] text-[#525252] leading-relaxed font-medium pt-1">
                Your cumulative carbon logs indicate this category needs active mitigation choices.
              </p>
            </div>
          </div>

          {/* Strongest Sustainability Habit Card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#DDE8D8] flex items-center justify-center shrink-0 text-[#2d3b28]">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Strongest Habit</span>
              <h4 className="text-lg font-display font-bold text-[#1a1a1a]">Low-Impact Recycling</h4>
              <p className="text-xs font-bold text-[#2d3b28] uppercase tracking-wider">High consistency patterns</p>
              <p className="text-[11px] text-[#525252] leading-relaxed font-medium pt-1">
                Composting and separation habits are your most consistent daily choices.
              </p>
            </div>
          </div>

          {/* Improvement Opportunity Card */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFF4D6] flex items-center justify-center shrink-0 text-[#b89535]">
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block">Improvement Opportunity</span>
              <h4 className="text-lg font-display font-bold text-[#1a1a1a]">Meatless Days</h4>
              <p className="text-xs font-bold text-[#b89535] uppercase tracking-wider">Save 42kg CO₂/mo</p>
              <p className="text-[11px] text-[#525252] leading-relaxed font-medium pt-1">
                Substituting dairy and meat cuts with plant-based alternatives yields instant budget offsets.
              </p>
            </div>
          </div>

          {/* Emissions Pattern Analysis */}
          <div className="bg-white rounded-[28px] p-6 border border-[rgba(0,0,0,0.04)] shadow-sm hover-scale-card">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#a3a3a3] block mb-3">Pattern Analysis</span>
            <p className="text-xs text-[#525252] leading-relaxed font-medium">
              We observed a consistent decrease in your weekly utility usage logs. Continuing this downward rhythm will successfully stabilize your daily target goals.
            </p>
          </div>

          {/* Progress Forecast Chart */}
          <ForecastChart forecastData={forecastData} />

        </div>

      </div>

      <div className="mt-20 flex justify-center select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20 mx-2"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
      </div>
    </main>
  );
};
