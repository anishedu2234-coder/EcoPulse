import React from 'react';

export const Support: React.FC = () => {
  return (
    <div className="flex-grow w-full max-w-grid_max_width mx-auto px-margin_mobile md:px-margin_desktop py-stack_xl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-stack_sm">Support</h1>
        <p className="text-xl text-text-secondary mb-stack_lg">We're here to help you on your sustainability journey.</p>
        
        <div className="bg-surface rounded-2xl p-stack_lg shadow-soft border border-border/50 mb-stack_xl transition-all duration-300 hover:shadow-hover">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-stack_sm">Frequently Asked Questions</h2>
          <div className="space-y-stack_md">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">How is my Eco Score calculated?</h3>
              <p className="text-text-secondary">Your Eco Score is calculated based on the daily activities you log. We use standard emission factors for transportation, energy, food, and other categories to estimate your carbon footprint, and normalize it into an easy-to-understand score.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">How can I reset my password?</h3>
              <p className="text-text-secondary">Currently, password resets are handled via our support team. Please send us an email if you need assistance recovering your account.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Are my entries private?</h3>
              <p className="text-text-secondary">Yes. All your activity logs and reflections are private by default. We do not share your individual data with third parties.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#f0ece5]/40 rounded-2xl p-stack_lg shadow-soft border border-border/50 transition-all duration-300 hover:shadow-hover">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-stack_sm">Contact Us</h2>
          <p className="text-text-secondary mb-stack_md">Didn't find what you're looking for? Reach out to our team directly.</p>
          <a href="mailto:support@ecopulse.app" className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-sm">
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};
