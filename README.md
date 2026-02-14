# MicroFocus

> **A mindful productivity tracker that measures focus quality, not just duration.**

MicroFocus is a modern web application built with Vue 3 that helps you maintain deep focus through timed sessions. Unlike traditional timers, MicroFocus emphasizes quality over quantity by having you rate your focus level after each session.

## ✨ Features

- **🎯 Focus Timer**: Customizable focus sessions with visual countdown
- **📊 Quality Tracking**: Rate your focus level (1-10) after each session
- **📈 Productivity Insights**: Visualize your focus trends with Chart.js
- **🎵 Soundscapes**: Choose from 7 ambient sounds (Temple Gong, Forest, Ocean, Om, Bell, Retro, Digital)
- **🗣️ Speech Synthesis**: Optional motivational quotes via Web Speech API
- **☕ Break Management**: Track break durations with seamless transitions
- **🌙 Dark Mode**: Beautiful light/dark theme with smooth transitions
- **♿ Accessible**: Full keyboard navigation and screen reader support
- **💾 Persistent Storage**: Auto-saves settings and history to localStorage
- **🌐 Internationalized**: Built with vue-i18n (ready for multiple languages)

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
- **35 Unit Tests** - Utilities, stores, and components

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
│   ├── timer/       # Timer display, controls, rating
│   └── ui/          # Reusable UI components
├── composables/     # Vue composables
│   ├── useAlarmLoop.ts      # Sound/speech loop logic
│   ├── useAudioSynth.ts     # Web Audio synthesis
│   ├── useTheme.ts          # Dark mode management
│   ├── useTimerWorker.ts    # Worker lifecycle
│   └── useSpeech.ts         # Web Speech API
├── i18n/            # Internationalization
│   └── locales/     # Translation files
├── interfaces/      # TypeScript interfaces
├── stores/          # Pinia stores
│   ├── history.store.ts     # Session history (1000-item FIFO)
│   ├── settings.store.ts    # User preferences
│   └── timer.store.ts       # Timer state & logic
├── utils/           # Helper functions
├── views/           # Page components
├── workers/         # Web Workers
│   └── timer.worker.ts      # Background timer tick
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## 🎨 Design System

MicroFocus uses a custom Tailwind CSS v4 configuration with semantic color tokens:

- **Light Mode**: Clean whites with indigo accents
- **Dark Mode**: Deep slate backgrounds with emerald accents
- **Typography**: Inter font family with responsive sizing
- **Colors**: Focus sessions use emerald-600 (#059669), breaks use slate-400

## 🧪 Testing Strategy

### Unit Tests (35 passing)

- ✅ Utility functions (time, storage, accessibility)
- ✅ Pinia stores (settings, history)
- ✅ Business logic (timer modes, scoring)

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
