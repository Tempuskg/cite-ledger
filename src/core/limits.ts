import type { LimitStatement } from './types';

export const LIMITS_URL = 'https://github.com/Tempuskg/cite-ledger/blob/main/docs/limits.md';

/** Register limits L1–L3, verbatim. Every finding carries all three. */
export const LIMITS: readonly LimitStatement[] = Object.freeze([
  { id: 'L1', text: 'Does not check DOIs registered outside Crossref, for example DataCite.' },
  { id: 'L2', text: "Crossref's retraction data can miss some retractions." },
  { id: 'L3', text: "'Unverified' means no matching record was found, not that the reference is fabricated." },
]);

export function limitsLine(): string {
  return `Limits: ${LIMITS.map((limit) => `${limit.id} ${limit.text}`).join(' ')} (${LIMITS_URL})`;
}
