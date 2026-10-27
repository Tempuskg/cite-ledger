import { arxivIdIn, extractDois, firstAuthorFamily, latexToPlain, normalizeDoi } from './normalize';
import type { ParseResult, ReferenceEntry } from './types';

/** Entry types that usually describe web pages or software: without a DOI they are not looked up. */
const WEB_TYPES = new Set(['online', 'www', 'webpage', 'electronic', 'software', 'manual']);
const SKIPPED_BLOCKS = new Set(['comment', 'preamble', 'string']);

export interface BibEntry {
  readonly type: string;
  readonly key: string;
  readonly fields: ReadonlyMap<string, string>;
  readonly start: number;
  readonly end: number;
}

class LineIndex {
  private readonly starts: number[] = [0];

  constructor(text: string) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        this.starts.push(i + 1);
      }
    }
  }

  lineOf(offset: number): number {
    let low = 0;
    let high = this.starts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (this.starts[mid] <= offset) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }
    return low;
  }
}

/** Returns the index just past the delimiter that closes the one at `open`, or -1. */
function closeBalanced(text: string, open: number, closer: string): number {
  const opener = text[open];
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '{' || (opener === '(' && c === '(')) {
      depth++;
    } else if (c === '}' || (opener === '(' && c === ')')) {
      depth--;
      if (depth === 0 && c === closer) {
        return i + 1;
      }
    }
  }
  return -1;
}

function readValue(body: string, start: number): { value: string; next: number } {
  let i = start;
  let value = '';
  for (;;) {
    while (i < body.length && /\s/.test(body[i])) {
      i++;
    }
    const c = body[i];
    if (c === '{') {
      const end = closeBalanced(body, i, '}');
      const stop = end === -1 ? body.length : end;
      value += body.slice(i + 1, Math.max(i + 1, stop - 1));
      i = stop;
    } else if (c === '"') {
      let depth = 0;
      let j = i + 1;
      for (; j < body.length; j++) {
        if (body[j] === '\\') {
          j++;
        } else if (body[j] === '{') {
          depth++;
        } else if (body[j] === '}') {
          depth--;
        } else if (body[j] === '"' && depth === 0) {
          break;
        }
      }
      value += body.slice(i + 1, j);
      i = j + 1;
    } else {
      const match = /^[^,#}\s)]+/.exec(body.slice(i));
      value += match ? match[0] : '';
      i += match ? match[0].length : 0;
    }
    while (i < body.length && /\s/.test(body[i])) {
      i++;
    }
    if (body[i] === '#') {
      i++;
      continue;
    }
    return { value: value.replace(/\s+/g, ' ').trim(), next: i };
  }
}

function parseFields(body: string): Map<string, string> {
  const fields = new Map<string, string>();
  let i = 0;
  while (i < body.length) {
    const match = /^[\s,]*([A-Za-z][\w:.+-]*)\s*=\s*/.exec(body.slice(i));
    if (!match) {
      break;
    }
    const { value, next } = readValue(body, i + match[0].length);
    fields.set(match[1].toLowerCase(), value);
    i = next;
  }
  return fields;
}

export function parseBibEntries(text: string): BibEntry[] {
  const entries: BibEntry[] = [];
  const header = /@\s*([A-Za-z]+)\s*([{(])/g;
  let match: RegExpExecArray | null;
  while ((match = header.exec(text)) !== null) {
    const type = match[1].toLowerCase();
    const openIndex = match.index + match[0].length - 1;
    const end = closeBalanced(text, openIndex, match[2] === '{' ? '}' : ')');
    const stop = end === -1 ? text.length : end;
    if (!SKIPPED_BLOCKS.has(type)) {
      const inner = text.slice(openIndex + 1, end === -1 ? text.length : end - 1);
      const comma = inner.indexOf(',');
      const key = (comma === -1 ? inner : inner.slice(0, comma)).trim();
      entries.push({
        type,
        key,
        fields: parseFields(comma === -1 ? '' : inner.slice(comma + 1)),
        start: match.index,
        end: stop,
      });
    }
    header.lastIndex = end === -1 ? openIndex + 1 : end;
  }
  return entries;
}

function yearOf(fields: ReadonlyMap<string, string>): number | undefined {
  const raw = fields.get('year') ?? fields.get('date') ?? '';
  const match = /(1[5-9]\d\d|20\d\d)/.exec(raw);
  return match ? Number(match[1]) : undefined;
}

function doiOf(fields: ReadonlyMap<string, string>): string | undefined {
  const field = fields.get('doi');
  if (field) {
    const doi = normalizeDoi(field);
    if (doi) {
      return doi;
    }
  }
  for (const name of ['url', 'eprint', 'note', 'howpublished']) {
    const value = fields.get(name);
    if (value && /doi/i.test(value)) {
      const [doi] = extractDois(value);
      if (doi) {
        return doi;
      }
    }
  }
  return undefined;
}

/** The arXiv identifier of an `eprint` with `archivePrefix` or `eprinttype` arXiv, or of `arXiv:NNNN.NNNNN` in `journal` or `note`. */
function arxivIdOf(fields: ReadonlyMap<string, string>): string | undefined {
  const prefix = (fields.get('archiveprefix') ?? fields.get('eprinttype') ?? '').trim().toLowerCase();
  const eprint = fields.get('eprint')?.trim().replace(/^arxiv:\s*/i, '').replace(/v\d+$/, '');
  if (prefix === 'arxiv' && eprint) {
    return eprint;
  }
  for (const name of ['journal', 'note']) {
    const id = arxivIdIn(fields.get(name) ?? '');
    if (id) {
      return id;
    }
  }
  return undefined;
}

export function parseBibtex(text: string): ParseResult {
  const lines = new LineIndex(text);
  const entries: ReferenceEntry[] = parseBibEntries(text).map((bib) => {
    const fields = bib.fields;
    const title = fields.get('title') ? latexToPlain(fields.get('title') as string).replace(/\s+/g, ' ').trim() : undefined;
    const author = fields.get('author') ?? fields.get('editor');
    const family = author ? firstAuthorFamily(author) : undefined;
    const year = yearOf(fields);
    const doi = doiOf(fields);
    const arxivId = arxivIdOf(fields);
    const venue = fields.get('journal') ?? fields.get('journaltitle') ?? fields.get('booktitle') ?? '';
    const queryText = latexToPlain([title, family, year, venue].filter((part) => part !== undefined && part !== '').join(' '))
      .replace(/\s+/g, ' ')
      .trim();
    const isWeb = WEB_TYPES.has(bib.type) || (bib.type === 'misc' && fields.has('url') && !venue);
    return {
      id: bib.key || `line ${lines.lineOf(bib.start) + 1}`,
      kind: 'bibtex' as const,
      startLine: lines.lineOf(bib.start),
      endLine: lines.lineOf(Math.max(bib.start, bib.end - 1)),
      ...(doi ? { doi } : {}),
      ...(title ? { title } : {}),
      ...(year ? { year } : {}),
      ...(family ? { firstAuthorFamily: family } : {}),
      queryText,
      rawText: queryText,
      structured: true,
      inReferenceList: true,
      ...(arxivId ? { arxivId } : {}),
      ...(!doi && isWeb ? { skipReason: 'Web page or software entry with no DOI; not looked up.' } : {}),
      ...(!doi && !isWeb && !title ? { skipReason: 'No DOI and no title to look up.' } : {}),
    };
  });
  return { entries, notes: [] };
}
