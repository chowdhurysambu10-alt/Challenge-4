# FIFA Copilot 2026 — Smart Stadium & Tournament Operations Assistant

FIFA Copilot 2026 is an AI-powered Smart Stadium Assistant web application designed for the FIFA World Cup 2026 tournament operations at the Hard Rock Stadium. Built as a single-page command center and fan portal, it demonstrates how real-time IoT telemetry and Generative AI can work together to optimize stadium operations, transit, safety, and spectator experience.

---

## 📋 The Problem Statement

Managing a world-class sporting event involving over 70,000 attendees inside a single arena presents massive operational challenges:
*   **Navigation & Wayfinding**: Finding seats, restrooms, concessions, and accessible routes in a dense, multi-level environment.
*   **Crowd & Queue Management**: Monitoring bottlenecks at entry gates to prevent crush hazards and optimize check-in flows.
*   **Accessibility & ADA Compliance**: Ensuring guests with mobility aids or sensory sensitivities receive instant, optimized assistance.
*   **Transit & Logistics**: Coordinating external parking fills and next-arrival transit loops to smooth post-match departures.
*   **Multilingual Support**: Providing immediate guidance to international fans speaking diverse languages.
*   **Real-time Decision Support**: Equipping venue organizers and volunteers with live operational logs and AI-guided reallocations.

---

## 🚀 Key Feature Modules

### 1. Fan Assistant AI Portal (Tab 1)
A conversational chatbot allowing fans to ask questions (e.g., "Where's the nearest taco stall?", "How do I get to Gate C?"). Features a language selector (English, Spanish, French, Arabic, Hindi, Bengali) and Quick Action chips for fast help.

### 2. Interactive Arena Layout (Tab 2)
An interactive, styled top-down SVG map of the stadium floor plan. Displays live wait times at Gates 1-8 and locations of restrooms, food concessions, medical hubs, and sensory quiet rooms. Selecting any POI draws an animated flow pathway from the nearest entrance gate.

### 3. Live Crowd Intelligence (Tab 3)
A dashboard for organizers showcasing circular stand density meters and live Recharts bar charts of gate waiting queues. Integrates an AI Load Balancing engine with dispatchable broadcast prompts and a predictive pre-game surge timeline.

### 4. Transport & Logistics (Tab 4)
Tracks real-time parking lot capacities (Lots A-D) with fill-rate gauges, external perimeter traffic congestion speeds, express transit arrivals (metro and shuttle express boards), and local weather coordinates.

### 5. Safety & Accessibility (Tab 5)
Simulates emergency incident overrides (e.g. Zone B smoke warnings, Gate 3 crush alerts). Incidents immediately trigger arena-wide alert banners and project evacuation vectors onto the SVG floor plan. Also hosts booking tools for ADA mobility shuttles.

### 6. Operations Command (Tab 6)
Volunteer coordinator command center. Houses live KPI counters (Total checked-in, Avg gate wait times, Active volunteer count) alongside a live log stream of AI Operational Insights for dispatcher sign-off.

---

## 🛠️ Technology Stack

*   **Framework**: React 19 (functional hooks & context) scaffolded via Vite
*   **Styling**: Tailwind CSS v4 (minimalist monochrome layout with neon lime `#e2ff70` highlights)
*   **Charts**: Recharts (gradient bar graphs & linear surge predictors)
*   **Icons**: Lucide React
*   **GenAI Engine**: Anthropic Messages API (Claude `claude-sonnet-4-6` model)

---

## 🧠 How AI is Integrated & Grounded

Instead of relying on generic pre-trained answers or static lookup FAQs, FIFA Copilot uses **context-grounded prompt engineering**:
1. **Context Extraction**: App state updates from the 6-second simulated IoT telemetry loop are structured into markdown tables.
2. **Prompt Injection**: Whenever a fan sends a message, a system prompt is built dynamically, injecting this live telemetry:
   - Specific wait times at gates
   - Crowd load percentages at stands
   - Parking lot fill rates
   - Weather and safety alerts
3. **Structured Outputs**: The model is instructed to output strictly in JSON format matching `{ "reply": "...", "reasoning": "..." }`. The React app parses this JSON, placing the conversational response in the chat bubble and the Claude reasoning explanation in the custom **REASONING** badge footer.
4. **Deterministic Fallbacks**: Safety-critical terms (e.g. `fire`, `danger`, `evacuate`) bypass the model call entirely to trigger immediate deterministic exit procedures. If the API key is missing or network connectivity is lost, the chatbot gracefully notifies the developer and engages a rule-based offline search backup to answer questions.

---

## 📦 Local Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/chowdhurysambu10-alt/Challenge-4.git
    cd Challenge-4
    ```

2.  **Install Dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Configure API Credentials**:
    Create a `.env` file in the root directory and define your Anthropic API Key:
    ```env
    VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Build Production Assets**:
    ```bash
    npm run build
    ```

---

## 📸 Screenshots & Demonstrations

*(Add visual GIFs/Screenshots of your command dashboard, SVG wayfinding overlays, and dark/light theme toggle here)*
