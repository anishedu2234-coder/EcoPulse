import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Logo } from '../components/ui/Logo';

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-200', width: 'w-0' };
    let score = 0;
    
    // Rule 1: Length >= 8
    if (pass.length >= 8) score++;
    // Rule 2: Upper and Lowercase letters
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    // Rule 3: Numbers
    if (/[0-9]/.test(pass)) score++;
    // Rule 4: Special Characters
    if (/[^a-zA-Z0-9]/.test(pass)) score++;

    switch (score) {
      case 1: return { score, label: 'Weak', color: 'bg-red-400', width: 'w-[25%]' };
      case 2: return { score, label: 'Fair', color: 'bg-yellow-400', width: 'w-[50%]' };
      case 3: return { score, label: 'Good', color: 'bg-blue-400', width: 'w-[75%]' };
      case 4: return { score, label: 'Strong', color: 'bg-green-500', width: 'w-[100%]' };
      default: return { score, label: 'Very Weak', color: 'bg-red-500', width: 'w-[10%]' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email Domain Validation
    const domain = email.split('@')[1]?.toLowerCase();
    const trustedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com', 'proton.me', 'protonmail.com', 'zoho.com', 'aol.com'];
    const disposableDomains = ['mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com', 'sharklasers.com', 'dispostable.com'];

    if (disposableDomains.includes(domain)) {
      setError('Please use a trusted email provider (like Gmail or Outlook). Temporary emails are not allowed.');
      return;
    }

    if (!trustedDomains.includes(domain) && (domain.includes('temp') || domain.includes('disposable'))) {
      setError('Please use a trusted email provider (like Gmail or Outlook).');
      return;
    }

    // Password Complexity Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      setError('Password must contain both uppercase and lowercase letters.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError('Password must contain at least one special character (e.g. !, @, #, $, etc.).');
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/onboarding');
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      const errorMsg = typeof serverError === 'string'
        ? serverError
        : Array.isArray(serverError)
        ? serverError.map((e: any) => e.message || JSON.stringify(e)).join(', ')
        : typeof serverError === 'object' && serverError !== null
        ? JSON.stringify(serverError)
        : 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen lg:h-screen lg:overflow-hidden w-full flex bg-gradient-to-tr from-[#FFF8F2] via-[#fcfbf9] to-[#FFF8F2] font-sans selection:bg-[#EAF5EC] selection:text-[#1a1a1a] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Mobile Logo Header */}
      <header className="lg:hidden fixed top-0 left-0 w-full z-50 flex justify-center items-center py-6">
        <Logo />
      </header>

      {/* Left Column - Storytelling */}
      <div className="hidden lg:flex flex-col w-[55%] p-8 xl:p-12 relative overflow-hidden bg-transparent justify-between h-full">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.12] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        
        {/* Ambient decorative shapes */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#DDE8D8] rounded-full mix-blend-multiply filter blur-[100px] opacity-25 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-10 right-20 w-[450px] h-[450px] bg-[#E8F4FF] rounded-full mix-blend-multiply filter blur-[100px] opacity-35 pointer-events-none"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-between max-w-xl">
          <Logo className="self-start w-fit" />

          <div className="my-auto py-6">
            <h1 className="font-display text-[44px] xl:text-[56px] font-bold leading-[1.05] tracking-tight text-[#1a1a1a] mb-4 xl:mb-6">
              Begin Your<br />
              Sustainability Journey.
            </h1>
            <p className="text-lg xl:text-xl text-[#525252] font-medium leading-relaxed max-w-lg">
              Discover your environmental footprint, build better habits, and create positive impact through small daily actions.
            </p>

            {/* Signature Journey Path Visual */}
            <div className="relative w-full h-[180px] xl:h-[220px] mt-6 xl:mt-12 mb-4 xl:mb-8 select-none">
              <svg className="absolute left-[36px] top-6 bottom-0 w-24 h-[calc(100%-20px)] opacity-30 text-[#2d3b28] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path 
                  d="M10,0 C10,35 85,35 85,60 C85,85 15,85 15,100" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeDasharray="4 4"
                  className="animate-[dash_40s_linear_infinite]"
                />
              </svg>
              
              {/* Floating Milestone Cards */}
              <div className="absolute top-2 left-16 bg-[#DDE8D8]/50 backdrop-blur-md border border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.02)] py-2 px-3.5 rounded-[16px] text-xs font-bold text-[#2d3b28] flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-300 animate-float select-none">
                <span className="material-symbols-outlined text-[15px]">eco</span>
                🌱 First Activity
              </div>
              
              <div className="absolute top-[65px] xl:top-[80px] right-4 bg-[#E8F4FF]/50 backdrop-blur-md border border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.02)] py-2 px-3.5 rounded-[16px] text-xs font-bold text-[#1c4876] flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-300 animate-float-delayed select-none">
                <span className="material-symbols-outlined text-[15px]">analytics</span>
                📈 First Insight
              </div>
              
              <div className="absolute bottom-2 left-24 bg-[#FFF4D6]/50 backdrop-blur-md border border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.02)] py-2 px-3.5 rounded-[16px] text-xs font-bold text-[#634e1c] flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-300 animate-float-slow select-none">
                <span className="material-symbols-outlined text-[15px]">forest</span>
                🌳 First Impact Goal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#a3a3a3] text-xs font-semibold tracking-wider uppercase">
            <p>EcoPulse Intelligence</p>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DDE8D8]"></span>
            <p>2026</p>
          </div>
        </div>
      </div>

      {/* Right Column - Register Form Container */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-10 xl:p-12 relative bg-transparent border-l border-[rgba(0,0,0,0.03)] lg:h-full lg:overflow-y-auto">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-[#FFE5DD] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse pointer-events-none" style={{ animationDuration: '14s', animationDelay: '1s' }}></div>

        {/* Floating Authentication Card */}
        <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(45,59,40,0.04),0_8px_30px_rgba(0,0,0,0.02)] rounded-[28px] p-6 md:p-8 lg:p-10 relative z-10 transform transition-all duration-700 my-auto">
          
          {/* Centered Card Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-10 h-10 rounded-full bg-[#DDE8D8] text-[#2d3b28] flex items-center justify-center mb-3 shadow-[0_4px_16px_rgba(221,232,216,0.6)] select-none">
              <span className="material-symbols-outlined text-[18px] font-bold">trending_up</span>
            </div>
            <h2 className="font-display text-[26px] md:text-[30px] font-extrabold text-[#1a1a1a] mb-1.5 tracking-tight">Create Account</h2>
            <p className="text-[#525252] font-medium text-[14px] leading-relaxed">Join EcoPulse and start tracking your impact.</p>
          </div>

          {error && (
            <div className="bg-[#FFE8D6]/40 border border-[#FFE8D6] text-[#cc431c] text-xs p-3.5 rounded-xl mb-5 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-sm mt-0.5">error</span>
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-wider text-[#1a1a1a] uppercase ml-1 block" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  className="w-full bg-[#fcfbf9]/60 border border-[#f0ece9] rounded-[16px] py-2.5 px-4 transition-all duration-300 focus:outline-none focus:border-[#2d3b28]/40 focus:bg-white focus:ring-4 focus:ring-[#DDE8D8]/30 text-[#1a1a1a] placeholder:text-[#a3a3a3] shadow-inner text-sm"
                  placeholder="Jane"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-wider text-[#1a1a1a] uppercase ml-1 block" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  className="w-full bg-[#fcfbf9]/60 border border-[#f0ece9] rounded-[16px] py-2.5 px-4 transition-all duration-300 focus:outline-none focus:border-[#2d3b28]/40 focus:bg-white focus:ring-4 focus:ring-[#DDE8D8]/30 text-[#1a1a1a] placeholder:text-[#a3a3a3] shadow-inner text-sm"
                  placeholder="Doe"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold tracking-wider text-[#1a1a1a] uppercase ml-1 block" htmlFor="email">Email Address</label>
              <input
                id="email"
                className="w-full bg-[#fcfbf9]/60 border border-[#f0ece9] rounded-[16px] py-2.5 px-4 transition-all duration-300 focus:outline-none focus:border-[#2d3b28]/40 focus:bg-white focus:ring-4 focus:ring-[#DDE8D8]/30 text-[#1a1a1a] placeholder:text-[#a3a3a3] shadow-inner text-sm"
                placeholder="jane@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold tracking-wider text-[#1a1a1a] uppercase ml-1 block" htmlFor="password">Password</label>
              <input
                id="password"
                className="w-full bg-[#fcfbf9]/60 border border-[#f0ece9] rounded-[16px] py-2.5 px-4 transition-all duration-300 focus:outline-none focus:border-[#2d3b28]/40 focus:bg-white focus:ring-4 focus:ring-[#DDE8D8]/30 text-[#1a1a1a] placeholder:text-[#a3a3a3] shadow-inner text-sm"
                placeholder="••••••••"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password && (
                <div className="mt-1.5 space-y-1 ml-1 select-none">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#525252]">
                    <span>Password Strength:</span>
                    <span className={
                      strength.score === 4 ? 'text-green-600' :
                      strength.score === 3 ? 'text-blue-500' :
                      strength.score === 2 ? 'text-yellow-600' : 'text-red-500'
                    }>{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-[8px] text-[#a3a3a3] leading-relaxed">
                    Must be 8+ characters, with uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3F6A49] to-[#547D5E] hover:from-[#355c3e] hover:to-[#497053] text-white font-display font-semibold text-sm py-3.5 rounded-[16px] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(63,106,73,0.18)] hover:shadow-[0_12px_32px_rgba(63,106,73,0.25)] hover:-translate-y-0.5 hover:scale-[1.01] mt-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xs">progress_activity</span>
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </button>
            
            {/* Feature Highlight Pills */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-5">
              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-[#DDE8D8]/40 border border-[#b8c7b3]/20 text-[10px] font-bold text-[#2d3b28] select-none">
                <span className="material-symbols-outlined text-[12px]">insights</span>
                Carbon Insights
              </span>
              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-[#E8F4FF]/40 border border-[#b4ccf0]/20 text-[10px] font-bold text-[#1c4876] select-none">
                <span className="material-symbols-outlined text-[12px]">military_tech</span>
                Eco Challenges
              </span>
              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-[#FFF4D6]/40 border border-[#e8d5a7]/20 text-[10px] font-bold text-[#634e1c] select-none">
                <span className="material-symbols-outlined text-[12px]">leaderboard</span>
                Progress Tracking
              </span>
            </div>
          </form>

          {/* Bottom Navigation Capsule */}
          <div className="mt-6 pt-3 border-t border-[rgba(0,0,0,0.03)] flex justify-center">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-5 py-2 bg-[#FFF8F2]/60 border border-[#f2ebe5] rounded-full text-[11px] font-bold text-[#525252] hover:bg-[#FFF8F2] hover:text-[#1a1a1a] hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
            >
              Already have an account? Sign In <span className="ml-1 font-sans text-xs font-semibold">&rarr;</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
