import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  outDir: 'dist',
  target: 'node20',
  clean: true,
  splitting: false,
  sourcemap: true,
  // 关键：将 workspace 源码打包进 bundle（否则 Node 无法解析 .ts 源文件）
  noExternal: [/^@bynu\//],
  external: ['@electric-sql/pglite', 'pg', 'ioredis', 'ioredis-mock'],
  skipNodeModulesBundle: false,
});
