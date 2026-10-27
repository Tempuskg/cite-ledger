import { arxivIdIn, extractDois, latexToPlain, stripUrls } from './normalize';
import type { ParseResult, ReferenceEntry } from './types';

function lineAt(text: string, offset: number): number {
  let line = 0;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
    }
  }
  return line;
}

/** Removes LaTeX comments, keeping escaped percent signs. Offsets are preserved by blanking. */
function blankComments(text: string): string {
  return text.replace(/(^|[^\\])%[^\n]*/g, (match, lead: string) => lead + ' '.repeat(match.length - lead.length));
}

export function parseLatex(text: string): ParseResult {
  const source = blankComments(text);
  const entries: ReferenceEntry[] = [];
  const notes: string[] = [];

  const environment = /\\begin\{thebibliography\}(?:\{[^}]*\})?([\s\S]*?)\\end\{thebibliography\}/g;
  let env: RegExpExecArray | null;
  while ((env = environment.exec(source)) !== null) {
    const bodyStart = env.index + env[0].indexOf(env[1]);
    const body = env[1];
    const items = [...body.matchAll(/\\bibitem\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}/g)];
    items.forEach((item, index) => {
      const start = bodyStart + (item.index ?? 0);
      const textStart = start + item[0].length;
      const end = index + 1 < items.length ? bodyStart + (items[index + 1].index ?? body.length) : bodyStart + body.length;
      const itemText = source.slice(textStart, end);
      const [doi] = extractDois(itemText);
      const plain = latexToPlain(itemText).replace(/\s+/g, ' ').trim();
      const arxivId = arxivIdIn(plain);
      const trimmedEnd = start + item[0].length + itemText.trimEnd().length;
      entries.push({
        id: item[1].trim() || `line ${lineAt(source, start) + 1}`,
        kind: 'latex',
        startLine: lineAt(source, start),
        endLine: lineAt(source, Math.max(start, trimmedEnd - 1)),
        ...(doi ? { doi } : {}),
        queryText: stripUrls(plain).replace(/\s+/g, ' ').trim(),
        rawText: plain,
        structured: false,
        inReferenceList: true,
        ...(arxivId ? { arxivId } : {}),
        ...(!doi && stripUrls(plain).trim() === '' ? { skipReason: 'Empty reference.' } : {}),
      });
    });
  }

  for (const match of source.matchAll(/\\(?:bibliography|addbibresource)\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}/g)) {
    for (const name of match[1].split(',').map((part) => part.trim()).filter(Boolean)) {
      const file = /\.bib$/i.test(name) ? name : `${name}.bib`;
      notes.push(`References for this file are in ${file}. Open ${file} and check it there.`);
    }
  }

  return { entries, notes };
}
