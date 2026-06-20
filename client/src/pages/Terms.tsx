import React, { useEffect, useState } from 'react';

export const Terms: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  return (
    <main className={`flex-grow w-full max-w-[800px] mx-auto px-6 py-12 md:py-20 font-sans text-[#1a1a1a] transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-12 text-center max-w-lg mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-3">Terms & Conditions</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-[#a3a3a3] font-mono tracking-wider">Last Updated: June 19, 2026</p>
      </div>

      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-[rgba(0,0,0,0.04)] shadow-[0_12px_48px_rgba(0,0,0,0.02)] relative overflow-hidden space-y-8 leading-relaxed text-[#525252] font-medium text-[15px] md:text-[16px]">
        <div className="absolute top-0 right-0 w-full h-full opacity-35 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        
        <p className="relative z-10 text-[#1a1a1a] font-semibold text-lg">
          Welcome to EcoPulse. By accessing or using EcoPulse, you agree to these Terms of Service.
        </p>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">handshake</span>
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account or using EcoPulse, you agree to comply with these terms.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">info</span>
            2. Purpose of EcoPulse
          </h2>
          <p>
            EcoPulse provides educational sustainability tracking, carbon footprint estimation, environmental analytics, and habit-building tools. The information provided by EcoPulse is intended for informational and educational purposes only.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">gavel</span>
            3. User Responsibilities
          </h2>
          <div className="space-y-2">
            <p>You agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate account information</li>
              <li>Maintain account security</li>
              <li>Use EcoPulse responsibly</li>
              <li>Respect applicable laws and regulations</li>
            </ul>
            <p className="pt-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Attempt unauthorized access</li>
              <li>Disrupt platform operations</li>
              <li>Misuse platform features</li>
              <li>Upload harmful or malicious content</li>
            </ul>
          </div>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">calculate</span>
            4. Carbon Calculations
          </h2>
          <p>
            Carbon footprint estimates, projections, and sustainability metrics are based on general environmental models and assumptions. Results are estimates and should not be considered official environmental audits.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">copyright</span>
            5. Intellectual Property
          </h2>
          <p>
            All EcoPulse branding, content, design elements, and software remain the property of EcoPulse unless otherwise stated. Users retain ownership of their submitted reflections and activity data.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">cancel</span>
            6. Account Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms. Users may request account deletion at any time.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">warning</span>
            7. Limitation of Liability
          </h2>
          <p>
            EcoPulse is provided "as is" without warranties of any kind. We are not responsible for decisions made based on sustainability estimates, recommendations, or analytics generated within the platform.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">edit_calendar</span>
            8. Changes to Terms
          </h2>
          <p>
            These terms may be updated periodically. Continued use of EcoPulse constitutes acceptance of any revisions.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">contact_support</span>
            9. Contact
          </h2>
          <p>
            Questions regarding these terms may be directed to:{' '}
            <a href="mailto:support@ecopulse.app" className="text-[#2d3b28] font-bold hover:underline">
              support@ecopulse.app
            </a>
          </p>
        </div>
      </div>
      
      <div className="mt-16 flex justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20 mx-2"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] opacity-20"></div>
      </div>
    </main>
  );
};
