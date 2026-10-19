import esbuild from 'esbuild';
import { readFileSync } from 'fs';

const args = new Set(process.argv.slice(2));
const watch = args.has('--watch');
const production = args.has('--production');
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const shared = {
  define: { CITE_LEDGER_VERSION: JSON.stringify(version) },
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: !production,
  minify: production,
  logLevel: 'info',
};

const contexts = await Promise.all([
  esbuild.context({ ...shared, entryPoints: ['src/extension.ts'], outfile: 'dist/extension.js', external: ['vscode'] }),
  esbuild.context({ ...shared, entryPoints: ['src/cli.ts'], outfile: 'dist/cli.js', banner: { js: '#!/usr/bin/env node' } }),
]);

if (watch) {
  await Promise.all(contexts.map((ctx) => ctx.watch()));
} else {
  await Promise.all(contexts.map((ctx) => ctx.rebuild()));
  await Promise.all(contexts.map((ctx) => ctx.dispose()));
}
