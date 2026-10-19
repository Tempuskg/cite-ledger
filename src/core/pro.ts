export type ProFeature = 'workspace-scan' | 'exit-codes' | 'export-report' | 'closest-match';

export const PRO_FEATURES: Readonly<Record<ProFeature, string>> = Object.freeze({
  'workspace-scan': 'Checking more than one file at a time (workspace scan)',
  'exit-codes': 'CLI/CI exit codes',
  'export-report': 'Exportable Markdown, CSV or JSON report',
  'closest-match': 'Closest-match suggestions for unverified references',
});

/** Single-file checks, including retraction flags, never need a licence. */
export function isAllowed(feature: ProFeature | 'single-file-check', licensed: boolean): boolean {
  return feature === 'single-file-check' || licensed;
}

export function proRequiredMessage(feature: ProFeature): string {
  return `${PRO_FEATURES[feature]} needs a Cite Ledger Pro licence. Single-file checks, including retraction flags, are free.`;
}
