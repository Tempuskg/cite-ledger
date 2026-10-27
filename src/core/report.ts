import { LIMITS, LIMITS_URL } from './limits';
import type { FileReport, Finding } from './types';

export type ReportFormat = 'md' | 'csv' | 'json';

export interface ReportMeta {
  readonly version: string;
  readonly generatedAt: Date;
}

interface Row {
  readonly file: string;
  readonly finding: Finding;
}

function rows(reports: readonly FileReport[]): Row[] {
  return reports.flatMap((report) => report.results.flatMap((result) => result.findings.map((finding) => ({ file: report.file, finding }))));
}

function counts(reports: readonly FileReport[]): string {
  const results = reports.flatMap((report) => report.results);
  const by = (status: string) => results.filter((result) => result.status === status).length;
  return `${results.length} references in ${reports.length} file(s): ${by('verified')} found by DOI, ${by('matched')} matched by search, ` +
    `${by('not-found')} DOI not found, ${by('other-agency')} registered outside Crossref, ${by('unverified')} unverified, ${by('skipped')} not looked up, ${by('error')} not checked.`;
}

function markdownCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function csvCell(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function renderReport(reports: readonly FileReport[], format: ReportFormat, meta: ReportMeta): string {
  const all = rows(reports);
  if (format === 'json') {
    return `${JSON.stringify({
      tool: 'Cite Ledger',
      version: meta.version,
      generatedAt: meta.generatedAt.toISOString(),
      source: 'Crossref REST API (api.crossref.org)',
      summary: counts(reports),
      limits: LIMITS,
      files: reports,
    }, null, 2)}\n`;
  }
  if (format === 'csv') {
    const header = ['file', 'line', 'entry', 'kind', 'claim', 'severity', 'message', 'evidence', 'could_be_wrong', 'limits'];
    const lines = all.map(({ file, finding }) => [
      file,
      String(finding.startLine + 1),
      finding.entryId,
      finding.kind,
      finding.claim ?? '',
      finding.severity,
      finding.message,
      finding.evidence.map((item) => item.url).join(' '),
      finding.couldBeWrong,
      finding.limits.map((limit) => `${limit.id}: ${limit.text}`).join(' '),
    ].map(csvCell).join(','));
    return `${[header.join(','), ...lines].join('\r\n')}\r\n`;
  }
  const out = [
    '# Cite Ledger report',
    '',
    `Generated ${meta.generatedAt.toISOString()} by Cite Ledger ${meta.version}, against the Crossref REST API.`,
    '',
    counts(reports),
    '',
  ];
  if (all.length === 0) {
    out.push('No findings.', '');
  } else {
    out.push('| File | Line | Entry | Finding | Evidence | How this could be wrong |', '| --- | ---: | --- | --- | --- | --- |');
    for (const { file, finding } of all) {
      const evidence = finding.evidence.map((item) => `[${markdownCell(item.label)}](${item.url})`).join('<br>');
      out.push(`| ${markdownCell(file)} | ${finding.startLine + 1} | ${markdownCell(finding.entryId)} | ${markdownCell(finding.message)} | ${evidence} | ${markdownCell(finding.couldBeWrong)} |`);
    }
    out.push('');
  }
  out.push('## Limits', '');
  for (const limit of LIMITS) {
    out.push(`- **${limit.id}.** ${limit.text}`);
  }
  out.push('', `Details: ${LIMITS_URL}`, '');
  return out.join('\n');
}
