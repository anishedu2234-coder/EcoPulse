import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { calculateCO2e } from '../utils/carbon-calc';
import type { ActivityCategory } from '../utils/carbon-calc';

const SUBTYPE_OPTIONS: Record<ActivityCategory, Array<{ id: string; label: string; unit: string }>> = {
  Transport: [
    { id: 'car_gasoline', label: 'Car (Gasoline)', unit: 'km' },
    { id: 'car_diesel', label: 'Car (Diesel)', unit: 'km' },
    { id: 'car_ev', label: 'Car (Electric)', unit: 'km' },
    { id: 'bus', label: 'Bus Ride', unit: 'km' },
    { id: 'train', label: 'Train Ride', unit: 'km' },
    { id: 'flight_short', label: 'Short-haul Flight', unit: 'km' },
    { id: 'flight_long', label: 'Long-haul Flight', unit: 'km' },
  ],
  Food: [
    { id: 'meat_meal', label: 'Meat Meal', unit: 'meals' },
    { id: 'beef', label: 'Beef Cut', unit: 'kg' },
    { id: 'chicken', label: 'Chicken Cut', unit: 'kg' },
    { id: 'pork', label: 'Pork Cut', unit: 'kg' },
    { id: 'fish', label: 'Fish Cut', unit: 'kg' },
    { id: 'cheese', label: 'Cheese / Dairy', unit: 'kg' },
    { id: 'vegetarian_meal', label: 'Vegetarian Meal', unit: 'meals' },
    { id: 'vegan_meal', label: 'Vegan Meal', unit: 'meals' },
  ],
  Energy: [
    { id: 'electricity', label: 'Electricity Consumption', unit: 'kWh' },
    { id: 'natural_gas', label: 'Natural Gas Heating', unit: 'kWh' },
    { id: 'heating_oil', label: 'Heating Oil', unit: 'kWh' },
  ],
  Shopping: [
    { id: 'clothes', label: 'New Clothing Purchase', unit: 'items' },
    { id: 'electronics', label: 'New Electronics Item', unit: 'items' },
  ],
  Waste: [
    { id: 'landfill', label: 'Landfill Waste Disposal', unit: 'kg' },
    { id: 'recycling', label: 'Recycling Output', unit: 'kg' },
  ]
};

const CATEGORIES: Array<{ id: ActivityCategory; label: string; icon: string; color: string }> = [
  { id: 'Transport', label: 'Journey', icon: 'directions_car', color: 'bg-[#E8F4FF]' },
  { id: 'Food', label: 'Meal', icon: 'restaurant', color: 'bg-[#DDE8D8]' },
  { id: 'Energy', label: 'Energy', icon: 'bolt', color: 'bg-[#FFF4D6]' },
  { id: 'Shopping', label: 'Purchase', icon: 'shopping_bag', color: 'bg-[#EFE9FF]' },
  { id: 'Waste', label: 'Disposal', icon: 'delete', color: 'bg-[#FFE5DD]' },
];

interface QuickPreset {
  name: string;
  icon: string;
  category: ActivityCategory;
  subtype: string;
  amount: string;
  description: string;
  bg: string;
}

const PRESETS: QuickPreset[] = [
  { name: 'Walked Instead of Driving', icon: 'directions_walk', category: 'Transport', subtype: 'car_gasoline', amount: '0', description: 'Walked instead of driving today', bg: 'bg-[#E8F4FF]/60 hover:bg-[#E8F4FF]' },
  { name: 'Used Public Transport', icon: 'directions_bus', category: 'Transport', subtype: 'bus', amount: '12', description: 'Took the bus instead of driving a personal car', bg: 'bg-[#E8F4FF]/60 hover:bg-[#E8F4FF]' },
  { name: 'Plant-Based Meal', icon: 'spa', category: 'Food', subtype: 'vegan_meal', amount: '1', description: 'Savoring a delicious plant-based meal', bg: 'bg-[#DDE8D8]/60 hover:bg-[#DDE8D8]' },
  { name: 'Recycled Waste', icon: 'recycling', category: 'Waste', subtype: 'recycling', amount: '4', description: 'Recycled plastics, paper, and glass', bg: 'bg-[#FFE5DD]/60 hover:bg-[#FFE5DD]' },
  { name: 'Reduced Electricity', icon: 'wb_shade', category: 'Energy', subtype: 'electricity', amount: '2', description: 'Turned off unused appliances and lights to save energy', bg: 'bg-[#FFF4D6]/60 hover:bg-[#FFF4D6]' },
  { name: 'Bought Second-Hand', icon: 'shopping_basket', category: 'Shopping', subtype: 'clothes', amount: '1', description: 'Bought a second-hand item of clothing', bg: 'bg-[#EFE9FF]/60 hover:bg-[#EFE9FF]' },
  { name: 'Used Renewable Energy', icon: 'solar_power', category: 'Energy', subtype: 'electricity', amount: '0', description: 'Powering my home devices with renewable solar energy offsets', bg: 'bg-[#FFF4D6]/60 hover:bg-[#FFF4D6]' },
  { name: 'Composting Activity', icon: 'forest', category: 'Waste', subtype: 'recycling', amount: '3', description: 'Composted organic kitchen and garden waste', bg: 'bg-[#FFE5DD]/60 hover:bg-[#FFE5DD]' }
];

export const ActivityForm: React.FC = () => {
  const [category, setCategory] = useState<ActivityCategory>('Transport');
  const [subtype, setSubtype] = useState('car_gasoline');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const liveEstimation = calculateCO2e(category, subtype, Number(amount) || 0);

  useEffect(() => {
    // Avoid resetting subtype if it's already compatible with the selected category
    const isCompatible = SUBTYPE_OPTIONS[category].some(opt => opt.id === subtype);
    if (!isCompatible) {
      const defaultSubtype = SUBTYPE_OPTIONS[category][0];
      setSubtype(defaultSubtype.id);
    }
  }, [category]);

  const handleApplyPreset = (preset: QuickPreset) => {
    setCategory(preset.category);
    setSubtype(preset.subtype);
    setAmount(preset.amount);
    setDescription(preset.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount === '') {
      setError('Please complete your entry.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await api.post('/activities', {
        category,
        activityDesc: description,
        co2e: liveEstimation
      });
      setDescription('');
      setAmount('');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 1500);
    } catch (err: any) {
      let msg = 'Failed to record moment.';
      if (err.response?.data?.error) {
        msg = Array.isArray(err.response.data.error) 
          ? err.response.data.error.map((e: any) => e.message).join(', ') 
          : err.response.data.error;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentUnit = SUBTYPE_OPTIONS[category].find(opt => opt.id === subtype)?.unit || '';

  return (
    <main className="flex-grow w-full max-w-[800px] mx-auto px-6 py-12 md:py-20 relative font-sans selection:bg-[#E8F4FF] selection:text-[#1a1a1a] page-fade">
      {/* Page Header */}
      <div className="mb-12 text-center select-none">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-4">Record</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight mb-4">
          Add Today's Moment.
        </h1>
        <p className="text-lg text-[#525252] font-medium max-w-lg mx-auto">
          Capture a decision, a habit, or an event that shapes your environmental story.
        </p>
      </div>

      {error && (
        <div className="bg-[#FFE5DD]/50 text-[#cc431c] text-sm p-4 rounded-2xl mb-8 flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">error</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#DDE8D8]/50 text-[#2d3b28] text-sm p-4 rounded-2xl mb-8 flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
          <span className="font-medium">Moment successfully added to your journal.</span>
        </div>
      )}

      {/* Quick Action Presets Section */}
      <div className="mb-10 bg-white/40 border border-neutral-100 p-6 rounded-[28px] shadow-sm select-none">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#a3a3a3] mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-base">bolt</span>
          Quick Action Presets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((p, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className={`p-3 rounded-2xl border border-[rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover-scale-card text-on-surface ${p.bg}`}
            >
              <span className="material-symbols-outlined text-[22px] mb-1.5">{p.icon}</span>
              <span className="text-[11px] font-bold leading-snug">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 md:p-12 border border-[rgba(0,0,0,0.04)] shadow-[0_12px_48px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#FFF8F2] rounded-full filter blur-[80px] opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-10">
          
          {/* Category Selection */}
          <div>
            <label className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-4">What kind of moment?</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-[20px] transition-all duration-300 border ${
                    category === cat.id 
                      ? `border-transparent shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${cat.color} scale-[1.02] -translate-y-1` 
                      : 'border-[rgba(0,0,0,0.04)] bg-transparent hover:bg-[#FFF8F2] hover:-translate-y-1'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[28px] mb-2 ${
                    category === cat.id ? 'text-[#1a1a1a]' : 'text-[#a3a3a3]'
                  }`}>
                    {cat.icon}
                  </span>
                  <span className={`font-display text-xs font-bold ${
                    category === cat.id ? 'text-[#1a1a1a]' : 'text-[#a3a3a3]'
                  }`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] w-full bg-[rgba(0,0,0,0.04)]"></div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wider text-[#1a1a1a] uppercase ml-1" htmlFor="subtype">Specific Activity</label>
              <select
                id="subtype"
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full bg-[#FFF8F2]/50 border border-[rgba(0,0,0,0.08)] rounded-2xl py-4 px-5 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-white focus:ring-4 focus:ring-[#1a1a1a]/5 transition-all appearance-none font-medium"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231a1a1a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                {SUBTYPE_OPTIONS[category].map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold tracking-wider text-[#1a1a1a] uppercase ml-1" htmlFor="amount">Amount ({currentUnit})</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="any"
                required
                placeholder="e.g. 15"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#FFF8F2]/50 border border-[rgba(0,0,0,0.08)] rounded-2xl py-4 px-5 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-white focus:ring-4 focus:ring-[#1a1a1a]/5 transition-all font-mono text-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold tracking-wider text-[#1a1a1a] uppercase ml-1" htmlFor="desc">Journal Note</label>
            <input
              id="desc"
              type="text"
              required
              placeholder="e.g. Biked to the cafe downtown"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FFF8F2]/50 border border-[rgba(0,0,0,0.08)] rounded-2xl py-4 px-5 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:bg-white focus:ring-4 focus:ring-[#1a1a1a]/5 transition-all font-medium placeholder:text-[#a3a3a3]"
            />
          </div>

          {/* Submission and Estimation */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#1a1a1a] text-white font-display font-semibold text-base px-10 py-4 rounded-2xl hover:bg-black transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,0,0,0.08)] disabled:opacity-50 flex items-center justify-center gap-2 hover-lift-button"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Writing...
                </>
              ) : (
                <>
                  Write Entry
                  <span className="material-symbols-outlined text-[20px]">edit_document</span>
                </>
              )}
            </button>
            
            <div className="flex-1 flex justify-end items-center gap-3 select-none">
              <span className="text-[11px] font-bold tracking-widest text-[#a3a3a3] uppercase">Impact Est.</span>
              <div className="bg-[#f9f9f9] border border-[rgba(0,0,0,0.04)] px-4 py-2 rounded-xl flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold text-[#1a1a1a]">{liveEstimation}</span>
                <span className="text-[#a3a3a3] text-sm font-medium">kg</span>
              </div>
            </div>
          </div>
          
        </div>
      </form>
    </main>
  );
};
