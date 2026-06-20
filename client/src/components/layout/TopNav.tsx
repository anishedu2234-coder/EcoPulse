import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const avatarUrl = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80';

  const navItems = [
    { path: '/', label: 'My Journey' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/insights', label: 'Reflections' },
    { path: '/challenges', label: 'Challenges' },
    { path: '/profile', label: 'My Story' },
  ];

  return (
    <header className="bg-[#FFF8F2]/90 backdrop-blur-2xl border-b border-[rgba(0,0,0,0.04)] sticky top-0 z-50 transition-all select-none">
      <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1200px] mx-auto h-20">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-display font-black text-[#1a1a1a] flex items-center gap-2 group tracking-tight">
            <span className="material-symbols-outlined text-[#2d3b28] text-[28px] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">eco</span>
            EcoPulse
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center h-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`font-sans text-xs flex items-center h-full px-5 transition-all duration-300 relative group tracking-wider uppercase ${
                  isActive
                    ? 'text-[#1a1a1a] font-extrabold'
                    : 'text-[#525252] hover:text-[#1a1a1a] font-bold'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#1a1a1a] rounded-t-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/log')}
            className="hidden md:flex items-center justify-center px-5 py-2.5 bg-[#1a1a1a] text-white rounded-full font-sans font-semibold text-xs tracking-wider uppercase hover:bg-black transition-all duration-300 gap-2 group shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover-lift-button active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            Add Moment
          </button>
          
          <div className="h-8 w-[1px] bg-[rgba(0,0,0,0.08)] hidden md:block mx-1"></div>

          <div 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full overflow-hidden border border-[rgba(0,0,0,0.08)] cursor-pointer hover:border-[#1a1a1a] transition-all duration-300 hover:scale-110 shadow-sm"
            title="My Story"
          >
            <img 
              alt="User avatar" 
              className="w-full h-full object-cover" 
              src={avatarUrl}
            />
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#1a1a1a] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[28px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF8F2] border-b border-[rgba(0,0,0,0.04)] px-6 py-6 space-y-4 page-fade absolute left-0 right-0 top-20 shadow-md">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block font-sans text-sm font-bold tracking-wide py-2 ${location.pathname === item.path ? 'text-[#1a1a1a]' : 'text-[#525252]'}`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/log');
            }}
            className="w-full mt-4 flex items-center justify-center px-5 py-3 bg-[#1a1a1a] text-white rounded-full font-sans font-semibold text-xs tracking-wider uppercase hover:bg-black transition-all gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            Add Moment
          </button>
        </div>
      )}
    </header>
  );
};
