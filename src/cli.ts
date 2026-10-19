import { promises as fs } from 'fs';
import * as path from 'path';
import { checkText } from './core/checker';
import { createCrossrefClient, type Fetch } from './core/crossref';
import { validateLicenseKey } from './core/license';
import { LIMITS, LIMITS_URL } from './core/limits';
import { kindForFile } from './core/parse';
import { proRequiredMessage } from './core/pro';
import { renderReport, type ReportFormat } from './core/report';
import type { FileReport, Finding, FindingKind } from './core/types';

declare const CITE_LEDGER_VERSION: string | undefined;
const VERSION = typeof CITE_LEDGER_VERSION === 'string' ? CITE_LEDGER_VERSION : '0.1.0';

const USAGE = `Cite Ledger ${VERSION}: checks reference lists against Crossref.

Usage:
  cite-ledger check <file> [--mailto <email>]
  cite-ledger check <file|folder>... --license-key <key> [Pro options]
  cite-ledger limits

Files: .bib, .tex, .ltx, .md, .markdown, .qmd, .rmd

Options:
  --mailto <email>        Your contact for Crossref's polite pool (or CITE_LEDGER_MAILTO).
  --license-key <key>     Pro licence key (or CITE_LEDGER_LICENSE_KEY).
  --quiet                 Print only the summary.
Pro options:
  --fail-on <kinds>       Exit 1 when findings of these kinds exist. Comma list of:
                          retraction, expression-of-concern, correction, doi-not-found,
                          mismatch, unverified, lookup-failed, any.
  --report <file>         Write a report. Format from --format or the file extension.
  --format <md|csv|json>  Report format (default md).

Exit codes: 0 finished (a free run exits 0 whatever it finds); 1 a Pro --fail-on kind was
found; 2 usage, file or licence error.`;

const FAIL_ON_KINDS: Readonly<Record<string, readonly FindingKind[]>> = {
  retraction: ['retraction'],
  'expression-of-concern': ['expression-of-concern'],
  correction: ['correction'],
  'doi-not-found': ['doi-not-found'],
  mismatch: ['title-differs', 'year-differs', 'first-author-differs'],
  unverified: ['unverified'],
  'lookup-failed': ['lookup-failed'],
  any: ['retraction', 'expression-of-concern', 'correction', 'other-update', 'doi-not-found', 'title-differs', 'year-differs', 'first-author-differs', 'unverified', 'lookup-failed'],
};

const SKIP_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'out', 'build', '.venv', 'venv']);
const MAX_FILES = 2000;

export interface CliDeps {
  readonly fetch?: Fetch;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly stdout?: (text: string) => void;
  readonly stderr?: (text: string) => void;
  readonly now?: () => Date;
  readonly crossrefMinIntervalMs?: number;
  readonly polarBenefitId?: string;
}

interface Options {
  paths: string[];
  mailto?: string;
  licenseKey?: string;
  failOn?: string;
  report?: string;
  format?: string;
  quiet: boolean;
}

class UsageError extends Error {}

function parseArgs(args: readonly string[], env: Readonly<Record<string, string | undefined>>): Options {
  const options: Options = { paths: [], quiet: false, mailto: env.CITE_LEDGER_MAILTO, licenseKey: env.CITE_LEDGER_LICENSE_KEY };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = () => {
      const next = args[++i];
      if (next === undefined || next.startsWith('--')) {
        throw new UsageError(`${arg} needs a value.`);
      }
      return next;
    };
    switch (arg) {
      case '--mailto': options.mailto = value(); break;
      case '--license-key': options.licenseKey = value(); break;
      case '--fail-on': options.failOn = value(); break;
      case '--report': options.report = value(); break;
      case '--format': options.format = value(); break;
      case '--quiet': options.quiet = true; break;
      default:
        if (arg.startsWith('--')) {
          throw new UsageError(`Unknown option ${arg}.`);
        }
        options.paths.push(arg);
    }
  }
  return options;
}

async function collectFiles(target: string, found: string[]): Promise<void> {
  const stat = await fs.stat(target);
  if (stat.isFile()) {
    if (kindForFile(target)) {
      found.push(target);
    }
    return;
  }
  for (const item of await fs.readdir(target, { withFileTypes: true })) {
    if (found.length >= MAX_FILES) {
      return;
    }
    if (item.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(item.name) && !item.name.startsWith('.')) {
        await collectFiles(path.join(target, item.name), found);
      }
    } else if (kindForFile(item.name)) {
      found.push(path.join(target, item.name));
    }
  }
}

function formatFinding(file: string, finding: Finding): string {
  const tag = finding.claim ? `${finding.claim} ${finding.kind}` : finding.kind;
  return [
    `${file}:${finding.startLine + 1} ${finding.entryId} [${tag}] ${finding.message}`,
    `    evidence: ${finding.evidence.map((item) => item.url).join('  ')}`,
    `    could be wrong: ${finding.couldBeWrong}`,
  ].join('\n');
}

function failOnKinds(spec: string): Set<FindingKind> {
  const kinds = new Set<FindingKind>();
  for (const name of spec.split(',').map((part) => part.trim()).filter(Boolean)) {
    const mapped = FAIL_ON_KINDS[name];
    if (!mapped) {
      throw new UsageError(`Unknown --fail-on kind "${name}".`);
    }
    mapped.forEach((kind) => kinds.add(kind));
  }
  return kinds;
}

export async function main(argv: readonly string[], deps: CliDeps = {}): Promise<number> {
  const env = deps.env ?? process.env;
  const out = deps.stdout ?? ((text: string) => process.stdout.write(text));
  const err = deps.stderr ?? ((text: string) => process.stderr.write(text));
  const [command, ...rest] = argv;

  if (command === undefined || command === '-h' || command === '--help' || command === 'help') {
    out(`${USAGE}\n`);
    return command === undefined ? 2 : 0;
  }
  if (command === '-v' || command === '--version') {
    out(`${VERSION}\n`);
    return 0;
  }
  if (command === 'limits') {
    out(`${LIMITS.map((limit) => `${limit.id}: ${limit.text}`).join('\n')}\n${LIMITS_URL}\n`);
    return 0;
  }
  if (command !== 'check') {
    err(`Unknown command "${command}".\n\n${USAGE}\n`);
    return 2;
  }

  try {
    const options = parseArgs(rest, env);
    if (options.paths.length === 0) {
      throw new UsageError('Name a file to check.');
    }
    const files: string[] = [];
    for (const target of options.paths) {
      try {
        await collectFiles(target, files);
      } catch {
        throw new UsageError(`Cannot read ${target}.`);
      }
    }
    if (files.length === 0) {
      throw new UsageError('No .bib, .tex or Markdown files found.');
    }

    const wantsWorkspace = files.length > 1 || options.paths.length > 1;
    const wantsPro = wantsWorkspace || options.failOn !== undefined || options.report !== undefined;
    let licensed = false;
    if (options.licenseKey) {
      const result = await validateLicenseKey(options.licenseKey, {
        ...(deps.fetch ? { fetch: deps.fetch } : {}),
        ...(deps.polarBenefitId !== undefined ? { benefitId: deps.polarBenefitId } : {}),
      });
      licensed = result.valid;
      if (!result.valid && wantsPro) {
        err(`Licence not accepted: ${result.reason}\n`);
        return 2;
      }
    }
    if (wantsPro && !licensed) {
      const feature = wantsWorkspace ? 'workspace-scan' : options.failOn !== undefined ? 'exit-codes' : 'export-report';
      err(`${proRequiredMessage(feature)}\n`);
      return 2;
    }
    const failOn = options.failOn !== undefined ? failOnKinds(options.failOn) : undefined;
    const format = (options.format ?? (options.report ? path.extname(options.report).slice(1) : 'md')) || 'md';
    if (!['md', 'csv', 'json'].includes(format)) {
      throw new UsageError(`Unknown report format "${format}".`);
    }

    const crossref = createCrossrefClient({
      ...(deps.fetch ? { fetch: deps.fetch } : {}),
      ...(options.mailto ? { mailto: options.mailto } : {}),
      userAgent: `CiteLedger/${VERSION} (https://github.com/Tempuskg/cite-ledger)`,
      ...(deps.crossrefMinIntervalMs !== undefined ? { minIntervalMs: deps.crossrefMinIntervalMs } : {}),
    });
    const reports: FileReport[] = [];
    for (const file of files) {
      const kind = kindForFile(file);
      if (!kind) {
        continue;
      }
      const text = await fs.readFile(file, 'utf8');
      reports.push(await checkText(file, text, kind, { crossref, pro: licensed }));
    }

    const findings = reports.flatMap((report) => report.results.flatMap((result) => result.findings.map((finding) => ({ file: report.file, finding }))));
    if (!options.quiet) {
      for (const report of reports) {
        report.notes.forEach((note) => out(`${report.file}: ${note}\n`));
      }
      findings.forEach(({ file, finding }) => out(`${formatFinding(file, finding)}\n`));
    }
    const results = reports.flatMap((report) => report.results);
    out(`\nChecked ${results.length} references in ${reports.length} file(s) against Crossref: ${findings.length} finding(s).\n`);
    out(`Limits: ${LIMITS.map((limit) => `${limit.id} ${limit.text}`).join(' ')}\n`);

    if (options.report) {
      await fs.writeFile(options.report, renderReport(reports, format as ReportFormat, { version: VERSION, generatedAt: (deps.now ?? (() => new Date()))() }), 'utf8');
      out(`Report written to ${options.report}\n`);
    }
    if (failOn && findings.some(({ finding }) => failOn.has(finding.kind))) {
      return 1;
    }
    return 0;
  } catch (error) {
    if (error instanceof UsageError) {
      err(`${error.message}\n\n${USAGE}\n`);
      return 2;
    }
    err(`${(error as Error).message}\n`);
    return 2;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
