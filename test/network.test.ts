import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import * as path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { main } from '../src/cli';
import { checkText } from '../src/core/checker';
import { createCrossrefClient } from '../src/core/crossref';
import type { FileKind } from '../src/core/types';
import { FILES, fixtureFetch, fixtureFile, type RecordedRequest } from './helpers';

/**
 * P5: "Runs on your machine and sends only the reference details it looks up to Crossref."
 * These tests replace the process-wide network entry points, then run real checks with the
 * default (global) fetch, so any call the code makes is seen here.
 */
describe('P5 network', () => {
  const recorded: RecordedRequest[] = [];
  const blocked: string[] = [];
  const originalFetch = globalThis.fetch;
  const originalHttp = http.request;
  const originalHttps = https.request;

  before(() => {
    globalThis.fetch = fixtureFetch(recorded) as typeof globalThis.fetch;
    const block = (name: string) => ((...args: unknown[]) => {
      blocked.push(`${name} ${JSON.stringify(args[0])}`);
      throw new Error(`${name}.request is not allowed in this test`);
    }) as unknown as typeof http.request;
    http.request = block('http');
    https.request = block('https');
  });

  after(() => {
    globalThis.fetch = originalFetch;
    http.request = originalHttp;
    https.request = originalHttps;
  });

  test('P5: checking every fixture file calls only api.crossref.org and sends no prose', async () => {
    recorded.length = 0;
    const crossref = createCrossrefClient({ minIntervalMs: 0, mailto: 'reader@example.org' });
    const files: [string, FileKind][] = [['claims.bib', 'bibtex'], ['claims.tex', 'latex'], ['claims.md', 'markdown'], ['agency.bib', 'bibtex']];
    for (const [name, kind] of files) {
      await checkText(name, fixtureFile(name), kind, { crossref, pro: true });
    }
    assert.ok(recorded.length >= 8, `requests made: ${recorded.length}`);
    assert.deepEqual([...new Set(recorded.map((request) => new URL(request.url).hostname))], ['api.crossref.org']);
    assert.ok(recorded.every((request) => request.method === 'GET' && request.body === undefined));
    assert.ok(recorded.every((request) => !request.url.includes('SENTINEL')), 'prose outside reference lists is never sent');
    assert.ok(recorded.every((request) => new URL(request.url).searchParams.get('mailto') === 'reader@example.org'), 'polite-pool contact is the user\'s own');
    assert.deepEqual(blocked, []);
  });

  test('P5: a free CLI run calls only api.crossref.org and never contacts the licence server', async () => {
    recorded.length = 0;
    const output: string[] = [];
    const code = await main(['check', path.join(FILES, 'claims.md')], { env: {}, stdout: (text) => output.push(text), stderr: (text) => output.push(text), crossrefMinIntervalMs: 0 });
    assert.equal(code, 0);
    assert.ok(recorded.length > 0);
    assert.deepEqual([...new Set(recorded.map((request) => new URL(request.url).hostname))], ['api.crossref.org']);
    assert.deepEqual(blocked, []);
  });
});
