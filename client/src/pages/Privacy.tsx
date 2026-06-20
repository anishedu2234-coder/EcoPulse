import React, { useEffect, useState } from 'react';

export const Privacy: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  return (
    <main className={`flex-grow w-full max-w-[800px] mx-auto px-6 py-12 md:py-20 font-sans text-[#1a1a1a] transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-12 text-center max-w-lg mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#a3a3a3] uppercase block mb-3">Legal Guidelines</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-[#a3a3a3] font-mono tracking-wider">Last Updated: June 19, 2026</p>
      </div>

      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-[rgba(0,0,0,0.04)] shadow-[0_12px_48px_rgba(0,0,0,0.02)] relative overflow-hidden space-y-8 leading-relaxed text-[#525252] font-medium text-[15px] md:text-[16px]">
        <div className="absolute top-0 right-0 w-full h-full opacity-35 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        
        <p className="relative z-10 text-[#1a1a1a] font-semibold text-lg">
          Welcome to EcoPulse. EcoPulse is committed to protecting your privacy and ensuring transparency about how your information is collected and used. This Privacy Policy explains how we collect, store, and process information when you use our platform.
        </p>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">folder_open</span>
            1. Information We Collect
          </h2>
          
          <div className="space-y-3 pl-2">
            <h3 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider">Account Information</h3>
            <p>When creating an account, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Name</li>
              <li>Email address</li>
              <li>Password (securely encrypted)</li>
            </ul>

            <h3 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider pt-2">Sustainability Profile Information</h3>
            <p>To provide personalized environmental insights, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Location</li>
              <li>Dietary preferences</li>
              <li>Transportation habits</li>
              <li>Energy usage preferences</li>
              <li>Shopping habits</li>
              <li>Waste management habits</li>
            </ul>

            <h3 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider pt-2">Activity Data</h3>
            <p>When using EcoPulse, we collect information you voluntarily submit, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Carbon activity logs</li>
              <li>Sustainability challenges</li>
              <li>Reflections and journal entries</li>
              <li>Progress data</li>
              <li>Eco score calculations</li>
            </ul>
          </div>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">task_alt</span>
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide personalized sustainability insights</li>
            <li>Calculate carbon footprint estimates</li>
            <li>Track environmental impact</li>
            <li>Generate analytics and progress reports</li>
            <li>Improve user experience</li>
            <li>Maintain platform security</li>
          </ul>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">lock</span>
            3. Data Security
          </h2>
          <p>
            We implement reasonable security measures to protect your information. Passwords are stored using industry-standard encryption and authentication methods.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">share</span>
            4. Data Sharing
          </h2>
          <p>
            EcoPulse does not sell, rent, or trade personal information to third parties. We may share anonymous and aggregated environmental statistics that cannot identify individual users.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">manage_accounts</span>
            5. Your Rights
          </h2>
          <p>You may:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Update your profile information</li>
            <li>Delete activity logs</li>
            <li>Request account deletion</li>
            <li>Export your data where applicable</li>
          </ul>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">child_care</span>
            6. Children's Privacy
          </h2>
          <p>
            EcoPulse is not intended for children under the age required by local laws without parental supervision.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">edit_note</span>
            7. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of EcoPulse after updates indicates acceptance of the revised policy.
          </p>
        </div>

        <hr className="border-neutral-100 relative z-10" />

        <div className="space-y-4 relative z-10">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2d3b28]">contact_support</span>
            8. Contact
          </h2>
          <p>
            For privacy-related inquiries, contact:{' '}
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
