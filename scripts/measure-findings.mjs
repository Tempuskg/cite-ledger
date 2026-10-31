// Development only: measures what the checker finds on a folder of real reference lists, so the
// share of findings that are not problems with the reference can be labelled by hand.
//
//   node scripts/measure-findings.mjs <folder> [--out <folder>] [--labels <labels.tsv>] [--mailto <email>]
//   node scripts/measure-findings.mjs --relabel --labels <labels.tsv> [--out <folder>]
//
// Checks every .bib, .tex and Markdown file under <folder> with the shipped checker, through
// createCrossrefClient at its default rate limits. Every request goes through a guard that refuses
// any host but api.crossref.org. Files in <folder> are read as text only; nothing in them is run.
//
// Writes to --out (default .measure/ in this repository; git and the VSIX ignore it):
//   summary.json, summary.md  entries checked, findings by kind and severity, labelled shares
//   findings.tsv              one line per finding for hand review; fill in the "label" column
//   labels.tsv                (yours) id<TAB>label, label one of: real, not-a-problem, cant-tell
// Pass --labels to fold a labels file into the summary; --relabel does that for an earlier run
// without looking anything up again. The output holds reference text: keep it
// out of the repository and off the public board.
import { createHash } from 'crypto';
import esbuild from 'esbuild';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ALLOWED_HOST = 'api.crossref.org';
const LABELS = ['real', 'not-a-problem', 'cant-tell'];
const root = fileURLToPath(new URL('..', import.meta.url));
const USAGE = `Usage:
  node scripts/measure-findings.mjs <folder> [--out <folder>] [--labels <labels.tsv>] [--mailto <email>]
  node scripts/measure-findings.mjs --relabel --labels <labels.tsv> [--out <folder>]`;

function parseArgs(argv) {
  const options = { out: join(root, '.measure') };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--out' || arg === '--labels' || arg === '--mailto') {
      options[arg.slice(2)] = argv[++i];
    } else if (arg === '--relabel') {
      options.relabel = true;
    } else {
      positional.push(arg);
    }
  }
  if (positional.length !== (options.relabel ? 0 : 1)) {
    console.error(USAGE);
    process.exit(2);
  }
  return { ...options, folder: positional[0] && resolve(positional[0]), out: resolve(options.out) };
}

/** Bundles the checker from src/ so the measurement uses the code as it stands. */
async function loadCore(out) {
  const outfile = join(out, 'core.bundle.mjs');
  await esbuild.build({
    stdin: {
      contents: "export * from './src/core/checker'; export * from './src/core/crossref'; export * from './src/core/parse';",
      resolveDir: root,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outfile,
    logLevel: 'warning',
  });
  return import(pathToFileURL(outfile).href);
}

function guardedFetch(counts) {
  return (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.protocol !== 'https:' || url.hostname !== ALLOWED_HOST) {
      throw new Error(`measure-findings refuses to contact ${url.host}`);
    }
    counts.requests++;
    return globalThis.fetch(url, init);
  };
}

function walk(dir, kindForFile) {
  return readdirSync(dir).sort().flatMap((name) => {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      return walk(full, kindForFile);
    }
    const kind = kindForFile(name);
    return kind ? [{ file: full, kind }] : [];
  });
}

const tsv = (value) => String(value ?? '').replace(/[\t\r\n]+/g, ' ').trim();

function readLabels(file) {
  const labels = new Map();
  if (!file) {
    return labels;
  }
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const [id, label] = line.split('\t').map((part) => part?.trim());
    if (!id || id === 'id') {
      continue;
    }
    if (!LABELS.includes(label)) {
      throw new Error(`labels: "${label}" for ${id} is not one of ${LABELS.join(', ')}`);
    }
    labels.set(id, label);
  }
  return labels;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.relabel) {
    summarize(args.out, args.labels);
    return;
  }
  mkdirSync(args.out, { recursive: true });
  const core = await loadCore(args.out);
  const counts = { requests: 0 };
  const crossref = core.createCrossrefClient({
    fetch: guardedFetch(counts),
    mailto: args.mailto ?? process.env.CITE_LEDGER_MAILTO,
    userAgent: 'cite-ledger-measure (development script)',
  });

  const files = walk(args.folder, core.kindForFile);
  const entries = { total: 0, byFileKind: {}, byStatus: {} };
  const findings = [];
  for (const [index, { file, kind }] of files.entries()) {
    const rel = relative(args.folder, file).replace(/\\/g, '/');
    process.stderr.write(`[${index + 1}/${files.length}] ${rel}\n`);
    const report = await core.checkText(rel, readFileSync(file, 'utf8'), kind, { crossref, pro: true });
    for (const result of report.results) {
      entries.total++;
      entries.byFileKind[kind] = (entries.byFileKind[kind] ?? 0) + 1;
      entries.byStatus[result.status] = (entries.byStatus[result.status] ?? 0) + 1;
      for (const finding of result.findings) {
        const id = createHash('sha1').update(`${rel}|${finding.entryId}|${finding.kind}|${finding.message}`).digest('hex').slice(0, 10);
        findings.push({ id, file: rel, fileKind: kind, structured: result.entry.structured, hasDoi: Boolean(result.entry.doi), reference: result.entry.rawText, ...finding });
      }
    }
  }

  const header = ['id', 'label', 'kind', 'severity', 'file', 'line', 'entry', 'file_kind', 'structured', 'has_doi', 'file_value', 'crossref_value', 'message', 'evidence', 'reference'];
  const rows = findings.map((f) => [f.id, '', f.kind, f.severity, f.file, f.startLine + 1, f.entryId, f.fileKind, f.structured, f.hasDoi, f.fileValue, f.crossrefValue, f.message, f.evidence[0]?.url, f.reference?.slice(0, 400)].map(tsv).join('\t'));
  writeFileSync(join(args.out, 'findings.tsv'), `${[header.join('\t'), ...rows].join('\n')}\n`);
  writeFileSync(join(args.out, 'summary.json'), `${JSON.stringify({ files: files.length, entries, requests: counts.requests }, null, 2)}\n`);
  if (!existsSync(join(args.out, '.gitignore'))) {
    writeFileSync(join(args.out, '.gitignore'), '*\n');
  }
  summarize(args.out, args.labels);
}

/** Folds labels into findings.tsv and writes the counts. Reads only the output folder: no lookups. */
function summarize(out, labelsFile) {
  const run = JSON.parse(readFileSync(join(out, 'summary.json'), 'utf8'));
  const [header, ...lines] = readFileSync(join(out, 'findings.tsv'), 'utf8').split('\n').filter(Boolean);
  const columns = header.split('\t');
  const at = (name) => columns.indexOf(name);
  const labels = readLabels(labelsFile);
  const byKind = {};
  let labelled = 0;
  const rows = lines.map((line) => {
    const cells = line.split('\t');
    const label = labelsFile ? labels.get(cells[at('id')]) ?? '' : cells[at('label')];
    cells[at('label')] = label;
    const kind = cells[at('kind')];
    const severity = cells[at('severity')];
    const row = (byKind[kind] ??= { total: 0, bySeverity: {}, labelled: 0, labels: {} });
    row.total++;
    row.bySeverity[severity] = (row.bySeverity[severity] ?? 0) + 1;
    if (label) {
      labelled++;
      row.labelled++;
      row.labels[label] = (row.labels[label] ?? 0) + 1;
    }
    return cells.join('\t');
  });
  for (const row of Object.values(byKind)) {
    row.notAProblemShare = row.labelled ? Math.round(((row.labels['not-a-problem'] ?? 0) / row.labelled) * 100) / 100 : null;
  }
  const { files, entries, requests } = run;
  writeFileSync(join(out, 'summary.json'), `${JSON.stringify({ files, entries, requests, findings: rows.length, labelled, byKind }, null, 2)}\n`);
  writeFileSync(join(out, 'findings.tsv'), `${[header, ...rows].join('\n')}\n`);

  const md = [
    '# Findings measurement',
    '',
    `Files: ${files}. Entries: ${entries.total} (${Object.entries(entries.byFileKind).map(([k, n]) => `${k} ${n}`).join(', ')}). Crossref requests: ${requests}.`,
    `Entry status: ${Object.entries(entries.byStatus).map(([k, n]) => `${k} ${n}`).join(', ')}.`,
    `Findings: ${rows.length}. Labelled by hand: ${labelled}.`,
    '',
    '| Kind | Findings | By severity | Labelled | Real | Not a problem | Can\'t tell | Not-a-problem share |',
    '| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |',
    ...Object.entries(byKind).sort((a, b) => b[1].total - a[1].total).map(([kind, row]) =>
      `| ${kind} | ${row.total} | ${Object.entries(row.bySeverity).map(([s, n]) => `${s} ${n}`).join(', ')} | ${row.labelled} | ${row.labels.real ?? 0} | ${row.labels['not-a-problem'] ?? 0} | ${row.labels['cant-tell'] ?? 0} | ${row.notAProblemShare ?? '-'} |`),
    '',
  ].join('\n');
  writeFileSync(join(out, 'summary.md'), md);
  process.stdout.write(md);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
