# 🌱 EcoPulse

A premium, minimalist sustainability tracker designed to help you understand your impact and build better habits through mindful daily action.

---

## 🌍 Chosen Vertical

### **Sustainability & Environmental Wellness**
In a world increasingly aware of climate change, tracking one's carbon footprint can often feel overwhelming, abstract, or overly corporate. EcoPulse sits at the intersection of environmental technology and personal wellness. Our goal is to transform carbon tracking from a stressful dashboard of raw numbers into a personal, optimistic, and encouraging journey. We treat sustainability as a mindful daily habit, similar to a wellness or journaling application.

---

## 🎨 Approach and Logic

Our core approach is centered around **Behavioral Nudging through Premium Design**.

1. **Minimalist Editorial Aesthetic:** We avoided generic SaaS styles, dark themes, and heavy 3D graphics. Instead, EcoPulse uses a soft pastel color palette (sage greens, warm creams, sky blues), elegant typography, and generous whitespace. This creates a calming environment that reduces "climate anxiety" and encourages regular check-ins.
2. **Contextual Storytelling:** Rather than just presenting numbers, we translate data into relatable stories. We frame the user's progress through "My Story," milestones, and monthly "Chapters" of progress.
3. **Positive Reinforcement:** The application relies on gamification—such as an out-of-100 "Eco Score", unlockable achievements, and community challenges—to reward sustainable choices rather than punishing negative ones.
4. **Relatable Equivalencies:** Raw carbon metrics (e.g., "Saved 50kg CO₂") are abstracted into real-world environmental equivalencies, such as "Trees Absorbed," "Miles of Driving Avoided," and "Flights Saved."

---

## ⚙️ How the Solution Works

### 1. Onboarding & Baseline Calculation
New users go through a conversational onboarding flow that asks about their region, diet, transportation methods, energy grid, and shopping habits. This initializes their baseline carbon footprint and starting Eco Score.

### 2. Daily Logging & Insights
Users log "moments" or daily activities across five primary categories: Transport, Food, Energy, Shopping, and Waste. The system recalculates their emissions on the fly. The **Dashboard** serves as a "Today at a Glance" screen, summarizing their daily carbon budget, current score, and recent activity timeline. We also offer pre-set moment shortcuts (e.g. "Composting", "Plant-based meal") for frictionless logging.

### 3. Analytics & Visualization
We utilize dynamic Recharts visualizations to show long-term progress. The **Reflections/Insights** tab breaks down the user's footprint distribution by category using pie charts and tracks week-over-week trends using area charts.

### 4. Challenges & Achievements
To drive engagement, users can join sustainability challenges (e.g., "Zero Waste Week", "Plant-based Weekend"). Completing challenges permanently boosts their Eco Score and unlocks visual badges in their profile.

### 5. Technical Stack & Security
- **Frontend:** React, TypeScript, React Router, Tailwind CSS, Recharts.
- **Backend:** Node.js, Express, TypeScript, SQLite (with Sequelize).
- **Security Enhancements:**
  - **HTTPS & Secure Cookies:** Configured session cookies/tokens with `secure: true`, `httpOnly`, and `sameSite: 'strict'` to prevent session hijacking.
  - **API Rate Limiting:** Implemented a robust rate limiter on `/api/auth/login` and `/api/auth/register` to block brute-force attacks.
  - **Content Security Policy (CSP):** Leveraged Helmet middleware to enforce strict script/style loading restrictions from trusted sources.

---

## 📝 Assumptions Made

During the development of EcoPulse, several foundational assumptions were made regarding the logic and user experience:

1. **Behavior over Precision:** We assumed that for everyday consumers, directional behavioral change is more important than exact scientific precision. The Eco Score and carbon footprint calculations use generalized emission factors rather than highly localized, exact API lookups.
2. **Standardized Baselines:** We assume a standard monthly baseline of 1,200kg of CO₂ (adjusted slightly by the onboarding quiz). The calculations use this as a static comparison point to calculate "Carbon Saved."
3. **Optimistic Scoring:** We assumed that starting users with a relatively high Eco Score (e.g., 65/100) and letting them build it up is more motivating than starting them at 0 and making the journey feel impossibly steep.
4. **Privacy First:** We assume users want their environmental habits kept private by default. While there are "global challenges," individual activity logs are treated securely and are not shared publicly.
5. **Modern Browser Capabilities:** The application assumes the user is on a modern browser capable of rendering CSS backdrop filters, smooth transitions, and dynamic SVG animations for the premium aesthetic.

---

<div align="center">
  <p><em>Built with intention. Designed for the planet.</em></p>
</div>
