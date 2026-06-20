import React from 'react';

export const Documentation: React.FC = () => {
  return (
    <div className="flex-grow w-full max-w-grid_max_width mx-auto px-margin_mobile md:px-margin_desktop py-stack_xl">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-stack_xl">
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-stack_lg space-y-4">
            <h3 className="font-display font-bold text-text-primary uppercase tracking-wider text-sm mb-4">Contents</h3>
            <nav className="flex flex-col space-y-3">
              <a href="#getting-started" className="text-text-secondary hover:text-primary transition-colors">Getting Started</a>
              <a href="#logging-activities" className="text-text-secondary hover:text-primary transition-colors">Logging Activities</a>
              <a href="#understanding-score" className="text-text-secondary hover:text-primary transition-colors">Understanding Your Score</a>
              <a href="#challenges" className="text-text-secondary hover:text-primary transition-colors">Joining Challenges</a>
            </nav>
          </div>
        </aside>
        
        <div className="flex-grow space-y-stack_xl pb-stack_xl">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-stack_sm">Documentation</h1>
            <p className="text-xl text-text-secondary">Learn how to make the most of EcoPulse to track and reduce your environmental impact.</p>
          </div>

          <section id="getting-started" className="scroll-mt-stack_lg">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-stack_sm">Getting Started</h2>
            <div className="prose prose-p:text-text-secondary prose-headings:text-text-primary">
              <p>Welcome to EcoPulse! The best way to begin is by completing your onboarding quiz, which helps us establish your baseline carbon footprint. From there, you can explore the Dashboard to see your daily status.</p>
            </div>
          </section>

          <section id="logging-activities" className="scroll-mt-stack_lg">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-stack_sm">Logging Activities</h2>
            <div className="prose prose-p:text-text-secondary prose-headings:text-text-primary">
              <p>Logging your daily activities allows EcoPulse to accurately track your carbon footprint over time. You can log activities related to Transportation, Food, Energy, and Shopping.</p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-text-secondary">
                <li>Click the "Log Activity" button in the navigation.</li>
                <li>Select the relevant category.</li>
                <li>Provide details such as distance traveled, meal type, or energy usage.</li>
                <li>Submit your log to instantly update your Eco Score.</li>
              </ul>
            </div>
          </section>

          <section id="understanding-score" className="scroll-mt-stack_lg">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-stack_sm">Understanding Your Score</h2>
            <div className="prose prose-p:text-text-secondary prose-headings:text-text-primary">
              <p>Your Eco Score is a dynamic metric that represents your overall sustainability performance. A higher score indicates a smaller carbon footprint and more sustainable habits.</p>
              <p className="mt-4">The score adjusts daily based on your activities compared to regional averages and your personal goals. You can view your progress on the Dashboard or in the Insights tab.</p>
            </div>
          </section>

          <section id="challenges" className="scroll-mt-stack_lg">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-stack_sm">Joining Challenges</h2>
            <div className="prose prose-p:text-text-secondary prose-headings:text-text-primary">
              <p>Challenges are designed to encourage positive behavioral changes. You can join global challenges (like "Meatless Monday" or "Bike to Work Week") to earn badges and improve your score faster.</p>
              <p className="mt-4">Navigate to the Challenges tab to discover active campaigns and track your progress against community goals.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
