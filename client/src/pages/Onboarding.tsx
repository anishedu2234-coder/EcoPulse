import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CONVERSATION_STEPS = [
  {
    id: 'location',
    title: "Where are you writing from?",
    titleLines: ["Where are you", "writing from?"],
    info: "Your location helps us understand your local environment and energy grid.",
    journeyLabel: "Region",
    options: [
      { id: 'us', label: 'North America', icon: 'public', badgeBg: 'bg-[#E8F4FF] text-[#4f85b8]' },
      { id: 'eu', label: 'Europe / UK', icon: 'public', badgeBg: 'bg-[#EFE9FF] text-[#7d65b8]' },
      { id: 'asia', label: 'Asia / Pacific', icon: 'public', badgeBg: 'bg-[#FFF4D6] text-[#b89535]' },
      { id: 'other', label: 'Rest of World', icon: 'public', badgeBg: 'bg-[#FFE5DD] text-[#c96c57]' },
    ]
  },
  {
    id: 'diet',
    title: "What does a typical meal look like for you?",
    titleLines: ["What does a typical", "meal look like?"],
    info: "Food is a powerful way we interact with our environment every day.",
    journeyLabel: "Diet",
    options: [
      { id: 'vegan', label: 'Plant-Based', icon: 'nutrition', badgeBg: 'bg-[#E8F4FF] text-[#2c7bb6]' },
      { id: 'vegetarian', label: 'Vegetarian', icon: 'eco', badgeBg: 'bg-[#DDE8D8] text-[#2d3b28]' },
      { id: 'pescatarian', label: 'Pescatarian', icon: 'set_meal', badgeBg: 'bg-[#FFF4D6] text-[#b89535]' },
      { id: 'meat', label: 'Omnivore', icon: 'restaurant', badgeBg: 'bg-[#FFE5DD] text-[#c96c57]' },
    ]
  },
  {
    id: 'transport',
    title: "How do you usually travel?",
    titleLines: ["How do you", "usually travel?"],
    info: "The journeys we take leave different marks on the world.",
    journeyLabel: "Transport",
    options: [
      { id: 'bike', label: 'Bicycle / Walk', icon: 'pedal_bike', badgeBg: 'bg-[#DDE8D8] text-[#2d3b28]' },
      { id: 'public', label: 'Public Transit', icon: 'directions_bus', badgeBg: 'bg-[#EFE9FF] text-[#7d65b8]' },
      { id: 'ev', label: 'Electric Vehicle', icon: 'electric_car', badgeBg: 'bg-[#E8F4FF] text-[#2c7bb6]' },
      { id: 'car', label: 'Personal Car', icon: 'directions_car', badgeBg: 'bg-[#FFE5DD] text-[#c96c57]' },
    ]
  },
  {
    id: 'energy',
    title: "How do you power your home?",
    titleLines: ["How do you", "power your home?"],
    info: "The energy we use is the invisible foundation of our daily lives.",
    journeyLabel: "Energy",
    options: [
      { id: 'renewable', label: '100% Renewable', icon: 'solar_power', badgeBg: 'bg-[#DDE8D8] text-[#2d3b28]' },
      { id: 'mixed', label: 'Mixed Grid', icon: 'electric_meter', badgeBg: 'bg-[#FFF4D6] text-[#b89535]' },
      { id: 'fossil', label: 'Standard Utilities', icon: 'factory', badgeBg: 'bg-[#FFE5DD] text-[#c96c57]' },
    ]
  },
  {
    id: 'shopping',
    title: "What are your purchasing habits?",
    titleLines: ["What are your", "purchasing habits?"],
    info: "Every item we bring into our lives has its own story and footprint.",
    journeyLabel: "Shopping",
    options: [
      { id: 'minimalist', label: 'Conscious Minimalist', icon: 'eco', badgeBg: 'bg-[#DDE8D8] text-[#2d3b28]' },
      { id: 'average', label: 'Average Consumer', icon: 'shopping_bag', badgeBg: 'bg-[#FFF4D6] text-[#b89535]' },
      { id: 'frequent', label: 'Frequent Buyer', icon: 'shopping_cart', badgeBg: 'bg-[#FFE5DD] text-[#c96c57]' },
    ]
  },
  {
    id: 'waste',
    title: "How do you handle household waste?",
    titleLines: ["How do you handle", "household waste?"],
    info: "Returning resources to the earth is a key part of the cycle.",
    journeyLabel: "Waste",
    options: [
      { id: 'zero', label: 'Active Composter', icon: 'recycling', badgeBg: 'bg-[#DDE8D8] text-[#2d3b28]' },
      { id: 'mixed', label: 'Standard Recycling', icon: 'delete_sweep', badgeBg: 'bg-[#FFF4D6] text-[#b89535]' },
      { id: 'landfill', label: 'Mostly Landfill', icon: 'delete', badgeBg: 'bg-[#FFE5DD] text-[#c96c57]' },
    ]
  }
];

export const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [userName] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      return userObj.name || '';
    }
    return '';
  });

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [CONVERSATION_STEPS[currentStep].id]: optionId }));
    
    // Auto advance after a short delay for a smoother conversational feel
    if (currentStep < CONVERSATION_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 350);
    }
  };

  const handleComplete = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.put('/auth/onboarding', { answers });
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.baselineFootprint = res.data.user.baselineFootprint;
        userObj.commuteMethod = res.data.user.commuteMethod;
        userObj.dietType = res.data.user.dietType;
        userObj.homeEnergySource = res.data.user.homeEnergySource;
        userObj.location = res.data.user.location;
        userObj.shoppingHabits = res.data.user.shoppingHabits;
        userObj.wasteHabits = res.data.user.wasteHabits;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save your journal preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getClimateSnapshot = () => {
    let score = 65;
    let footprint = 7.5;
    
    if (answers.location) {
      if (answers.location === 'us') { score -= 5; footprint += 1.8; }
      else if (answers.location === 'eu') { score += 5; footprint -= 0.8; }
      else if (answers.location === 'asia') { score += 8; footprint -= 1.5; }
      else if (answers.location === 'other') { score += 3; footprint -= 1.0; }
    }
    if (answers.diet) {
      if (answers.diet === 'vegan') { score += 10; footprint -= 1.5; }
      else if (answers.diet === 'vegetarian') { score += 7; footprint -= 1.0; }
      else if (answers.diet === 'pescatarian') { score += 4; footprint -= 0.5; }
      else if (answers.diet === 'meat') { score -= 3; footprint += 0.4; }
    }
    if (answers.transport) {
      if (answers.transport === 'bike') { score += 12; footprint -= 1.8; }
      else if (answers.transport === 'public') { score += 8; footprint -= 1.1; }
      else if (answers.transport === 'ev') { score += 6; footprint -= 0.8; }
      else if (answers.transport === 'car') { score -= 6; footprint += 1.0; }
    }
    if (answers.energy) {
      if (answers.energy === 'renewable') { score += 12; footprint -= 1.6; }
      else if (answers.energy === 'mixed') { score += 5; footprint -= 0.6; }
      else if (answers.energy === 'fossil') { score -= 4; footprint += 0.4; }
    }
    if (answers.shopping) {
      if (answers.shopping === 'minimalist') { score += 8; footprint -= 1.0; }
      else if (answers.shopping === 'average') { score += 2; footprint -= 0.2; }
      else if (answers.shopping === 'frequent') { score -= 4; footprint += 0.6; }
    }
    if (answers.waste) {
      if (answers.waste === 'zero') { score += 8; footprint -= 0.8; }
      else if (answers.waste === 'mixed') { score += 4; footprint -= 0.4; }
      else if (answers.waste === 'landfill') { score -= 4; footprint += 0.3; }
    }

    // Bound checks
    score = Math.max(15, Math.min(99, score));
    footprint = Math.max(1.2, Math.min(18.0, footprint));
    
    return { score, footprint: parseFloat(footprint.toFixed(1)) };
  };

  const step = CONVERSATION_STEPS[currentStep];
  const currentAnswer = answers[step.id];
  const firstName = userName ? userName.split(' ')[0] : 'there';
  const isLastStep = currentStep === CONVERSATION_STEPS.length - 1;

  // Render a visual preview of the journal on the right
  const renderJournalPreview = () => {
    const snapshot = getClimateSnapshot();

    return (
      <div className="w-full h-full bg-[#FFF8F2] p-6 lg:p-8 border-l border-[rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col hidden md:flex justify-between">
        <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        
        <div className="flex flex-col flex-grow min-h-0">
          <h3 className="font-display text-xl lg:text-2xl font-extrabold text-[#1a1a1a] mb-4 relative z-10 tracking-tight">Your Journey So Far</h3>
          
          {/* Scrollable list of responses */}
          <div className="space-y-2 relative z-10 flex-1 overflow-y-auto pr-2 mb-4 select-none min-h-0">
            {CONVERSATION_STEPS.map((s) => {
              const ansId = answers[s.id];
              const ansObj = s.options.find(o => o.id === ansId);
              
              if (!ansObj) return null;

              return (
                <div 
                  key={s.id} 
                  className="py-2.5 px-3.5 bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.01)] border border-[rgba(0,0,0,0.02)] flex items-center gap-3 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.02)]"
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${ansObj.badgeBg} bg-opacity-70 text-[#1a1a1a]`}>
                    <span className="material-symbols-outlined text-[16px]">{ansObj.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-extrabold tracking-wider uppercase text-[#a3a3a3] leading-none mb-0.5">{s.journeyLabel}</span>
                    <span className="font-display font-bold text-[#1a1a1a] text-[13px] md:text-[14px] truncate leading-tight">{ansObj.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Climate Snapshot card */}
        <div className="relative z-10 mt-auto bg-white rounded-[20px] p-4 shadow-[0_12px_40px_rgba(45,59,40,0.03)] border border-[rgba(0,0,0,0.03)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[16px] text-[#2d3b28]">analytics</span>
            <h4 className="font-display font-extrabold text-[14px] text-[#1a1a1a] tracking-tight">Your Climate Snapshot</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#FFF8F2]/60 rounded-[14px] p-3 border border-[#f2ebe5] transition-all duration-300">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#a3a3a3] block mb-0.5">Eco Score</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-display font-extrabold text-[#2d3b28] transition-all duration-300">{snapshot.score}</span>
                <span className="text-[9px] text-[#a3a3a3] font-bold">/100</span>
              </div>
              <div className="w-full bg-[#e8e4e0] h-[3px] rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-[#2d3b28] h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${snapshot.score}%` }}
                />
              </div>
            </div>

            <div className="bg-[#FFF8F2]/60 rounded-[14px] p-3 border border-[#f2ebe5] transition-all duration-300">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#a3a3a3] block mb-0.5">CO₂ Footprint</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-display font-extrabold text-[#2d3b28] transition-all duration-300">{snapshot.footprint}</span>
                <span className="text-[9px] text-[#a3a3a3] font-bold">t/yr</span>
              </div>
              <span className="text-[8px] font-semibold text-[#a3a3a3] block mt-2.5 leading-none">Est. annual CO₂</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex bg-[#FFF8F2] font-sans selection:bg-[#E8F4FF] selection:text-[#1a1a1a]">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-5 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="material-symbols-outlined text-[26px] text-[#2d3b28]">eco</span>
          <span className="font-display font-bold tracking-tight text-lg text-[#1a1a1a]">EcoPulse</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full flex items-center justify-center p-4 md:p-6 mt-12 md:mt-0 relative h-full lg:h-screen">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="absolute top-20 right-1/3 w-[600px] h-[600px] bg-[#EFE9FF] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse pointer-events-none" style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#FFE5DD] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

        <div className="w-full max-w-[1050px] h-[min(640px,85vh)] bg-white/80 backdrop-blur-2xl border border-[rgba(0,0,0,0.05)] shadow-[0_24px_64px_rgba(0,0,0,0.02)] rounded-[32px] flex overflow-hidden relative z-10 my-auto">
          
          {/* Left Panel - Conversation */}
          <div className="w-full md:w-[58%] p-6 lg:p-10 relative flex flex-col justify-between bg-white h-full overflow-y-auto">
            <div key={step.id} className="page-fade flex flex-col flex-grow justify-between h-full min-h-0">
              <div className="flex-grow min-h-0">
                {/* Progress line indicator */}
                <div className="relative w-full max-w-[500px] h-6 mb-6 flex justify-between items-center z-20 select-none">
                  <div className="absolute left-0 right-0 h-[2px] bg-[#f2ebe5] z-0 rounded-full"></div>
                  <div 
                    className="absolute left-0 h-[2px] bg-[#2d3b28] transition-all duration-500 ease-out z-0 rounded-full"
                    style={{ width: `${(currentStep / (CONVERSATION_STEPS.length - 1)) * 100}%` }}
                  ></div>
                  {CONVERSATION_STEPS.map((_, idx) => {
                    const isActive = idx === currentStep;
                    const isCompleted = idx < currentStep;
                    return (
                      <button
                        key={idx}
                        disabled={idx > Object.keys(answers).length}
                        onClick={() => setCurrentStep(idx)}
                        className="focus:outline-none relative flex items-center justify-center transition-all duration-300 pointer-events-auto"
                        style={{ width: '20px', height: '20px' }}
                        title={`Go to step ${idx + 1}`}
                      >
                        <div 
                          className={`rounded-full transition-all duration-300 ease-out ${
                            isActive 
                              ? 'w-2.5 h-2.5 bg-[#2d3b28] ring-4 ring-[#DDE8D8]' 
                              : isCompleted 
                                ? 'w-1.5 h-1.5 bg-[#2d3b28]/60' 
                                : 'w-1.5 h-1.5 bg-[#e0dcd9]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div className="bg-[#FFE5DD]/50 text-[#cc431c] text-xs p-3.5 rounded-xl mb-4 flex items-start gap-2.5 max-w-[500px]">
                    <span className="material-symbols-outlined text-sm mt-0.5">error</span>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Headline and Description */}
                <div className="mb-4 max-w-[500px] select-none">
                  <h2 className="font-display text-[26px] md:text-[36px] xl:text-[42px] leading-[1.1] font-bold text-[#1a1a1a] mb-2 tracking-[-0.03em]">
                    {currentStep === 0 && (
                      <span className="block text-base font-sans font-medium text-[#525252] tracking-normal mb-0.5">
                        Hi {firstName}.
                      </span>
                    )}
                    {step.titleLines.map((line, idx) => (
                      <span key={idx} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>
                  <p className="text-[13px] md:text-[14px] text-[#4a4a4a] leading-[1.4] font-normal">
                    {step.info}
                  </p>
                </div>

                {/* Answer Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[500px]">
                  {step.options.map((opt, idx) => {
                    const isSelected = currentAnswer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        className={`text-left p-4.5 rounded-[18px] h-[105px] xl:h-[115px] w-full flex flex-col justify-between transition-all duration-250 ease-out border relative overflow-hidden group select-none page-fade cursor-pointer ${
                          isSelected 
                            ? 'bg-[#DDE8D8] border-[#b8c7b3] shadow-[0_4px_12px_rgba(45,59,40,0.04)] animate-pulse-once' 
                            : 'bg-[#FFF8F2]/30 border-[#f2ebe5] hover:scale-[1.01] hover:bg-[#FFF8F2] hover:border-[#e0dcd9] hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected ? 'bg-white text-[#2d3b28] shadow-sm' : opt.badgeBg
                          }`}>
                            <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                          </div>
                          <div className={`w-4.5 h-4.5 rounded-full bg-[#2d3b28] flex items-center justify-center text-white transition-all duration-250 ease-out transform ${
                            isSelected ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-45'
                          }`}>
                            <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <span className={`font-display font-semibold text-[13px] md:text-[14px] leading-tight transition-colors duration-250 block max-w-[160px] ${
                            isSelected ? 'text-[#2d3b28]' : 'text-[#1a1a1a]'
                          }`}>
                            {opt.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons (Fixed Footer Area) */}
              <div className="mt-5 pt-3 border-t border-[rgba(0,0,0,0.05)] flex items-center justify-between max-w-[500px] shrink-0">
                <button
                  onClick={handleBack}
                  className={`group flex items-center gap-1.5 text-[#525252] font-semibold text-xs hover:text-[#1a1a1a] transition-all duration-200 pointer-events-auto`}
                  style={{ opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
                >
                  <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
                  Previous
                </button>
                
                {isLastStep && currentAnswer && (
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="bg-[#1a1a1a] text-white px-6 py-3.5 rounded-[16px] font-display font-semibold text-sm flex items-center gap-2 hover:bg-black transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,0,0,0.08)] pointer-events-auto"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-xs">progress_activity</span>
                        Binding Journal...
                      </>
                    ) : (
                      <>
                        Start Journaling
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Journal Preview */}
          <div className="w-full md:w-[42%] h-full bg-[#FFF8F2] border-l border-[rgba(0,0,0,0.05)] relative overflow-hidden hidden md:flex flex-col">
            {renderJournalPreview()}
          </div>

        </div>
      </div>
    </div>
  );
};
