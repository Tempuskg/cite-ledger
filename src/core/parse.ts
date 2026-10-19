import { parseBibtex } from './bibtex';
import { parseLatex } from './latex';
import { parseMarkdown } from './markdown';
import type { FileKind, ParseResult } from './types';

export const SUPPORTED_EXTENSIONS = ['.bib', '.tex', '.ltx', '.md', '.markdown', '.qmd', '.rmd'] as const;

export function kindForFile(fileName: string): FileKind | undefined {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.bib')) {
    return 'bibtex';
  }
  if (lower.endsWith('.tex') || lower.endsWith('.ltx')) {
    return 'latex';
  }
  if (['.md', '.markdown', '.qmd', '.rmd'].some((extension) => lower.endsWith(extension))) {
    return 'markdown';
  }
  return undefined;
}

export function parseReferences(text: string, kind: FileKind): ParseResult {
  switch (kind) {
    case 'bibtex':
      return parseBibtex(text);
    case 'latex':
      return parseLatex(text);
    case 'markdown':
      return parseMarkdown(text);
  }
}
