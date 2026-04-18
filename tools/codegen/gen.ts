/**
 * OpenAPI → TS 类型生成器。
 * 输入：packages/contracts/openapi/*.yaml
 * 输出：packages/contracts/src/generated/*.ts
 */

import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const OPENAPI_DIR = resolve(ROOT, 'packages/contracts/openapi');
const OUT_DIR = resolve(ROOT, 'packages/contracts/src/generated');

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await readdir(OPENAPI_DIR);
  const yamls = files.filter((f) => f.endsWith('.yaml'));

  for (const f of yamls) {
    const input = resolve(OPENAPI_DIR, f);
    const name = f.replace(/\.yaml$/, '');
    // openapi-typescript 支持直接传入文件 URL
    const ast = await openapiTS(new URL(`file://${input.replace(/\\/g, '/')}`));
    const ts = astToString(ast);
    const outFile = resolve(OUT_DIR, `${name}.d.ts`);
    await writeFile(outFile, `/* 由 tools/codegen/gen.ts 生成，禁止手工修改 */\n${ts}`, 'utf8');
    console.log(`[codegen] ${f} → generated/${name}.d.ts`);
  }

  // 保持 index.ts 兼容存根（Phase 1b 起根据实际 schema 导出）
  console.log('[codegen] 完成。若新增 YAML 请同步更新 src/generated/index.ts。');
}

main().catch((err: unknown) => {
  console.error('[codegen] 失败：', err);
  process.exit(1);
});
