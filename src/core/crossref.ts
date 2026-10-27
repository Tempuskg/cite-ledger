/** The only host the checker contacts (claim P5). Not configurable. */
export const CROSSREF_HOST = 'api.crossref.org';
const CROSSREF_BASE = `https://${CROSSREF_HOST}`;
const SEARCH_FIELDS = 'DOI,title,subtitle,author,issued,published,published-print,published-online,updated-by,type,container-title';

export interface CrossrefAuthor {
  readonly given?: string;
  readonly family?: string;
  readonly name?: string;
  readonly sequence?: string;
}

export interface CrossrefDate {
  readonly 'date-parts'?: readonly (readonly (number | null)[])[];
}

export interface CrossrefUpdate {
  readonly DOI: string;
  readonly type: string;
  readonly label?: string;
  readonly source?: string;
  readonly updated?: { readonly 'date-time'?: string };
}

export interface CrossrefWork {
  readonly DOI: string;
  readonly title?: readonly string[];
  readonly subtitle?: readonly string[];
  readonly author?: readonly CrossrefAuthor[];
  readonly issued?: CrossrefDate;
  readonly published?: CrossrefDate;
  readonly 'published-print'?: CrossrefDate;
  readonly 'published-online'?: CrossrefDate;
  readonly 'updated-by'?: readonly CrossrefUpdate[];
  readonly type?: string;
  readonly 'container-title'?: readonly string[];
}

export type WorkLookup = { readonly status: 'found'; readonly work: CrossrefWork } | { readonly status: 'not-found' };

/** The registration agency Crossref names for a DOI, such as `{ id: 'datacite', label: 'DataCite' }`. */
export interface WorkAgency {
  readonly id: string;
  readonly label: string;
}

export type AgencyLookup = { readonly status: 'found'; readonly agency: WorkAgency } | { readonly status: 'not-found' };

export interface CrossrefClient {
  getWork(doi: string): Promise<WorkLookup>;
  /** Which agency registered a DOI, from Crossref's `/works/{doi}/agency`. Asked when the DOI has no Crossref record. */
  getAgency(doi: string): Promise<AgencyLookup>;
  search(bibliographic: string, rows?: number): Promise<CrossrefWork[]>;
}

export class CrossrefError extends Error {
  constructor(message: string, readonly url: string) {
    super(message);
  }
}

export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

export interface CrossrefClientOptions {
  readonly fetch?: Fetch;
  /** Sent as Crossref asks, for its polite pool. Never placed in evidence links. */
  readonly mailto?: string;
  readonly userAgent?: string;
  readonly concurrency?: number;
  readonly minIntervalMs?: number;
  readonly retries?: number;
  readonly timeoutMs?: number;
  readonly sleep?: (ms: number) => Promise<void>;
}

/** Public, mailto-free URL of a Crossref record, for evidence links. */
export function workEvidenceUrl(doi: string): string {
  return `${CROSSREF_BASE}/works/${encodeURI(doi)}`;
}

/** Public, mailto-free URL of Crossref's registration-agency lookup for a DOI, for evidence links. */
export function agencyEvidenceUrl(doi: string): string {
  return `${workEvidenceUrl(doi)}/agency`;
}

/** Public, mailto-free URL of a Crossref search, for evidence links. */
export function searchEvidenceUrl(bibliographic: string, rows = 3): string {
  return `${CROSSREF_BASE}/works?query.bibliographic=${encodeURIComponent(bibliographic)}&rows=${rows}`;
}

export function createCrossrefClient(options: CrossrefClientOptions = {}): CrossrefClient {
  const fetcher: Fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const concurrency = Math.max(1, options.concurrency ?? 3);
  const minIntervalMs = options.minIntervalMs ?? 200;
  const retries = options.retries ?? 3;
  const timeoutMs = options.timeoutMs ?? 20_000;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const mailto = options.mailto?.trim();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.userAgent) {
    headers['User-Agent'] = options.userAgent;
  }

  let active = 0;
  let lastStart = 0;
  const waiting: (() => void)[] = [];
  const workCache = new Map<string, Promise<WorkLookup>>();
  const agencyCache = new Map<string, Promise<AgencyLookup>>();

  async function acquire(): Promise<void> {
    if (active >= concurrency) {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }
    active++;
    const gap = lastStart + minIntervalMs - Date.now();
    lastStart = Date.now() + Math.max(0, gap);
    if (gap > 0) {
      await sleep(gap);
    }
  }

  function release(): void {
    active--;
    waiting.shift()?.();
  }

  function withMailto(url: string): string {
    return mailto ? `${url}${url.includes('?') ? '&' : '?'}mailto=${encodeURIComponent(mailto)}` : url;
  }

  async function request(url: string): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      await acquire();
      let response: Response;
      try {
        response = await fetcher(withMailto(url), { headers, signal: AbortSignal.timeout(timeoutMs) });
      } catch (error) {
        if (attempt >= retries) {
          throw new CrossrefError(`Could not reach Crossref: ${(error as Error).message}`, url);
        }
        await sleep(1000 * 2 ** attempt);
        continue;
      } finally {
        release();
      }
      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        const retryAfter = Number(response.headers.get('retry-after'));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt);
        continue;
      }
      return response;
    }
  }

  async function getWork(doi: string): Promise<WorkLookup> {
    const url = workEvidenceUrl(doi);
    const response = await request(url);
    if (response.status === 404) {
      return { status: 'not-found' };
    }
    if (!response.ok) {
      throw new CrossrefError(`Crossref answered ${response.status}`, url);
    }
    const body = (await response.json()) as { message?: CrossrefWork };
    if (!body.message?.DOI) {
      throw new CrossrefError('Crossref returned a record without a DOI', url);
    }
    return { status: 'found', work: body.message };
  }

  async function getAgency(doi: string): Promise<AgencyLookup> {
    const url = agencyEvidenceUrl(doi);
    const response = await request(url);
    if (response.status === 404) {
      return { status: 'not-found' };
    }
    if (!response.ok) {
      throw new CrossrefError(`Crossref answered ${response.status}`, url);
    }
    const body = (await response.json()) as { message?: { agency?: Partial<WorkAgency> } };
    const agency = body.message?.agency;
    if (!agency?.id) {
      throw new CrossrefError('Crossref returned an agency record without an agency', url);
    }
    return { status: 'found', agency: { id: agency.id.toLowerCase(), label: agency.label || agency.id } };
  }

  function cached<T>(cache: Map<string, Promise<T>>, lookup: (doi: string) => Promise<T>, doi: string): Promise<T> {
    const key = doi.toLowerCase();
    let pending = cache.get(key);
    if (!pending) {
      pending = lookup(key);
      cache.set(key, pending);
      pending.catch(() => cache.delete(key));
    }
    return pending;
  }

  return {
    getWork(doi: string): Promise<WorkLookup> {
      return cached(workCache, getWork, doi);
    },
    getAgency(doi: string): Promise<AgencyLookup> {
      return cached(agencyCache, getAgency, doi);
    },
    async search(bibliographic: string, rows = 3): Promise<CrossrefWork[]> {
      const url = `${searchEvidenceUrl(bibliographic, rows)}&select=${SEARCH_FIELDS}`;
      const response = await request(url);
      if (!response.ok) {
        throw new CrossrefError(`Crossref answered ${response.status}`, searchEvidenceUrl(bibliographic, rows));
      }
      const body = (await response.json()) as { message?: { items?: CrossrefWork[] } };
      return body.message?.items ?? [];
    },
  };
}

export function yearsOfWork(work: CrossrefWork): number[] {
  const years: number[] = [];
  for (const date of [work.issued, work.published, work['published-print'], work['published-online']]) {
    const year = date?.['date-parts']?.[0]?.[0];
    if (typeof year === 'number' && !years.includes(year)) {
      years.push(year);
    }
  }
  return years;
}

export function firstAuthorOfWork(work: CrossrefWork): string | undefined {
  const author = work.author?.find((candidate) => candidate.sequence === 'first') ?? work.author?.[0];
  return author?.family ?? author?.name;
}

export function titleOfWork(work: CrossrefWork): string {
  return work.title?.[0]?.replace(/\s+/g, ' ').trim() ?? '';
}
