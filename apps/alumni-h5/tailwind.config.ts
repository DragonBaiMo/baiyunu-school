import type { Config } from 'tailwindcss';
import { buildTailwindPreset } from '@bynu/design-tokens/tailwind-preset';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  presets: [buildTailwindPreset() as unknown as Config],
  theme: { extend: {} },
  plugins: [],
};

export default config;
