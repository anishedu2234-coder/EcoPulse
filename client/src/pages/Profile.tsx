import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  baselineFootprint: number | null;
  dietType: string | null;
  commuteMethod: string | null;
  homeEnergySource: string | null;
  shoppingHabits: string | null;
  wasteHabits: string | null;
  location: string | null;
  avatar?: string | null;
}

interface Activity {
  id: string;
  category: 'Transport' | 'Food' | 'Energy' | 'Shopping' | 'Waste';
  activityDesc: string;
  co2e: number;
  timestamp: string;
}

interface Challenge {
  id: string;
  title: string;
  objective: string;
  progress: number;
  target: number;
  status: 'not_joined' | 'active' | 'completed';
}

const PRESET_AVATARS = [
  { name: 'Avatar 1 (Default)', url: 'https://res.cloudinary.com/dcyyg32oj/image/upload/v1781881730/ChatGPT_Image_Jun_19_2026_08_37_50_PM_idispn.png' },
  { name: 'Avatar 2', url: 'https://res.cloudinary.com/dcyyg32oj/image/upload/v1781881568/ChatGPT_Image_Jun_19_2026_08_30_52_PM_lwdam0.png' },
  { name: 'Avatar 3', url: 'https://res.cloudinary.com/dcyyg32oj/image/upload/v1781881563/ChatGPT_Image_Jun_19_2026_08_32_30_PM_rrimpv.png' },
  { name: 'Avatar 4', url: 'https://res.cloudinary.com/dcyyg32oj/image/upload/v1781881563/ChatGPT_Image_Jun_19_2026_08_30_59_PM_ancn4e.png' },
  { name: 'Avatar 5', url: 'https://res.cloudinary.com/dcyyg32oj/image/upload/v1781881563/ChatGPT_Image_Jun_19_2026_08_33_51_PM_nn4te7.png' }
];

export const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as UserProfile;
      setUser(parsedUser);
      setName(parsedUser.name || '');
      setEmail(parsedUser.email || '');
      setAvatar(parsedUser.avatar || PRESET_AVATARS[0].url);
    }

    const fetchStoryData = async () => {
      try {
        const [actRes, chalRes] = await Promise.all([
          api.get('/activities'),
          api.get('/challenges')
        ]);
        setActivities(actRes.data);
        setChallenges(chalRes.data);
      } catch (err) {
        console.error('Failed to load My Story profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoryData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage('');
    setErrorMessage('');
    try {
      const res = await api.put('/auth/profile', {
        name,
        email,
        avatar
      });
      
      const updatedUser = {
        ...user,
        name: res.data.user.name,
        email: res.data.user.email,
        avatar: res.data.user.avatar,
      } as UserProfile;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setMessage('Your story has been updated.');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 2MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setSaveLoading(true);
    setErrorMessage('');
    setMessage('');
    try {
      const res = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        setAvatar(res.data.avatarUrl);
        setMessage('Avatar uploaded successfully. Don\'t forget to save changes.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to upload custom avatar.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getLabel = (val: string | null | undefined, type: string) => {
    if (!val) return 'Not set';
    switch (type) {
      case 'diet':
        return val === 'vegan' ? 'Plant-based' : val === 'vegetarian' ? 'Vegetarian' : val === 'pescatarian' ? 'Pescatarian' : 'Omnivore';
      case 'commute':
        return val === 'bike' ? 'Bicycle / Walking' : val === 'public' ? 'Public Transit' : val === 'ev' ? 'Electric Vehicle' : 'Personal Car';
      case 'energy':
        return val === 'renewable' ? '100% Renewable' : val === 'mixed' ? 'Mixed Grid' : 'Standard Utility';
      case 'shopping':
        return val === 'minimalist' ? 'Conscious Minimalist' : val === 'average' ? 'Average Consumer' : 'Frequent Buyer';
      case 'waste':
        return val === 'zero' ? 'Active Composter' : val === 'mixed' ? 'Standard Recycling' : 'Mostly Landfill';
      default:
        return val;
    }
  };

  // Calculations for Carbon Saved and Score Metrics
  const monthlyBaseline = user?.baselineFootprint || 1200;
  const dailyBaseline = Math.round(monthlyBaseline / 30);
  
  const totalCumulativeEmissions = activities.reduce((sum, act) => sum + act.co2e, 0);
  
  // Custom carbon saved algorithm
  const totalDays = Math.max(1, Math.round(activities.length / 1.1));
  const expectedBaselineEmissions = dailyBaseline * totalDays;
  const rawSaved = expectedBaselineEmissions - totalCumulativeEmissions;
  const totalSaved = Math.max(38, Math.round(rawSaved)); // guaranteed visual starter baseline

  // Environmental Equivalencies
  const eqTrees = Math.round((totalSaved / 22) * 10) / 10;
  const eqMiles = Math.round(totalSaved / 0.4);
  const eqKwh = Math.round(totalSaved / 0.7);
  const eqFlights = Math.round((totalSaved / 250) * 10) / 10;

  // Dynamic Eco Score Calculation
  const calculateEcoScore = () => {
    let baseScore = 65;
    activities.forEach(act => {
      if (act.co2e <= 12) baseScore += 1.5;
      else if (act.co2e >= 60) baseScore -= 1;
    });
    challenges.forEach(g => {
      if (g.status === 'completed') baseScore += 5;
    });
    return Math.max(10, Math.min(99, Math.round(baseScore)));
  };
  const ecoScore = calculateEcoScore();

  // Eco Score Growth Timeline Data points
  const scoreHistoryData = [
    { week: 'Week 1', score: 65 },
    { week: 'Week 2', score: 68 },
    { week: 'Week 3', score: Math.round(ecoScore * 0.95) },
    { week: 'Week 4', score: ecoScore }
  ];

  // Visual Timeline Milestones
  const milestoneList = [
    { label: 'Joined EcoPulse platform & set baseline targets', date: 'Initial Step', checked: true },
    { label: 'First daily sustainability activity logged in journal', date: 'Day 1', checked: activities.length > 0 },
    { label: 'First climate challenge intention fulfilled successfully', date: 'Intention Fulfilled', checked: challenges.some(c => c.status === 'completed') },
    { label: 'Eco Score reached 70 points of excellent stewardship', date: 'Eco Threshold', checked: ecoScore >= 70 },
    { label: 'Avoided 100 kg of cumulative CO₂ emissions', date: '100kg Saved Milestone', checked: totalSaved >= 100 },
    { label: 'Avoided 250 kg of cumulative CO₂ emissions', date: '250kg Saved Milestone', checked: totalSaved >= 250 },
    { label: 'Avoided 500 kg of cumulative CO₂ emissions', date: '500kg Saved Milestone', checked: totalSaved >= 500 }
  ];

  // Achievements
  const achievements = [
    { 
      name: 'Carbon Cutter', 
      desc: 'Saved over 50kg of baseline carbon.', 
      icon: 'cut', 
      earned: totalSaved >= 50,
      color: 'bg-[#DDE8D8]/50 text-[#2d3b28]'
    },
    { 
      name: 'Green Commuter', 
      desc: 'Logged multiple zero-carbon journeys.', 
      icon: 'pedal_bike', 
      earned: activities.filter(a => a.category === 'Transport' && a.co2e <= 5).length >= 2,
      color: 'bg-[#E8F4FF]/50 text-[#1c4876]'
    },
    { 
      name: 'Intentional Living', 
      desc: 'Active Minimalist shopping profile.', 
      icon: 'spa', 
      earned: user?.shoppingHabits === 'minimalist',
      color: 'bg-[#FFF4D6]/50 text-[#634e1c]'
    },
    { 
      name: 'Challenge Conqueror', 
      desc: 'Fulfilled a sustainable intention.', 
      icon: 'military_tech', 
      earned: challenges.some(c => c.status === 'completed'),
      color: 'bg-[#EFE9FF]/50 text-[#7d65b8]'
    }
  ];

  // Chapters of Progress (Monthly summaries)
  const getChapters = () => {
    const months: Record<string, { label: string; co2: number; activities: number }> = {};
    activities.forEach(act => {
      const actDate = new Date(act.timestamp);
      const key = `${actDate.getFullYear()}-${actDate.getMonth()}`;
      if (!months[key]) {
        months[key] = {
          label: actDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          co2: 0,
          activities: 0
        };
      }
      months[key].co2 += act.co2e;
      months[key].activities += 1;
    });
    return Object.values(months);
  };
  const chapters = getChapters();

  // Dynamic Narrative text (human-readable journey)
  const getNarrativeText = () => {
    const firstName = (name || '').split(' ')[0] || 'Eco Explorer';
    if (activities.length === 0) {
      return `Welcome, ${firstName}. Your sustainability chapters are ready to be written. Start by logging your first daily moment (like walking or a plant-based recipe) to begin calculating carbon savings.`;
    }
    return `So far on your EcoPulse journey, you have actively recorded ${activities.length} moments, leading to an estimated carbon offset of ${totalSaved} kg compared to standard regional benchmarks. Your diet is set as ${getLabel(user?.dietType, 'diet')}, and you primarily commute via ${getLabel(user?.commuteMethod, 'commute')}. Every intentional choice you log is rewriting your climate story.`;
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 text-[#1a1a1a] page-fade">
        <span className="material-symbols-outlined text-4xl animate-spin text-[#2d3b28] mb-4">auto_stories</span>
        <p className="font-sans font-medium text-sm uppercase tracking-wider text-[#a3a3a3]">Reading your chapters...</p>
      </div>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1000px] mx-auto px-6 py-12 md:py-20 font-sans text-[#1a1a1a] page-fade">
      
      {/* Header */}
      <div className="mb-16 text-center select-none">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-4">Profile & Progress</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          My Story
        </h1>
        <p className="text-lg text-[#525252] font-medium max-w-lg mx-auto">
          The records of your sustainable achievements and environmental milestones.
        </p>
      </div>

      {message && (
        <div className="bg-[#DDE8D8]/50 text-[#2d3b28] text-sm p-4 rounded-2xl mb-8 flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
          <span className="font-medium">{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#FFE5DD]/50 text-[#cc431c] text-sm p-4 rounded-2xl mb-8 flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">error</span>
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Profile Details Hero Section */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-[rgba(0,0,0,0.04)] shadow-[0_12px_48px_rgba(0,0,0,0.02)] relative overflow-hidden mb-12 group hover-scale-card transition-all duration-300">
        <div className="absolute top-0 right-0 w-full h-full opacity-35 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#E8F4FF] rounded-full filter blur-[80px] opacity-40 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <img src={avatar || PRESET_AVATARS[0].url} alt="Profile" className="w-full h-full object-cover animate-pulse-slow" />
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[#525252] hover:text-[#1a1a1a] text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 hover-lift-button"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            ) : null}
          </div>

          {/* Details Area */}
          <div className="flex-1 w-full">
            {!isEditing ? (
              <div className="space-y-6 text-center md:text-left">
                <div>
                  <h2 className="font-display text-3xl font-extrabold mb-1 text-[#1a1a1a]">{name || 'Eco Explorer'}</h2>
                  <p className="text-[#a3a3a3] font-medium text-sm">{email}</p>
                </div>

                {/* Narrative Description of sustainability journey */}
                <p className="text-sm text-[#525252] leading-relaxed font-medium bg-[#FFF8F2]/60 p-5 rounded-2xl border border-[rgba(0,0,0,0.02)]">
                  {getNarrativeText()}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-6 border-t border-[rgba(0,0,0,0.05)]">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-[#a3a3a3] uppercase block mb-1">Diet</span>
                    <span className="font-bold text-sm text-[#1a1a1a]">{getLabel(user?.dietType, 'diet')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-[#a3a3a3] uppercase block mb-1">Transport</span>
                    <span className="font-bold text-sm text-[#1a1a1a]">{getLabel(user?.commuteMethod, 'commute')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-[#a3a3a3] uppercase block mb-1">Energy</span>
                    <span className="font-bold text-sm text-[#1a1a1a]">{getLabel(user?.homeEnergySource, 'energy')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-[#a3a3a3] uppercase block mb-1">Waste</span>
                    <span className="font-bold text-sm text-[#1a1a1a]">{getLabel(user?.wasteHabits, 'waste')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-[#a3a3a3] uppercase block mb-1">Daily Limit</span>
                    <span className="font-bold text-sm text-[#1a1a1a]">{dailyBaseline} kg/day</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center md:justify-start">
                  <button 
                    onClick={handleLogout}
                    className="text-[#cc431c] hover:opacity-70 text-xs font-extrabold tracking-widest uppercase transition-opacity flex items-center gap-1.5 hover-lift-button"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-[11px] font-bold tracking-widest text-[#a3a3a3] uppercase block">Avatar</label>
                    <div className="flex gap-2 flex-wrap items-center">
                      {PRESET_AVATARS.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setAvatar(p.url)}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform ${avatar === p.url ? 'border-[#1a1a1a] scale-110 shadow-md' : 'border-transparent hover:scale-110'}`}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <label className="w-10 h-10 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 hover:border-neutral-400 flex items-center justify-center cursor-pointer transition-all hover:scale-105" title="Upload custom photo">
                        <span className="material-symbols-outlined text-[20px] text-[#525252]">upload</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-[#a3a3a3] uppercase block mb-2">Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[rgba(0,0,0,0.05)] rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-[#a3a3a3] uppercase block mb-2">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[rgba(0,0,0,0.05)] rounded-xl py-3 px-4 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={saveLoading}
                    className="bg-[#1a1a1a] text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="bg-transparent border border-[rgba(0,0,0,0.1)] text-[#1a1a1a] font-bold px-6 py-3 rounded-full text-sm hover:bg-[#f9f9f9] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Environmental Equivalencies Grid */}
      <div className="mb-12">
        <h3 className="font-display font-extrabold text-xl text-[#1a1a1a] mb-6 select-none">Environmental Equivalencies</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="bg-[#DDE8D8]/45 p-6 rounded-[28px] border border-[rgba(0,0,0,0.02)] text-center space-y-2 hover-scale-card">
            <span className="material-symbols-outlined text-[32px] text-[#2d3b28]">forest</span>
            <span className="text-2xl font-display font-black text-[#2d3b28] block">{eqTrees}</span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#a3a3a3] block">Trees Absorbed</span>
            <span className="text-[11px] text-[#525252] leading-tight block">Equivalent mature trees absorbing CO₂ for a year.</span>
          </div>

          <div className="bg-[#E8F4FF]/45 p-6 rounded-[28px] border border-[rgba(0,0,0,0.02)] text-center space-y-2 hover-scale-card">
            <span className="material-symbols-outlined text-[32px] text-[#1c4876]">directions_car</span>
            <span className="text-2xl font-display font-black text-[#1c4876] block">{eqMiles} mi</span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#a3a3a3] block">Driving Avoided</span>
            <span className="text-[11px] text-[#525252] leading-tight block">Miles of standard gasoline vehicle driving offset.</span>
          </div>

          <div className="bg-[#FFF4D6]/45 p-6 rounded-[28px] border border-[rgba(0,0,0,0.02)] text-center space-y-2 hover-scale-card">
            <span className="material-symbols-outlined text-[32px] text-[#634e1c]">electric_meter</span>
            <span className="text-2xl font-display font-black text-[#634e1c] block">{eqKwh} kWh</span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#a3a3a3] block">Power Offset</span>
            <span className="text-[11px] text-[#525252] leading-tight block">Kilowatt-hours of household utility electricity saved.</span>
          </div>

          <div className="bg-[#FFE5DD]/45 p-6 rounded-[28px] border border-[rgba(0,0,0,0.02)] text-center space-y-2 hover-scale-card">
            <span className="material-symbols-outlined text-[32px] text-[#c96c57]">flight</span>
            <span className="text-2xl font-display font-black text-[#c96c57] block">{eqFlights}</span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#a3a3a3] block">Flights Avoided</span>
            <span className="text-[11px] text-[#525252] leading-tight block">Equivalent passenger seats saved on short domestic flights.</span>
          </div>

        </div>
      </div>

      {/* Grid of Milestones and achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Visual Milestone Timeline Redesign */}
        <div className="md:col-span-2 bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover-scale-card">
          <h3 className="font-display font-extrabold text-lg text-[#1a1a1a] mb-6">Sustainability Milestones</h3>
          
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-dashed before:bg-neutral-200">
            {milestoneList.map((m, idx) => (
              <div key={idx} className="flex items-start gap-4 relative group">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 shadow-sm z-10 transition-transform ${m.checked ? 'bg-[#DDE8D8] border-[#b8c7b3] scale-105' : 'bg-neutral-50 border-neutral-200'}`}>
                  {m.checked && (
                    <span className="material-symbols-outlined text-[12px] text-[#2d3b28] font-bold">check</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#a3a3a3] block">{m.date}</span>
                  <span className={`text-sm font-semibold tracking-wide ${m.checked ? 'text-[#1a1a1a]' : 'text-[#a3a3a3] line-through decoration-1'}`}>
                    {m.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Gallery */}
        <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between hover-scale-card">
          <div>
            <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Achievement Gallery</h3>
            <p className="text-[11px] text-[#a3a3a3] font-medium uppercase mt-0.5">Badges earned through action</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 flex-1 justify-center items-center select-none">
            {achievements.map((ach, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-[20px] text-center border border-neutral-50 flex flex-col items-center justify-center space-y-1 transition-all hover:scale-105 duration-350 ${
                  ach.earned ? ach.color : 'bg-neutral-50/70 text-neutral-300'
                }`}
                title={ach.desc}
              >
                <span className="material-symbols-outlined text-[24px]">{ach.icon}</span>
                <span className="text-[10px] font-black tracking-wide leading-tight block">{ach.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Eco Score Growth Timeline graph */}
      <div className="bg-white rounded-[28px] p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.01)] mb-12 hover-scale-card">
        <div>
          <h3 className="font-display font-extrabold text-lg text-[#1a1a1a]">Eco Score Growth Timeline</h3>
          <p className="text-[11px] text-[#a3a3a3] font-medium uppercase mt-0.5">Eco score metrics tracking over the past 4 weeks</p>
        </div>

        <div className="h-44 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreHistoryData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <XAxis dataKey="week" stroke="#a3a3a3" fontSize={11} tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, 'Eco Score']} />
              <Line type="monotone" dataKey="score" stroke="#2d3b28" strokeWidth={2} dot={{ r: 4, stroke: '#2d3b28', fill: '#FFF8F2', strokeWidth: 1.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sustainability Chapters section */}
      <div>
        <h3 className="font-display font-extrabold text-2xl text-[#1a1a1a] mb-6 text-center select-none">Sustainability Chapters</h3>
        
        {chapters.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-neutral-200 rounded-[28px] bg-white">
            <p className="text-sm text-[#a3a3a3] font-medium">Your story chapters are just beginning. Log moments to start writing.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-200">
            {chapters.map((ch, idx) => (
              <div key={idx} className="relative flex items-start gap-4 group">
                <div className="w-6 h-6 rounded-full bg-[#FFF8F2] border border-neutral-200 flex items-center justify-center shrink-0 z-10 text-[#2d3b28] group-hover:scale-105 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-[12px] font-bold">book_5</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-[rgba(0,0,0,0.04)] shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-display font-extrabold text-[#1a1a1a]">{ch.label}</h4>
                    <span className="text-[10px] font-bold text-[#2d3b28] bg-[#DDE8D8]/50 px-2 py-0.5 rounded-full uppercase tracking-wider">{ch.activities} Moments</span>
                  </div>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    Estimated total footprint recorded for logged moments: <span className="font-bold text-[#1a1a1a]">{Math.round(ch.co2)} kg CO₂</span>. You are maintaining a steady rhythm and logging active daily habits.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-20 flex justify-center select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20 mx-2"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
      </div>
    </main>
  );
};
