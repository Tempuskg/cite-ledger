import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import type { Fetch } from '../src/core/crossref';

export const ROOT = path.resolve(__dirname, '..', '..');
export const FIXTURES = path.join(ROOT, 'test', 'fixtures');
export const FILES = path.join(FIXTURES, 'files');

export function fixtureFile(name: string): string {
  return readFileSync(path.join(FILES, name), 'utf8');
}

export interface RecordedRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

/** Answers Crossref requests from the recorded fixtures; any other host goes to `other` or fails. */
export function fixtureFetch(recorded: RecordedRequest[] = [], other?: (url: URL, body: string | undefined) => Response): Fetch {
  return async (input, init) => {
    const url = new URL(input);
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((value, key) => {
      headers[key] = value;
    });
    const body = typeof init?.body === 'string' ? init.body : undefined;
    recorded.push({ url: input, method: init?.method ?? 'GET', headers, ...(body !== undefined ? { body } : {}) });
    if (url.hostname !== 'api.crossref.org') {
      if (other) {
        return other(url, body);
      }
      throw new Error(`Unexpected host ${url.hostname}`);
    }
    const crossref = path.join(FIXTURES, 'crossref');
    if (url.pathname === '/works') {
      const query = (url.searchParams.get('query.bibliographic') ?? '').toLowerCase();
      const name = query.includes('deep learning') ? 'search-deep-learning.json' : 'search-no-match.json';
      return json(JSON.parse(readFileSync(path.join(crossref, name), 'utf8')));
    }
    const doi = decodeURIComponent(url.pathname.replace(/^\/works\//, '')).toLowerCase();
    const file = path.join(crossref, `work-${doi.replace('/', '_')}.json`);
    if (!existsSync(file)) {
      return new Response('Resource not found.', { status: 404 });
    }
    return json(JSON.parse(readFileSync(file, 'utf8')));
  };
}

export function polarResponder(answer: { status: number; body?: unknown }): (url: URL) => Response {
  return (url) => {
    if (url.hostname !== 'api.polar.sh') {
      throw new Error(`Unexpected host ${url.hostname}`);
    }
    return json(answer.body ?? {}, answer.status);
  };
}
