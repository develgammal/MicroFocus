# MicroFocus

> **A mindful productivity tracker that measures focus quality, not just duration.**

MicroFocus is a modern web application built with Vue 3 that helps you maintain deep focus through timed sessions. Unlike traditional timers, MicroFocus emphasizes quality over quantity by having you rate your focus level after each session.

## ✨ Features

- **🎯 Focus Timer**: Customizable focus sessions with visual countdown
- **📊 Quality Tracking**: Rate your focus level (1-10) after each session
- **📈 Productivity Insights**: Visualize your focus trends with Chart.js
- **🧠 Cognitive Fatigue Detection**: Psychology-backed algorithm that detects mental fatigue trends and suggests breaks at the right moment
- **🎵 Soundscapes**: Choose from 7 ambient sounds (Temple Gong, Forest, Ocean, Om, Bell, Retro, Digital)
- **🗣️ Speech Synthesis**: Optional motivational quotes via Web Speech API
- **☕ Break Management**: Stopwatch and countdown breaks with rebound tracking
- **🌙 Dark Mode**: Beautiful light/dark theme with smooth transitions
- **♿ Accessible**: Full keyboard navigation and screen reader support
- **💾 Persistent Storage**: Auto-saves settings and history to localStorage
- **🌐 Internationalized**: Built with vue-i18n (ready for multiple languages)

## 🧠 The Science Behind Break Suggestions

Most productivity timers use a simple rule: work for X minutes, then take a break. MicroFocus goes further by analysing the **trend** of your self-reported focus scores to detect cognitive fatigue before you feel it — and to protect you when you're building momentum.

### How It Works

After each focus session you rate your focus from 1–10. The algorithm looks at a **rolling window of your last 3 sessions** and calculates the slope of that trend using ordinary least-squares linear regression:

```
slope = (latest_score - earliest_score) / 2
```

This simple formula, combined with your current absolute score, lets the algorithm classify your cognitive state and decide whether to suggest a break, encourage you, or stay quiet.

### Cognitive States at a Glance

| State | What It Means | What Happens |
|-------|---------------|--------------|
| **Steep Crash** | Focus dropping fast (slope ≤ -1.5) regardless of score | Suggests an immediate 20-min break |
| **Exhaustion** | Moderate decline landing below 5/10 | Suggests a 15-min break |
| **Stagnation** | Stuck at very low scores with no improvement | Suggests a 10-min break |
| **Warm-Up** | Scores are low but *rising* — you're getting into the zone | No interruption — keeps you going |
| **Flow** | High scores, steady or climbing — peak focus | No interruption — protects deep work |
| **Rebound** | After a break, your score jumped back up | Shows a positive-feedback banner (e.g. "+75%") |

### Why These Numbers?

Every threshold is grounded in peer-reviewed cognitive psychology:

- **3-session window** — Three 25-min sessions ≈ 75 min of active work, which maps to the ~90-minute **Basic Rest-Activity Cycle (BRAC)** described by sleep researcher Nathaniel Kleitman. The algorithm checks in right before biological fatigue sets in.
- **Slope of -1.5 (Steep Crash)** — Derived from the **Minimal Important Difference (MID)** in psychometrics. On a 10-point scale, a 1.5-point-per-session drop is the smallest decline that reliably signals real cognitive depletion rather than normal noise.
- **Score ≤ 5 (Distress Threshold)** — Corresponds to crossing the peak of the **Yerkes-Dodson inverted-U curve**, where productive stress (eustress) tips into counterproductive stress (distress).
- **Positive slope ≥ 0.5 with low score (Warm-Up)** — Modelled on the **double-exponential learning curve** from cognitive psychology: early sessions on a hard task are tough, but rising scores show you're mobilising resources toward Flow.
- **Rebound metric** — Inspired by the **Peak-End Rule** (Kahneman): we compare your post-break score to the *last* pre-break score (the low point you remember), not the window average.

### Key References

| Source | Contribution |
|--------|-------------|
| Mackworth, N. H. (1948). *The breakdown of vigilance during prolonged visual search.* | Established that sustained attention reliably declines over time (Vigilance Decrement) |
| Yerkes, R. M. & Dodson, J. D. (1908). *The relation of strength of stimulus to rapidity of habit-formation.* | The inverted-U relationship between arousal and performance |
| Csíkszentmihalyi, M. (1975). *Beyond Boredom and Anxiety.* | Defined the Flow state — complete absorption when challenge matches skill |
| Kleitman, N. (1963). *Sleep and Wakefulness.* | Proposed the Basic Rest-Activity Cycle (BRAC) — ~90-min ultradian rhythms |
| Kahneman, D. (2000). *Evaluation by moments: Past and future.* | Peak-End Rule — people judge experiences by how they felt at the peak and end |
| Warm, J. S. et al. (2008). *Vigilance requires hard mental work and is stressful.* | Modern physiological evidence for cognitive fatigue during sustained attention |

> For the full research paper with derivations and mathematical proofs, see [docs/cognitive-fatigue-research.md](docs/cognitive-fatigue-research.md).

## 🛠️ Tech Stack

### Core

- **Vue 3.5.27** - Composition API with `<script setup>`
- **TypeScript 5.9.3** - Strict mode with zero `any` types
- **Vite 7.3.1** - Lightning-fast build tool
- **Pinia 3.0.4** - Type-safe state management

### UI/UX

- **Tailwind CSS v4** - Custom design system with CSS variables
- **Chart.js 4.5.1** - Interactive productivity charts
- **Web Worker** - Background timer with drift correction
- **Web Audio API** - Custom synthesized soundscapes

### Testing

- **Vitest 4.0.18** - Unit tests with jsdom
- **Playwright 1.58.1** - E2E testing
- **79 Unit Tests** - Utilities, stores, composables, and components

### Code Quality

- **OXLint** - Blazing fast linter
- **ESLint** - Code quality enforcement
- **Prettier** - Consistent formatting
- **TypeScript** - Strict type checking

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+ (current: check with `node -v`)
- npm or pnpm

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd MicroFocus

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 📦 Available Scripts

### Development

```sh
npm run dev          # Start dev server with hot reload
npm run build        # Type-check and build for production
npm run preview      # Preview production build locally
```

### Testing

```sh
npm run test:unit    # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright

# E2E options
npx playwright install              # Install browsers (first time)
npm run test:e2e -- --project=chromium  # Test specific browser
npm run test:e2e -- --debug             # Debug mode
```

### Code Quality

```sh
npm run lint         # Run all linters
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking only
```

## 🏗️ Project Structure

```
src/
├── assets/          # Styles, fonts, images
│   └── styles/      # Global CSS and Tailwind config
├── components/      # Vue components
│   ├── layout/      # Header, Footer
│   ├── settings/    # Settings panel
│   ├── stats/       # Charts and statistics
│   ├── timer/       # Timer display, controls, rating, cognitive overlays
│   └── ui/          # Reusable UI components
├── composables/     # Vue composables
│   ├── useAlarmLoop.ts        # Sound/speech loop logic
│   ├── useAudioSynth.ts       # Web Audio synthesis
│   ├── useAutoDismiss.ts      # Auto-dismiss timer for banners
│   ├── useCognitiveAnalysis.ts # Cognitive fatigue detection algorithm
│   ├── useSessionManager.ts   # Session lifecycle orchestration
│   ├── useTheme.ts            # Dark mode management
│   ├── useTimerWorker.ts      # Worker lifecycle
│   └── useSpeech.ts           # Web Speech API
├── constants/       # Configuration constants
│   └── app.constants.ts       # Timer, score, and cognitive thresholds
├── i18n/            # Internationalization
│   └── locales/     # Translation files
├── interfaces/      # TypeScript interfaces and enums
├── stores/          # Pinia stores
│   ├── history.store.ts       # Session history (1000-item FIFO)
│   ├── settings.store.ts      # User preferences
│   └── timer.store.ts         # Timer state & logic
├── utils/           # Helper functions
├── views/           # Page components
├── workers/         # Web Workers
│   └── timer.worker.ts        # Background timer tick
├── App.vue          # Root component
└── main.ts          # Application entry point
docs/
└── cognitive-fatigue-research.md  # Full research paper with derivations
```

## 🎨 Design System

MicroFocus uses a custom Tailwind CSS v4 configuration with semantic color tokens:

- **Light Mode**: Clean whites with indigo accents
- **Dark Mode**: Deep slate backgrounds with emerald accents
- **Typography**: Inter font family with responsive sizing
- **Colors**: Focus sessions use emerald-600 (#059669), breaks use slate-400

## 🧪 Testing Strategy

### Unit Tests (79 passing)

- ✅ Utility functions (time, storage, accessibility)
- ✅ Pinia stores (settings, history)
- ✅ Business logic (timer modes, scoring)
- ✅ Cognitive fatigue detection algorithm (44 tests)

### E2E Tests

- ✅ Complete focus session flow
- ✅ Break management and transitions
- ✅ Settings persistence

## ⚡ Performance Features

- **Web Worker Timer**: Prevents main thread blocking
- **Drift Correction**: Accurate timing even under CPU load
- **Lazy Loading**: Components loaded on demand
- **Optimized Build**: Tree-shaking and code splitting
- **LocalStorage Cache**: Instant app startup

## ♿ Accessibility

- ARIA labels and roles throughout
- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- Screen reader announcements for timer events
- Focus visible indicators
- Color contrast meets WCAG AA standards

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## 📝 License

This project is private and not licensed for public use.

## 🛠️ Development Tools

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- Disable Vetur if installed

### Browser DevTools Extensions

- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## 🤝 Contributing

This is a private project. Contributions are by invitation only.

---

Built with ❤️ using Vue 3 + TypeScript + Vite
