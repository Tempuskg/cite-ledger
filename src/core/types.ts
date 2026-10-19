export type FileKind = 'bibtex' | 'latex' | 'markdown';

/** One reference found in a file, with the details Cite Ledger can compare against Crossref. */
export interface ReferenceEntry {
  /** Citation key, or a label such as "line 12" when the format has none. */
  readonly id: string;
  readonly kind: FileKind;
  /** 0-based, inclusive. */
  readonly startLine: number;
  readonly endLine: number;
  readonly doi?: string;
  readonly title?: string;
  readonly year?: number;
  readonly firstAuthorFamily?: string;
  /** Bibliographic text sent to Crossref when the entry has no DOI. */
  readonly queryText: string;
  /** Free text used for comparisons when the format has no fields (LaTeX \bibitem, Markdown). */
  readonly rawText: string;
  /** True when title, year and author come from named fields (BibTeX). */
  readonly structured: boolean;
  /** False for a DOI found in prose outside a reference list: only P1 and P2 checks apply. */
  readonly inReferenceList: boolean;
  /** Set when the entry is deliberately not looked up, for example a web page with no DOI. */
  readonly skipReason?: string;
}

export interface ParseResult {
  readonly entries: ReferenceEntry[];
  /** Informational notes, such as "references are in refs.bib". No network is involved. */
  readonly notes: string[];
}

export type FindingKind =
  | 'doi-not-found'
  | 'retraction'
  | 'expression-of-concern'
  | 'correction'
  | 'other-update'
  | 'title-differs'
  | 'year-differs'
  | 'first-author-differs'
  | 'unverified'
  | 'lookup-failed';

export type ClaimId = 'P1' | 'P2' | 'P3' | 'P4';
export type LimitId = 'L1' | 'L2' | 'L3';
export type Severity = 'error' | 'warning' | 'info';

export interface Evidence {
  readonly url: string;
  readonly label: string;
}

export interface LimitStatement {
  readonly id: LimitId;
  readonly text: string;
}

export interface ClosestMatch {
  readonly doi: string;
  readonly title: string;
  readonly year?: number;
  readonly firstAuthor?: string;
  /** Title similarity in [0, 1]. */
  readonly similarity: number;
  readonly url: string;
}

export interface Finding {
  readonly kind: FindingKind;
  /** The register claim this finding exercises; absent for lookup failures. */
  readonly claim?: ClaimId;
  readonly severity: Severity;
  readonly entryId: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly message: string;
  /** At least one link a reader can open to check the finding. */
  readonly evidence: readonly Evidence[];
  /** Always L1, L2 and L3. */
  readonly limits: readonly LimitStatement[];
  /** How this particular finding could be wrong. */
  readonly couldBeWrong: string;
  /** For mismatches: the value in the file and the value in Crossref. */
  readonly fileValue?: string;
  readonly crossrefValue?: string;
  /** Pro only: the nearest Crossref record for an unverified entry. */
  readonly closestMatch?: ClosestMatch;
}

export type EntryStatus = 'verified' | 'matched' | 'not-found' | 'unverified' | 'skipped' | 'error';

export interface EntryResult {
  readonly entry: ReferenceEntry;
  readonly status: EntryStatus;
  /** The Crossref DOI the entry was checked against, when there is one. */
  readonly crossrefDoi?: string;
  readonly findings: readonly Finding[];
}

export interface FileReport {
  readonly file: string;
  readonly kind: FileKind;
  readonly results: readonly EntryResult[];
  readonly notes: readonly string[];
}
