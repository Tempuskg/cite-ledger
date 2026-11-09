import { arxivIdIn, extractDois, stripUrls, yearsIn } from './normalize';
import type { ParseResult, ReferenceEntry } from './types';

const REFERENCE_HEADING = /^(#{1,6})\s*(?:references|bibliography|works cited|sources|citations|literature cited|reference list)\b/i;
const ITEM_START = /^\s{0,3}(?:[-*+]|\d+[.)]|\[\d+\]|\[\^[^\]]+\]:)\s+/;
const TABLE_ROW = /^\s{0,3}\|/;
const TABLE_SEPARATOR = /^\s{0,3}\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;
/** CommonMark link reference definition whose destination is an http(s) URL — not a citation. */
const LINK_REFERENCE_DEFINITION = /^\s{0,3}\[[^\]\n]+\]:\s*<?https?:\/\//i;
/** Pipeline / howto steps that sometimes sit under a heading that starts with "References". */
const IMPERATIVE_STEP = /^(?:create|build|download|run|align|merge|optional|post-processing|install|clone|configure|deploy|generate|prepare|fetch|load|save|enable|disable|start|stop|set up|copy|check out|write|add|remove|update)\b/i;

function plain(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, '$1 $2')
    .replace(/[*_`]+/g, '')
    .replace(ITEM_START, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Block {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

function isLinkReferenceDefinition(line: string): boolean {
  return LINK_REFERENCE_DEFINITION.test(line);
}

/** Skip reasons for Markdown items that are not bibliographic references. */
function markdownSkipReason(raw: string, query: string, doi: string | undefined): string | undefined {
  if (doi) {
    return undefined;
  }
  if (query.split(/\s+/).filter(Boolean).length < 3) {
    return 'No DOI and too little text to look up.';
  }
  if (IMPERATIVE_STEP.test(query) && yearsIn(query).length === 0) {
    return 'Step or instruction, not a bibliographic reference.';
  }
  if (isLinkOnly(raw, query)) {
    return 'Link with no bibliographic text.';
  }
  return undefined;
}

/** A URL (or Markdown link) plus a short non-bibliographic label — not a work to look up. */
function isLinkOnly(raw: string, query: string): boolean {
  if (yearsIn(query).length > 0) {
    return false;
  }
  if (/\bet\s+al\.?\b/i.test(query)) {
    return false;
  }
  // "Surname, I." author pattern common in reference lists.
  if (/\b[A-Z][A-Za-z'’-]+,\s+[A-Z]/u.test(query)) {
    return false;
  }
  // "Name. Title words..." shape.
  if (/[A-Za-z]\.\s+[A-Z]/.test(query) && query.split(/\s+/).filter(Boolean).length >= 4) {
    return false;
  }
  const hadUrl = /https?:\/\//i.test(raw) || /\bdoi:\s*10\./i.test(raw);
  if (!hadUrl) {
    return false;
  }
  return query.split(/\s+/).filter(Boolean).length <= 6;
}

function referenceBlocks(lines: readonly string[], from: number, to: number): Block[] {
  const blocks: Block[] = [];
  const hasItems = lines.slice(from, to).some((line) => ITEM_START.test(line));
  let current: { start: number; end: number; parts: string[] } | undefined;
  const flush = () => {
    if (current) {
      blocks.push({ start: current.start, end: current.end, text: current.parts.join(' ') });
      current = undefined;
    }
  };
  for (let i = from; i < to; i++) {
    const line = lines[i];
    // Link reference definitions are Markdown syntax, not citations; never merge them into the item above.
    if (isLinkReferenceDefinition(line)) {
      continue;
    }
    if (TABLE_ROW.test(line)) {
      // Each table row is one reference; the header row (followed by a separator) and the separator are not.
      flush();
      const header = i + 1 < to && TABLE_SEPARATOR.test(lines[i + 1]);
      if (!header && !TABLE_SEPARATOR.test(line)) {
        blocks.push({ start: i, end: i, text: line.replace(/\|/g, ' ') });
      }
      continue;
    }
    if (line.trim() === '') {
      if (!hasItems) {
        flush();
      }
      continue;
    }
    if (hasItems && ITEM_START.test(line)) {
      flush();
      current = { start: i, end: i, parts: [line] };
    } else if (current) {
      current.end = i;
      current.parts.push(line);
    } else if (!hasItems) {
      current = { start: i, end: i, parts: [line] };
    }
  }
  flush();
  return blocks;
}

export function parseMarkdown(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const inCode: boolean[] = [];
  let fence: string | undefined;
  for (const line of lines) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fence === undefined && marker) {
      fence = marker[1][0];
      inCode.push(true);
    } else if (fence !== undefined) {
      inCode.push(true);
      if (marker && marker[1][0] === fence) {
        fence = undefined;
      }
    } else {
      inCode.push(false);
    }
  }

  const entries: ReferenceEntry[] = [];
  const notes: string[] = [];
  const covered = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const heading = inCode[i] ? null : REFERENCE_HEADING.exec(lines[i]);
    if (!heading) {
      continue;
    }
    const level = heading[1].length;
    let end = i + 1;
    while (end < lines.length && !(inCode[end] === false && new RegExp(`^#{1,${level}}\\s`).test(lines[end]))) {
      end++;
    }
    // Mark link reference definitions in this section so the prose DOI scan does not treat them as citations.
    for (let line = i + 1; line < end; line++) {
      if (!inCode[line] && isLinkReferenceDefinition(lines[line])) {
        covered.add(line);
      }
    }
    for (const block of referenceBlocks(lines, i + 1, end)) {
      if (inCode[block.start]) {
        continue;
      }
      const raw = plain(block.text);
      const [doi, ...others] = extractDois(block.text);
      const arxivId = arxivIdIn(raw);
      const query = stripUrls(raw).replace(/\s+/g, ' ').trim();
      const skipReason = markdownSkipReason(raw, query, doi);
      entries.push({
        id: `line ${block.start + 1}`,
        kind: 'markdown',
        startLine: block.start,
        endLine: block.end,
        ...(doi ? { doi } : {}),
        queryText: query,
        rawText: raw,
        structured: false,
        inReferenceList: true,
        ...(arxivId ? { arxivId } : {}),
        ...(skipReason ? { skipReason } : {}),
      });
      for (let line = block.start; line <= block.end; line++) {
        covered.add(line);
      }
      // The block text belongs to its first DOI, so further DOIs are checked on their own (P1 and P2 only).
      for (const other of others) {
        const index = lines.findIndex((line, n) => n >= block.start && n <= block.end && extractDois(line).includes(other));
        const at = index >= 0 ? index : block.start;
        entries.push({
          id: `line ${at + 1}`,
          kind: 'markdown',
          startLine: at,
          endLine: at,
          doi: other,
          queryText: '',
          rawText: plain(lines[at]),
          structured: false,
          inReferenceList: false,
        });
      }
      if (others.length > 0) {
        notes.push(`The reference at line ${block.start + 1} holds ${others.length + 1} DOIs. Each is checked, but only the first is compared with the reference text.`);
      }
    }
    i = end - 1;
  }

  const seen = new Set(entries.map((entry) => entry.doi).filter((doi): doi is string => doi !== undefined));
  lines.forEach((line, index) => {
    if (inCode[index] || covered.has(index) || isLinkReferenceDefinition(line)) {
      return;
    }
    for (const doi of extractDois(line)) {
      if (seen.has(doi)) {
        continue;
      }
      seen.add(doi);
      entries.push({
        id: `line ${index + 1}`,
        kind: 'markdown',
        startLine: index,
        endLine: index,
        doi,
        queryText: '',
        rawText: plain(line),
        structured: false,
        inReferenceList: false,
      });
    }
  });

  const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const bibliography = frontMatter ? /^bibliography:\s*(.+)$/m.exec(frontMatter[1]) : null;
  if (bibliography) {
    notes.push(`References for this file are in ${bibliography[1].trim()}. Open it and check it there.`);
  }

  entries.sort((a, b) => a.startLine - b.startLine);
  return { entries, notes };
}
