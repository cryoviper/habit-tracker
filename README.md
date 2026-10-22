# Streak · Habit Tracker

Track daily habits, keep streaks going and see your consistency on a GitHub-style heatmap. Built with React, with unit-tested streak logic.

**Live:** https://cryoviper.github.io/habit-tracker/

## Features

- Tick off habits for today or any of the last 7 days
- Today's progress ring
- Per-habit stats: current streak, best streak, last-30-day completion and total days
- 26-week heatmap per habit
- Add, edit, colour, reorder and delete habits (with a confirm step)
- Saved in `localStorage`, light and dark mode, works on phones

## Tech

- React 18 + Vite, state managed with `useReducer`
- Pure functions for all stats in `src/lib/stats.js`, tested with **Vitest** (`npm test`), including month boundaries and leap years
- Dates handled as local `YYYY-MM-DD` keys to avoid the UTC "wrong day" bug from `toISOString()`
- Native `<dialog>` for the editor, accessible toggle buttons with `aria-pressed`
- CI runs the tests before every GitHub Pages deploy

## Run locally

```bash
git clone https://github.com/cryoviper/habit-tracker.git
cd habit-tracker
npm install
npm test        # run unit tests
npm run dev
```

## What I learned

- Writing logic as pure functions so it's easy to test
- Timezone pitfalls when working with dates in JavaScript
- Using a reducer to keep state changes predictable

---

Built by [Praveen Sinwar](https://github.com/cryoviper).
