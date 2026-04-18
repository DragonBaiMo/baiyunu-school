/**
 * 将 Token 对象生成 4 种产物到 dist/：
 * - tokens.css（CSS vars，含 [data-theme="dark"] 主题切换）
 * - miniapp.wxss（小程序样式变量）
 * - tokens.json（JS/JSON 消费者）
 * - tailwind.preset.js（Tailwind 预设，通过 tsc 编译后注入 re-export）
 * - index.js / index.d.ts / tailwind.preset.d.ts（通过 tsc 生成）
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { tokens } from './tokens.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

async function ensureDir(p: string): Promise<void> {
  await mkdir(p, { recursive: true });
}

function buildCssVars(): string {
  const lines: string[] = [];
  lines.push('/* 由 @bynu/design-tokens 生成，禁止手工修改。源：src/tokens.ts */');
  lines.push(':root {');
  for (const [k, v] of Object.entries(tokens.color.primitive)) {
    lines.push(`  --${k}: ${v};`);
  }
  for (const [k, v] of Object.entries(tokens.color.semantic)) {
    lines.push(`  --${k}: ${v.light};`);
  }
  for (const [k, v] of Object.entries(tokens.space)) lines.push(`  --${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.radius)) lines.push(`  --${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.shadow)) lines.push(`  --${k}: ${v};`);
  lines.push('}');
  lines.push('[data-theme="dark"] {');
  for (const [k, v] of Object.entries(tokens.color.semantic)) {
    lines.push(`  --${k}: ${v.dark};`);
  }
  lines.push('}');
  return lines.join('\n') + '\n';
}

function buildMiniappWxss(): string {
  const lines: string[] = [];
  lines.push('/* 由 @bynu/design-tokens 生成，供小程序使用。禁止手工修改。 */');
  lines.push('page {');
  for (const [k, v] of Object.entries(tokens.color.primitive)) lines.push(`  --${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.color.semantic)) lines.push(`  --${k}: ${v.light};`);
  for (const [k, v] of Object.entries(tokens.space)) lines.push(`  --${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.radius)) lines.push(`  --${k}: ${v};`);
  lines.push('}');
  return lines.join('\n') + '\n';
}

async function main(): Promise<void> {
  await ensureDir(DIST);
  await writeFile(resolve(DIST, 'tokens.css'), buildCssVars(), 'utf8');
  await writeFile(resolve(DIST, 'miniapp.wxss'), buildMiniappWxss(), 'utf8');
  await writeFile(resolve(DIST, 'tokens.json'), JSON.stringify(tokens, null, 2), 'utf8');

  // 通过 tsc 编译 ts 源为 dist/*.js（供 node 运行时引用）
  execSync('tsc -p tsconfig.json', { stdio: 'inherit', cwd: resolve(__dirname, '..') });
  console.log('[design-tokens] 已生成 4 份产物到 dist/');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
