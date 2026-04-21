# Vue 3 SDK Components

Documentation-only Vue SFC components. These are stored outside `src/` to prevent the React/Vite build system from attempting to parse them as JSX.

For actual usage in React apps, use the string-based `vueSourceTemplates.js` in `src/components/sdk/`.

- `AdaptiveButton.vue` — Button that adapts text based on psychographics
- `AdaptiveContainer.vue` — Conditional renderer based on user profile
- `AdaptiveText.vue` — Text element that personalizes content