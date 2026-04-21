module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['src/components/sdk/vue/**/*.{jsx,vue.jsx}'],
      parser: 'espree',
      parserOptions: { ecmaVersion: 'latest' },
      rules: {
        'no-unused-vars': 'off',
        'no-undef': 'off',
      },
    },
  ],
  ignorePatterns: ['src/components/sdk/vue/**'],
};