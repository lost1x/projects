# Spaarow Hub Improvement Plan

This document captures proposed improvements, cleanup tasks, and feature ideas for the Spaarow Hub site. It is intended to track progress and keep the project organized as we iterate.

---

## ✅ Immediate Cleanup (Done / In Progress)

### 1) Remove unused legacy assets
- [x] Delete unused JS files (`index.*`, `nanoid.js`, `install.js`, `dep-*`, etc.)
- [x] Update `robots.txt` to remove disallow entries for removed files

### 2) Verify current tool pages and formats
- [x] Confirm every tool page uses `asset/js/navigation.js` and `asset/css/main.css` correctly
- [x] Confirm tool pages use consistent naming (e.g., `love-language-quiz`, `tarot-reading`, etc.)

---

## 🚀 Enhancements (Short-term)

### A) Code + Asset Consolidation
- [x] Merge `hub.js` and `main.js` into a single “hub runtime” script to reduce duplication.
- [x] Merge `hub.css` + `slideshow.css` into `main.css` so the site uses a single stylesheet.

### B) PWA Improvements
- [x] Add `manifest.json` (PWA metadata) and ensure icons are in place.
- [x] Improve service worker caching strategy (cache-vs-network, update handling, offline fallback)
- [x] Add an “Install App” prompt / snippet for PWA install prompt.

### C) Accessibility + UX
- [x] Add focus-visible styles for keyboard navigation (cards, buttons, modals)
- [x] Improve ARIA labels for nav, modals, tool cards
- [ ] Provide a UI toggle for reduced motion (in addition to `prefers-reduced-motion` detection)

---

## 🌱 Growth / Feature Ideas

### 1) Engagement / Retention
- [x] Add a “Daily Card / Daily Fortune” widget to the hub homepage.
- [x] Implement “My readings” history with optional saved results (localStorage / simple user login)
- [x] Add “Share result” cards (auto-generated social images) for each tool.

### 2) Monetization Improvements
- [ ] Add a “free preview” mode for each tool (limited analysis) to boost conversion.
- [ ] Improve checkout flow (Stripe integration or a simple modal) to reduce friction.
- [ ] Add a “bundle” option (e.g. monthly pass for unlimited readings).

### 3) Content / SEO
- [ ] Add Schema.org structured data to each tool page
- [ ] Add unique Open Graph images per tool (not just hub OG image)
- [ ] Add a “How it works” section on the hub (explains the mechanics/value of each tool)

---

## 🔍 Tracking Progress
- Use this file as a checklist as we make changes.
- When a task is complete, mark it `- [x]` and optionally add notes about changes.
- If a task requires multiple sub-steps (e.g., bundling assets), add sub-task items under it.

---

## Notes / Ideas (Optional)
- Consider building a small admin view (local-only) to review “suggested tools” submitted via localStorage.
- Evaluate if the “suggest a tool” box should send submissions to a lightweight API (instead of localStorage) so suggestions persist across devices.
