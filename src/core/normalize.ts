// Crossref's recommended DOI body class stops before Markdown and URL syntax such as ], *, " and ”.
// See https://www.crossref.org/blog/dois-and-matching-regular-expressions/
const DOI_BODY = '[-._;()/:A-Z0-9]+';
const DOI_PATTERN = new RegExp(`\\b10\\.\\d{4,9}/${DOI_BODY}`, 'gi');
const DOI_AT_START = new RegExp(`^10\\.\\d{4,9}/${DOI_BODY}`, 'i');
const DOI_PREFIX = /^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i;

const STOP_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'with']);

function count(text: string, ch: string): number {
  let n = 0;
  for (const c of text) {
    if (c === ch) {
      n++;
    }
  }
  return n;
}

/** Strips punctuation and path suffixes a DOI picks up from surrounding Markdown or URLs, keeping balanced brackets such as "(97)". */
function trimDoi(raw: string): string {
  let doi = raw;
  for (;;) {
    const before = doi;
    // Badge image and PDF path endings that the DOI body class still accepts as letters and dots.
    // Run these after each punctuation trim: a badge match often ends "...svg)" with an unbalanced ")".
    doi = doi.replace(/\/status\.svg$/i, '');
    doi = doi.replace(/\.svg$/i, '');
    doi = doi.replace(/\.pdf$/i, '');
    // bioRxiv/medRxiv content URLs glue "vN" (and sometimes ".article-metrics") onto the DOI with no separator.
    // Versioned DataCite DOIs keep a dotted ".vN" (figshare, Preprints.org), which this pattern leaves alone.
    doi = doi.replace(/(?<=\d)v\d+(?:\.[a-z][\w-]*)?$/i, '');
    const last = doi.slice(-1);
    if ('.,;:'.includes(last) && last !== '') {
      doi = doi.slice(0, -1);
    } else if (last === '_' && !/[a-z0-9]/i.test(doi.at(-2) ?? '')) {
      // "_" is legal in a DOI, but Markdown emphasis such as ")_**" leaves a lone "_" after "*" is cut.
      doi = doi.slice(0, -1);
    } else if (last === ')' && count(doi, '(') < count(doi, ')')) {
      doi = doi.slice(0, -1);
    } else if (last === ']' && count(doi, '[') < count(doi, ']')) {
      doi = doi.slice(0, -1);
    } else if (last === '}' && count(doi, '{') < count(doi, '}')) {
      doi = doi.slice(0, -1);
    }
    if (doi === before) {
      return doi;
    }
  }
}

/** Lower-cased DOI without resolver prefix, or undefined when the text holds no DOI. */
export function normalizeDoi(text: string): string | undefined {
  let candidate = text.trim().replace(DOI_PREFIX, '');
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    // Keep the undecoded text; a malformed escape is not a reason to drop the DOI.
  }
  const match = candidate.match(DOI_AT_START);
  return match ? trimDoi(match[0]).toLowerCase() : undefined;
}

export function extractDois(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(DOI_PATTERN)) {
    const doi = trimDoi(match[0]).toLowerCase();
    if (!found.includes(doi)) {
      found.push(doi);
    }
  }
  return found;
}

/** An arXiv identifier written as `arXiv:NNNN.NNNNN` (version dropped), or undefined. A passing mention of arXiv is not one. */
export function arxivIdIn(text: string): string | undefined {
  const match = /\barXiv:\s*(\d{4}\.\d{4,5})(?:v\d+)?(?!\d|\.\d)/i.exec(text);
  return match ? match[1] : undefined;
}

/** Content of a balanced `{...}` group starting at `open`, or undefined when braces are missing or unbalanced. */
function bracedGroup(text: string, open: number): { content: string; end: number } | undefined {
  if (text[open] !== '{') {
    return undefined;
  }
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) {
        return { content: text.slice(open + 1, i), end: i + 1 };
      }
    }
  }
  return undefined;
}

/**
 * Natbib-style `.bst` output wraps each field as `\bibinfo{author}{Surname, A.}`.
 * Keeping the field name would glue it to the value (`authorSurname`), which breaks Crossref matching.
 */
function keepBibinfoValues(text: string): string {
  const command = /\\bibinfo(?![a-zA-Z])/g;
  let out = '';
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = command.exec(text)) !== null) {
    out += text.slice(last, match.index);
    let i = match.index + match[0].length;
    while (/\s/.test(text[i] ?? '')) {
      i++;
    }
    const field = bracedGroup(text, i);
    if (!field) {
      out += match[0];
      last = match.index + match[0].length;
      continue;
    }
    i = field.end;
    while (/\s/.test(text[i] ?? '')) {
      i++;
    }
    const value = bracedGroup(text, i);
    if (!value) {
      out += match[0];
      last = match.index + match[0].length;
      continue;
    }
    out += value.content;
    last = value.end;
    command.lastIndex = last;
  }
  return out + text.slice(last);
}

/** Removes LaTeX markup that affects comparison: accents, commands, braces and ties. */
export function latexToPlain(text: string): string {
  return keepBibinfoValues(text)
    .replace(/\\[`'^"~=.]\s*\{?\\?([a-zA-Z])\}?/g, '$1')
    .replace(/\\[uvHtcdbk](?![a-zA-Z])\s*\{?\\?([a-zA-Z])\}?/g, '$1')
    .replace(/\\(?:ss)\b/g, 'ss')
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/~/g, ' ')
    .replace(/--+/g, '-');
}

export function normalizeText(text: string): string {
  return latexToPlain(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokens(text: string): string[] {
  return normalizeText(text).split(' ').filter((token) => token !== '' && !STOP_WORDS.has(token));
}

/** Crossref titles of updated works can carry a prefix such as "RETRACTED: ". */
export function stripUpdatePrefix(title: string): string {
  return title.replace(/^\s*(?:retracted|withdrawn|removed|retraction)(?:\s+article)?\s*[:.\-–]\s*/i, '');
}

/** Dice coefficient over distinct title tokens. */
export function titleSimilarity(a: string, b: string): number {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (left.size === 0 || right.size === 0) {
    return 0;
  }
  let shared = 0;
  for (const token of left) {
    if (right.has(token)) {
      shared++;
    }
  }
  return (2 * shared) / (left.size + right.size);
}

/** Share of the needle's distinct tokens that appear in the haystack. */
export function coverage(needle: string, haystack: string): number {
  const wanted = new Set(tokens(needle));
  if (wanted.size === 0) {
    return 0;
  }
  const present = new Set(tokens(haystack));
  let hits = 0;
  for (const token of wanted) {
    if (present.has(token)) {
      hits++;
    }
  }
  return hits / wanted.size;
}

/** Family name of the first author in a BibTeX author field ("Last, First and ..." or "First Last and ..."). */
export function firstAuthorFamily(authorField: string): string | undefined {
  const first = authorField.split(/\s+and\s+/i)[0]?.trim();
  if (!first) {
    return undefined;
  }
  if (/^\{.*\}$/.test(first)) {
    return latexToPlain(first).trim() || undefined;
  }
  if (first.includes(',')) {
    return latexToPlain(first.split(',')[0]).trim() || undefined;
  }
  const parts = latexToPlain(first).trim().split(/\s+/);
  return parts[parts.length - 1] || undefined;
}

export function sameFamilyName(a: string, b: string): boolean {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (left === '' || right === '') {
    return false;
  }
  return left === right || left.split(' ').includes(right) || right.split(' ').includes(left);
}

export function yearsIn(text: string): number[] {
  const years: number[] = [];
  for (const match of text.matchAll(/(?<![\d./])(1[5-9]\d\d|20\d\d)(?![\d/])/g)) {
    const year = Number(match[1]);
    if (!years.includes(year)) {
      years.push(year);
    }
  }
  return years;
}

/**
 * Removes http(s) URLs and DOI tokens from comparison/query text.
 * Stops at whitespace and at HTML/Markdown delimiters (`"`, `'`, `<`, `>`) so a URL in
 * `<a href="https://...">Author</a>` does not swallow the anchor text that follows.
 */
export function stripUrls(text: string): string {
  return text.replace(/https?:\/\/[^\s<>"']+/g, ' ').replace(DOI_PATTERN, ' ').replace(/\bdoi:\s*/gi, ' ');
}
