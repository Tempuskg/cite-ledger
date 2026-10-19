const DOI_PATTERN = /\b10\.\d{4,9}\/[^\s"'<>]+/gi;
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

/** Strips punctuation a DOI picks up from surrounding text, keeping balanced brackets such as "(97)". */
function trimDoi(raw: string): string {
  let doi = raw;
  for (;;) {
    const last = doi.slice(-1);
    if ('.,;:'.includes(last) && last !== '') {
      doi = doi.slice(0, -1);
    } else if (last === ')' && count(doi, '(') < count(doi, ')')) {
      doi = doi.slice(0, -1);
    } else if (last === ']' && count(doi, '[') < count(doi, ']')) {
      doi = doi.slice(0, -1);
    } else if (last === '}' && count(doi, '{') < count(doi, '}')) {
      doi = doi.slice(0, -1);
    } else {
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
  const match = candidate.match(/^10\.\d{4,9}\/\S+/i);
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

/** Removes LaTeX markup that affects comparison: accents, commands, braces and ties. */
export function latexToPlain(text: string): string {
  return text
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

export function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/g, ' ').replace(DOI_PATTERN, ' ').replace(/\bdoi:\s*/gi, ' ');
}
