# MicroFocus

**A mindful productivity tracker that measures focus quality, not just duration.**

MicroFocus uses timed focus sessions (Pomodoro-style) with post-session self-rating (1–10 scale) to track your productivity trends over time. It features synthesised ambient soundscapes, motivational TTS quotes, and a clean chart-based dashboard — all running entirely client-side.

## Tech Stack

| Layer                | Technology                                |
| -------------------- | ----------------------------------------- |
| Framework            | Vue 3 (Composition API, `<script setup>`) |
| Language             | TypeScript (strict, zero `any`)           |
| Build Tool           | Vite                                      |
| State Management     | Pinia                                     |
| Styling              | Tailwind CSS v4 + CSS custom properties   |
| Internationalisation | vue-i18n                                  |
| Charts               | Chart.js via vue-chartjs                  |
| Unit Testing         | Vitest + Vue Test Utils                   |
| E2E Testing          | Playwright                                |
| Linting              | ESLint + Prettier + oxlint                |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check
npm run type-check

# Lint & format
npm run lint
npm run format

# Unit tests
npm run test:unit

# E2E tests (requires dev server running)
npm run test:e2e
```

## Project Structure

```
src/
├── assets/styles/     # Design system (CSS variables, typography, Tailwind)
├── components/
│   ├── layout/        # AppHeader, AppFooter
│   ├── ui/            # Reusable design-system components
│   ├── timer/         # TimerDisplay, TimerControls, RatingOverlay
│   ├── settings/      # SettingsPanel
│   └── stats/         # ProductivityChart
├── composables/       # useAudioSynth, useSpeech, useTimerWorker, useTheme, useAlarmLoop
├── i18n/              # vue-i18n setup + locale files
├── interfaces/        # TypeScript interfaces & DTOs
├── router/            # Vue Router config
├── stores/            # Pinia stores (settings, timer, history, alarm)
├── utils/             # Pure utility functions (time, storage, accessibility)
├── views/             # Route-level view components
├── workers/           # Web Worker (timer)
├── App.vue
└── main.ts
```

## Features

- **Focus Timer** — configurable countdown with Web Worker for background-tab accuracy
- **Break Mode** — stopwatch-style break tracking
- **Self-Rating** — 1–10 post-session focus quality assessment
- **Productivity Chart** — visual trend line with break/focus segment differentiation
- **Audio Synthesis** — 7 procedurally generated soundscapes (Web Audio API, zero external files)
- **Text-to-Speech** — motivational quote announcements with voice selection
- **Dark/Light Mode** — system-aware theme with manual toggle
- **Mobile-First** — responsive design with WCAG accessibility compliance
- **Offline-Ready** — all data persisted to localStorage, no backend required

## Documentation

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed Mermaid.js architecture diagrams.

## License

Private — All rights reserved.
