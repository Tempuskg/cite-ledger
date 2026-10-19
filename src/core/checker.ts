import {
  CrossrefError,
  firstAuthorOfWork,
  searchEvidenceUrl,
  titleOfWork,
  workEvidenceUrl,
  yearsOfWork,
  type CrossrefClient,
  type CrossrefUpdate,
  type CrossrefWork,
} from './crossref';
import { LIMITS } from './limits';
import { coverage, normalizeText, sameFamilyName, stripUpdatePrefix, stripUrls, titleSimilarity, tokens, yearsIn } from './normalize';
import { parseReferences } from './parse';
import type { ClaimId, ClosestMatch, EntryResult, Evidence, FileKind, FileReport, Finding, FindingKind, ReferenceEntry, Severity } from './types';

/** Title similarity below which a structured entry's title is reported as different. */
const TITLE_DIFFERS_BELOW = 0.8;
/** Title similarity a search candidate needs before it counts as the same work. */
const CONFIDENT_MATCH = 0.9;

export interface CheckOptions {
  readonly crossref: CrossrefClient;
  /** Pro adds closest-match suggestions to unverified entries. */
  readonly pro: boolean;
}

const doiUrl = (doi: string) => `https://doi.org/${encodeURI(doi)}`;

function finding(
  entry: ReferenceEntry,
  kind: FindingKind,
  claim: ClaimId | undefined,
  severity: Severity,
  message: string,
  evidence: Evidence[],
  couldBeWrong: string,
  extra: Partial<Pick<Finding, 'fileValue' | 'crossrefValue' | 'closestMatch'>> = {},
): Finding {
  return {
    kind,
    ...(claim ? { claim } : {}),
    severity,
    entryId: entry.id,
    startLine: entry.startLine,
    endLine: entry.endLine,
    message,
    evidence,
    limits: LIMITS,
    couldBeWrong,
    ...extra,
  };
}

type UpdateClass = { kind: FindingKind; severity: Severity; noun: string };

function classifyUpdate(type: string): UpdateClass {
  const normalized = type.toLowerCase().replace(/[\s-]+/g, '_');
  if (['retraction', 'withdrawal', 'removal', 'partial_retraction'].includes(normalized)) {
    return { kind: 'retraction', severity: 'error', noun: 'Retraction' };
  }
  if (normalized === 'expression_of_concern') {
    return { kind: 'expression-of-concern', severity: 'warning', noun: 'Expression of concern' };
  }
  if (['correction', 'erratum', 'corrigendum'].includes(normalized)) {
    return { kind: 'correction', severity: 'info', noun: 'Correction' };
  }
  return { kind: 'other-update', severity: 'info', noun: 'Update' };
}

function sourceLabel(source: string): string {
  return source === 'retraction-watch' ? 'Retraction Watch' : source === 'publisher' ? 'the publisher' : source;
}

/** One finding per notice; a notice reported by both the publisher and Retraction Watch is merged. */
function updateFindings(entry: ReferenceEntry, work: CrossrefWork): Finding[] {
  const groups = new Map<string, { update: CrossrefUpdate; sources: string[] }>();
  for (const update of work['updated-by'] ?? []) {
    const key = `${update.DOI.toLowerCase()}|${classifyUpdate(update.type).kind}`;
    const group = groups.get(key) ?? { update, sources: [] };
    if (update.source && !group.sources.includes(update.source)) {
      group.sources.push(update.source);
    }
    groups.set(key, group);
  }
  return [...groups.values()].map(({ update, sources }) => {
    const cls = classifyUpdate(update.type);
    const date = update.updated?.['date-time']?.slice(0, 10);
    const recordedBy = sources.length > 0 ? ` Recorded by ${sources.map(sourceLabel).join(' and ')}.` : '';
    const label = cls.kind === 'other-update' ? `${update.label ?? update.type}` : cls.noun;
    return finding(
      entry,
      cls.kind,
      cls.kind === 'other-update' ? undefined : 'P2',
      cls.severity,
      `${label} recorded in Crossref for ${work.DOI}${date ? ` (${date})` : ''}: notice ${update.DOI}.${recordedBy}`,
      [
        { url: doiUrl(update.DOI), label: `${label} notice ${update.DOI}` },
        { url: workEvidenceUrl(work.DOI), label: `Crossref record ${work.DOI}` },
      ],
      'The notice is what Crossref records; read it to see what it changes. A correction may leave the findings intact.',
    );
  });
}

function compareStructured(entry: ReferenceEntry, work: CrossrefWork): Finding[] {
  const findings: Finding[] = [];
  const evidence = [{ url: workEvidenceUrl(work.DOI), label: `Crossref record ${work.DOI}` }, { url: doiUrl(work.DOI), label: `DOI ${work.DOI}` }];
  const crossrefTitle = stripUpdatePrefix(titleOfWork(work));
  const fullTitle = [crossrefTitle, ...(work.subtitle ?? [])].join(' ');
  if (entry.title && crossrefTitle) {
    const similarity = Math.max(titleSimilarity(entry.title, crossrefTitle), titleSimilarity(entry.title, fullTitle));
    if (similarity < TITLE_DIFFERS_BELOW) {
      findings.push(finding(entry, 'title-differs', 'P3', 'warning',
        `Title differs from the Crossref record for ${work.DOI}. File: "${entry.title}". Crossref: "${crossrefTitle}".`,
        evidence, 'Titles can differ legitimately, for example a translated or shortened title. The DOI may also point at the wrong work.',
        { fileValue: entry.title, crossrefValue: crossrefTitle }));
    }
  }
  const years = yearsOfWork(work);
  if (entry.year !== undefined && years.length > 0 && !years.includes(entry.year)) {
    findings.push(finding(entry, 'year-differs', 'P3', 'warning',
      `Year differs from the Crossref record for ${work.DOI}. File: ${entry.year}. Crossref: ${years.join(' or ')}.`,
      evidence, 'Print, online and conference years can differ; Crossref may hold only some of them.',
      { fileValue: String(entry.year), crossrefValue: years.join(' or ') }));
  }
  const crossrefAuthor = firstAuthorOfWork(work);
  if (entry.firstAuthorFamily && crossrefAuthor && !sameFamilyName(entry.firstAuthorFamily, crossrefAuthor)) {
    findings.push(finding(entry, 'first-author-differs', 'P3', 'warning',
      `First author differs from the Crossref record for ${work.DOI}. File: ${entry.firstAuthorFamily}. Crossref: ${crossrefAuthor}.`,
      evidence, 'Name order, transliteration or a group author can make the same person look different.',
      { fileValue: entry.firstAuthorFamily, crossrefValue: crossrefAuthor }));
  }
  return findings;
}

function compareFreeText(entry: ReferenceEntry, work: CrossrefWork): Finding[] {
  const findings: Finding[] = [];
  const evidence = [{ url: workEvidenceUrl(work.DOI), label: `Crossref record ${work.DOI}` }, { url: doiUrl(work.DOI), label: `DOI ${work.DOI}` }];
  const text = stripUrls(entry.rawText);
  const crossrefTitle = stripUpdatePrefix(titleOfWork(work));
  if (crossrefTitle && tokens(text).length >= 6 && coverage(crossrefTitle, text) < 0.5) {
    findings.push(finding(entry, 'title-differs', 'P3', 'warning',
      `The reference text does not contain the Crossref title for ${work.DOI}: "${crossrefTitle}".`,
      evidence, 'Free-text references may abbreviate or translate titles. The DOI may also point at the wrong work.',
      { fileValue: entry.rawText, crossrefValue: crossrefTitle }));
  }
  const textYears = yearsIn(text);
  const years = yearsOfWork(work);
  if (textYears.length === 1 && years.length > 0 && !years.includes(textYears[0])) {
    findings.push(finding(entry, 'year-differs', 'P3', 'warning',
      `Year differs from the Crossref record for ${work.DOI}. File: ${textYears[0]}. Crossref: ${years.join(' or ')}.`,
      evidence, 'Print, online and conference years can differ; Crossref may hold only some of them.',
      { fileValue: String(textYears[0]), crossrefValue: years.join(' or ') }));
  }
  const crossrefAuthor = firstAuthorOfWork(work);
  if (crossrefAuthor && tokens(text).length >= 6 && !normalizeText(text).split(' ').some((word) => sameFamilyName(word, crossrefAuthor))) {
    findings.push(finding(entry, 'first-author-differs', 'P3', 'warning',
      `The reference text does not name the first author in the Crossref record for ${work.DOI}: ${crossrefAuthor}.`,
      evidence, 'Transliteration, initials-only citations or a group author can hide a match.',
      { fileValue: entry.rawText, crossrefValue: crossrefAuthor }));
  }
  return findings;
}

function isConfidentMatch(entry: ReferenceEntry, work: CrossrefWork): boolean {
  const title = stripUpdatePrefix(titleOfWork(work));
  if (tokens(title).length === 0) {
    return false;
  }
  const years = yearsOfWork(work);
  const author = firstAuthorOfWork(work);
  if (entry.structured) {
    const fullTitle = [title, ...(work.subtitle ?? [])].join(' ');
    const similarity = entry.title ? Math.max(titleSimilarity(entry.title, title), titleSimilarity(entry.title, fullTitle)) : 0;
    const yearOk = entry.year === undefined || years.length === 0 || years.includes(entry.year);
    const authorOk = !entry.firstAuthorFamily || !author || sameFamilyName(entry.firstAuthorFamily, author);
    return similarity >= CONFIDENT_MATCH && yearOk && authorOk;
  }
  const text = entry.rawText;
  const textYears = yearsIn(text);
  const yearNamed = years.some((year) => textYears.includes(year));
  const authorNamed = author !== undefined && normalizeText(text).split(' ').some((word) => sameFamilyName(word, author));
  const yearOk = textYears.length === 0 || years.length === 0 || yearNamed;
  const authorOk = !author || authorNamed;
  // A short title such as "Deep learning" appears in many records, so it also needs the author and year.
  const titleOk = tokens(title).length >= 3 || (authorNamed && yearNamed);
  return titleOk && coverage(title, text) >= CONFIDENT_MATCH && yearOk && authorOk;
}

function closestMatch(entry: ReferenceEntry, candidates: readonly CrossrefWork[]): ClosestMatch | undefined {
  let best: ClosestMatch | undefined;
  for (const work of candidates) {
    const title = stripUpdatePrefix(titleOfWork(work));
    if (!title) {
      continue;
    }
    const similarity = entry.title ? titleSimilarity(entry.title, title) : coverage(title, entry.rawText);
    if (!best || similarity > best.similarity) {
      const years = yearsOfWork(work);
      const author = firstAuthorOfWork(work);
      best = {
        doi: work.DOI.toLowerCase(),
        title,
        ...(years[0] !== undefined ? { year: years[0] } : {}),
        ...(author ? { firstAuthor: author } : {}),
        similarity: Math.round(similarity * 100) / 100,
        url: doiUrl(work.DOI),
      };
    }
  }
  return best;
}

async function checkEntry(entry: ReferenceEntry, options: CheckOptions): Promise<EntryResult> {
  if (entry.skipReason) {
    return { entry, status: 'skipped', findings: [] };
  }
  try {
    if (entry.doi) {
      const lookup = await options.crossref.getWork(entry.doi);
      if (lookup.status === 'not-found') {
        return {
          entry,
          status: 'not-found',
          findings: [finding(entry, 'doi-not-found', 'P1', 'warning',
            `DOI ${entry.doi} does not resolve in Crossref.`,
            [
              { url: workEvidenceUrl(entry.doi), label: `Crossref lookup for ${entry.doi} (not found)` },
              { url: doiUrl(entry.doi), label: `doi.org resolver for ${entry.doi}` },
            ],
            'The DOI may be registered with another agency such as DataCite (L1): open the doi.org link to see whether it resolves there. It may also be mistyped.')],
        };
      }
      const work = lookup.work;
      const comparisons = !entry.inReferenceList ? [] : entry.structured ? compareStructured(entry, work) : compareFreeText(entry, work);
      return { entry, status: 'verified', crossrefDoi: work.DOI.toLowerCase(), findings: [...updateFindings(entry, work), ...comparisons] };
    }

    const candidates = await options.crossref.search(entry.queryText);
    const match = candidates.find((candidate) => isConfidentMatch(entry, candidate));
    if (match) {
      return { entry, status: 'matched', crossrefDoi: match.DOI.toLowerCase(), findings: updateFindings(entry, match) };
    }
    const closest = options.pro ? closestMatch(entry, candidates) : undefined;
    const message = closest
      ? `Unverified: no matching Crossref record found. Closest match: "${closest.title}"${closest.year ? ` (${closest.year})` : ''}, ${closest.doi}, similarity ${closest.similarity}.`
      : 'Unverified: no matching Crossref record found.';
    return {
      entry,
      status: 'unverified',
      findings: [finding(entry, 'unverified', 'P4', 'info', message,
        [
          { url: searchEvidenceUrl(entry.queryText), label: 'Crossref search for this reference' },
          ...(closest ? [{ url: closest.url, label: `Closest match ${closest.doi}` }] : []),
        ],
        'The work may exist without a Crossref record: books, reports, theses, preprints and web pages often have none (L3).',
        closest ? { closestMatch: closest } : {})],
    };
  } catch (error) {
    const url = error instanceof CrossrefError ? error.url : entry.doi ? workEvidenceUrl(entry.doi) : searchEvidenceUrl(entry.queryText);
    return {
      entry,
      status: 'error',
      findings: [finding(entry, 'lookup-failed', undefined, 'info',
        `Not checked: ${(error as Error).message}. Nothing is concluded about this reference.`,
        [{ url, label: 'The Crossref request that failed' }],
        'This is a network or service problem, not a finding about the reference. Check again later.')],
    };
  }
}

export async function checkEntries(entries: readonly ReferenceEntry[], options: CheckOptions): Promise<EntryResult[]> {
  return Promise.all(entries.map((entry) => checkEntry(entry, options)));
}

export async function checkText(file: string, text: string, kind: FileKind, options: CheckOptions): Promise<FileReport> {
  const parsed = parseReferences(text, kind);
  return { file, kind, results: await checkEntries(parsed.entries, options), notes: parsed.notes };
}

export function findingsOf(report: FileReport): Finding[] {
  return report.results.flatMap((result) => result.findings);
}
