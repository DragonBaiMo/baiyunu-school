/**
 * design-tokens 三端产物一致性校验。
 * 检查：tokens.css / tailwind.preset.js / miniapp.wxss / tokens.json 中
 * 对 Primitive+Semantic 颜色 Token 的键集合是否相同。不一致则 exit 1。
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokens } from '../src/tokens.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

function extractCssVarKeys(css: string): Set<string> {
  const set = new Set<string>();
  const regex = /--([a-z0-9-]+):/g;
  for (const m of css.matchAll(regex)) {
    if (m[1] !== undefined) set.add(m[1]);
  }
  return set;
}

async function main(): Promise<void> {
  const cssText = await readFile(resolve(DIST, 'tokens.css'), 'utf8');
  const wxssText = await readFile(resolve(DIST, 'miniapp.wxss'), 'utf8');
  const jsonText = await readFile(resolve(DIST, 'tokens.json'), 'utf8');
  const jsonObj = JSON.parse(jsonText) as typeof tokens;

  const cssKeys = extractCssVarKeys(cssText);
  const wxssKeys = extractCssVarKeys(wxssText);

  const sourceColorKeys = new Set<string>([
    ...Object.keys(tokens.color.primitive),
    ...Object.keys(tokens.color.semantic),
  ]);
  const jsonColorKeys = new Set<string>([
    ...Object.keys(jsonObj.color.primitive),
    ...Object.keys(jsonObj.color.semantic),
  ]);

  const missing: string[] = [];
  for (const k of sourceColorKeys) {
    if (!cssKeys.has(k)) missing.push(`css 缺失 ${k}`);
    if (!wxssKeys.has(k)) missing.push(`wxss 缺失 ${k}`);
    if (!jsonColorKeys.has(k)) missing.push(`json 缺失 ${k}`);
  }

  if (missing.length > 0) {
    console.error('[verify] 产物不一致：');
    for (const m of missing) console.error('  - ' + m);
    process.exit(1);
  }
  console.log(
    `[verify] OK · 颜色 Token ${sourceColorKeys.size} 个在 css/wxss/json 三端完全一致。`,
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
