import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  outDir: 'dist',
  target: 'node20',
  clean: true,
  splitting: false,
  sourcemap: true,
  noExternal: [/^@bynu\//],
  external: ['@electric-sql/pglite', 'pg', 'ioredis', 'ioredis-mock'],
  skipNodeModulesBundle: false,
});
