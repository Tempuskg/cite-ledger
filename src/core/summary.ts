import type { FileReport, Finding, FindingKind } from './types';

/** Buttons on the message shown after a check. */
export const SHOW_FINDINGS = 'Show Findings';
export const SHOW_OUTPUT = 'Show Output';
export const SHOW_LIMITS = 'What It Cannot Check';
export type ResultAction = typeof SHOW_FINDINGS | typeof SHOW_OUTPUT | typeof SHOW_LIMITS;

export interface CheckResultMessage {
  readonly text: string;
  readonly actions: readonly ResultAction[];
  readonly findings: number;
}

const KIND_LABELS: Readonly<Record<FindingKind, readonly [string, string]>> = {
  'doi-not-found': ['DOI not found', 'DOIs not found'],
  'other-agency': ['DOI registered outside Crossref', 'DOIs registered outside Crossref'],
  retraction: ['retraction', 'retractions'],
  'expression-of-concern': ['expression of concern', 'expressions of concern'],
  correction: ['correction', 'corrections'],
  'other-update': ['other update', 'other updates'],
  'title-differs': ['title differs', 'titles differ'],
  'year-differs': ['year differs', 'years differ'],
  'first-author-differs': ['first author differs', 'first authors differ'],
  unverified: ['unverified', 'unverified'],
  'lookup-failed': ['lookup failed', 'lookups failed'],
};

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function findingsOf(reports: readonly FileReport[]): Finding[] {
  return reports.flatMap((report) => report.results.flatMap((result) => result.findings));
}

/** "1 retraction, 2 DOIs not found", in the order the kinds first appear. */
export function breakdown(findings: readonly Finding[]): string {
  const counts = new Map<FindingKind, number>();
  for (const finding of findings) {
    counts.set(finding.kind, (counts.get(finding.kind) ?? 0) + 1);
  }
  return [...counts].map(([kind, n]) => count(n, ...KIND_LABELS[kind])).join(', ');
}

/** The message and buttons shown after checking one or more files. */
export function checkResultMessage(reports: readonly FileReport[]): CheckResultMessage {
  const references = reports.reduce((total, report) => total + report.results.length, 0);
  const findings = findingsOf(reports);
  const notes = reports.flatMap((report) => report.notes);
  const where = reports.length === 1 && reports[0] ? reports[0].file : count(reports.length, 'file', 'files');
  const suffix = notes.length > 0 ? ` ${notes.join(' ')}` : '';
  if (references === 0) {
    return { text: `Cite Ledger found no references to check in ${where}.${suffix}`, actions: [SHOW_OUTPUT], findings: 0 };
  }
  const checked = `${count(references, 'reference', 'references')} in ${where}`;
  if (findings.length === 0) {
    return {
      text: `Cite Ledger: no problems found in ${checked}, checked against Crossref.${suffix}`,
      actions: [SHOW_OUTPUT, SHOW_LIMITS],
      findings: 0,
    };
  }
  return {
    text: `Cite Ledger: ${count(findings.length, 'finding', 'findings')} in ${checked} (${breakdown(findings)}).${suffix}`,
    actions: [SHOW_FINDINGS, SHOW_OUTPUT],
    findings: findings.length,
  };
}

/** One line per finding for the output channel, as `file:line [tag] message`. */
export function findingLines(report: FileReport): string[] {
  return report.results.flatMap((result) => result.findings.map((finding) => {
    const tag = finding.claim ? `${finding.claim} ${finding.kind}` : finding.kind;
    return `  ${report.file}:${finding.startLine + 1} ${finding.entryId} [${tag}] ${finding.message}`;
  }));
}

/** The first finding in a file, by line, for the Show Findings button. */
export function firstFinding(report: FileReport): Finding | undefined {
  return report.results
    .flatMap((result) => result.findings)
    .reduce<Finding | undefined>((first, finding) => (!first || finding.startLine < first.startLine ? finding : first), undefined);
}
