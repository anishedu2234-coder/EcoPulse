import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/90 backdrop-blur-md border-t border-[rgba(0,0,0,0.03)] mt-auto relative overflow-hidden py-10 select-none">
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2d3b28]/10 to-transparent"></div>
      
      <div className="w-full px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        
        {/* Branding & Micro-Detail */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 bg-[#FFF8F2] border border-[rgba(0,0,0,0.04)] px-4 py-1.5 rounded-full hover:-translate-y-0.5 transition-all duration-300 shadow-sm group cursor-default">
            <span className="material-symbols-outlined text-[#2d3b28] text-lg group-hover:scale-105 duration-300">eco</span>
            <span className="font-display font-black tracking-tight text-xs text-[#1a1a1a]">EcoPulse Platform</span>
          </div>
          <span className="text-[10px] text-[#a3a3a3] font-semibold uppercase tracking-widest pl-1 mt-1">Stewardship companion</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link className="text-xs font-bold text-[#525252] hover:text-[#1a1a1a] tracking-wider uppercase transition-colors" to="/privacy">Privacy Policy</Link>
          <Link className="text-xs font-bold text-[#525252] hover:text-[#1a1a1a] tracking-wider uppercase transition-colors" to="/terms">Terms of Service</Link>
          <Link className="text-xs font-bold text-[#525252] hover:text-[#1a1a1a] tracking-wider uppercase transition-colors" to="/support">Support Center</Link>
          <Link className="text-xs font-bold text-[#525252] hover:text-[#1a1a1a] tracking-wider uppercase transition-colors" to="/documentation">API Docs</Link>
        </nav>

        {/* copyright and environmental note */}
        <div className="text-right flex flex-col items-center md:items-end gap-1">
          <div className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">
            © 2026 EcoPulse Sustainability Systems
          </div>
          <span className="text-[9px] text-[#2d3b28] font-medium flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">forest</span>
            100% locally powered dashboard
          </span>
        </div>
      </div>
    </footer>
  );
};
