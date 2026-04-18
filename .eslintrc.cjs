/**
 * 根 ESLint 配置（legacy）。
 * 说明：为保持 Phase 1a 脚手架可快速通过 lint，基线使用 recommended 级别；
 * 后续 Phase 1b+ 再逐步开启 strict-type-checked。
 */
module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['apps/admin-web/**/*.{ts,tsx}', 'apps/alumni-h5/**/*.{ts,tsx}'],
      plugins: ['react-hooks'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.turbo',
    '.data',
    '.sisyphus',
    'downloaded_images',
    '**/generated/**',
    '**/*.d.ts',
  ],
};
