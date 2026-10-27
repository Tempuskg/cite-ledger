import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { describe, test } from 'node:test';
import { main, type CliDeps } from '../src/cli';
import { POLAR_BENEFIT_ID, POLAR_ORGANIZATION_ID, validateLicenseKey } from '../src/core/license';
import { isAllowed } from '../src/core/pro';
import { FILES, ROOT, fixtureFetch, polarResponder, type RecordedRequest } from './helpers';

const BENEFIT = 'test-benefit-0000';

function cli(recorded: RecordedRequest[], polar?: { status: number; body?: unknown }): { deps: CliDeps; out: string[] } {
  const out: string[] = [];
  return {
    out,
    deps: {
      fetch: fixtureFetch(recorded, polar ? polarResponder(polar) : undefined),
      env: {},
      stdout: (text) => out.push(text),
      stderr: (text) => out.push(text),
      crossrefMinIntervalMs: 0,
      polarBenefitId: BENEFIT,
      now: () => new Date('2026-10-19T12:00:00Z'),
    },
  };
}

const granted = { status: 200, body: { status: 'granted', benefit_id: BENEFIT } };

describe('free tier', () => {
  test('single-file checks, including retraction flags, are free and exit 0', async () => {
    assert.equal(isAllowed('single-file-check', false), true);
    const recorded: RecordedRequest[] = [];
    const { deps, out } = cli(recorded);
    const code = await main(['check', path.join(FILES, 'claims.bib')], deps);
    assert.equal(code, 0);
    assert.match(out.join(''), /\[P2 retraction\] Retraction recorded in Crossref/);
    assert.doesNotMatch(out.join(''), /Closest match/);
    assert.ok(recorded.every((request) => new URL(request.url).hostname === 'api.crossref.org'));
  });

  for (const [name, args, pattern] of [
    ['workspace scan', ['check', FILES], /workspace scan\) needs a Cite Ledger Pro licence/],
    ['two files', ['check', path.join(FILES, 'claims.bib'), path.join(FILES, 'claims.md')], /workspace scan\) needs a Cite Ledger Pro licence/],
    ['CLI/CI exit codes', ['check', path.join(FILES, 'claims.bib'), '--fail-on', 'retraction'], /CLI\/CI exit codes needs a Cite Ledger Pro licence/],
    ['exportable report', ['check', path.join(FILES, 'claims.bib'), '--report', 'out.md'], /Exportable Markdown, CSV or JSON report needs a Cite Ledger Pro licence/],
  ] as const) {
    test(`Pro feature without a licence is refused: ${name}`, async () => {
      const recorded: RecordedRequest[] = [];
      const { deps, out } = cli(recorded);
      const code = await main([...args], deps);
      assert.equal(code, 2);
      assert.match(out.join(''), pattern);
      assert.match(out.join(''), /Single-file checks, including retraction flags, are free/);
      assert.equal(recorded.length, 0, 'nothing is looked up');
    });
  }
});

describe('Pro with a Polar licence key', () => {
  test('unlocks workspace scan, exit codes, export and closest match', async () => {
    const recorded: RecordedRequest[] = [];
    const { deps, out } = cli(recorded, granted);
    const dir = mkdtempSync(path.join(tmpdir(), 'cite-ledger-'));
    const report = path.join(dir, 'report.csv');
    const code = await main(['check', FILES, '--license-key', 'KEY-123', '--fail-on', 'retraction', '--report', report], deps);
    assert.equal(code, 1, 'exit 1: a retraction was found');
    const text = out.join('');
    assert.match(text, /Checked \d+ references in 4 file\(s\)/);
    assert.match(text, /Closest match: /);
    const csv = readFileSync(report, 'utf8');
    assert.match(csv, /^file,line,entry,kind,claim,severity,message,evidence,could_be_wrong,limits\r\n/);
    assert.match(csv, /https:\/\/doi\.org\/10\.1016\/s0140-6736\(10\)60175-4/);
  });

  test('--fail-on exits 0 when no finding of that kind exists', async () => {
    const { deps } = cli([], granted);
    assert.equal(await main(['check', path.join(FILES, 'claims.bib'), '--license-key', 'KEY-123', '--fail-on', 'lookup-failed'], deps), 0);
  });

  test('licence validation sends only the key and public identifiers, with no secret', async () => {
    const recorded: RecordedRequest[] = [];
    const { deps } = cli(recorded, granted);
    await main(['check', path.join(FILES, 'claims.bib'), '--license-key', 'KEY-123', '--fail-on', 'retraction'], deps);
    const polar = recorded.filter((request) => new URL(request.url).hostname === 'api.polar.sh');
    assert.equal(polar.length, 1);
    assert.equal(polar[0].url, 'https://api.polar.sh/v1/customer-portal/license-keys/validate');
    assert.equal(polar[0].method, 'POST');
    assert.deepEqual(Object.keys(polar[0].headers).map((key) => key.toLowerCase()), ['content-type']);
    assert.deepEqual(JSON.parse(polar[0].body ?? '{}'), { key: 'KEY-123', organization_id: POLAR_ORGANIZATION_ID, benefit_id: BENEFIT });
  });

  test('a key for another product, a revoked key or an unknown key is refused', async () => {
    for (const answer of [
      { status: 200, body: { status: 'granted', benefit_id: 'some-other-benefit' } },
      { status: 200, body: { status: 'revoked', benefit_id: BENEFIT } },
      { status: 404, body: { detail: 'Not found' } },
    ]) {
      const { deps, out } = cli([], answer);
      assert.equal(await main(['check', FILES, '--license-key', 'KEY-123'], deps), 2);
      assert.match(out.join(''), /Licence not accepted/);
    }
  });

  test('Pro fails closed while no Polar benefit is configured, without contacting Polar', async () => {
    const calls: string[] = [];
    const result = await validateLicenseKey('KEY-123', { fetch: async (input) => { calls.push(input); return new Response('{}'); }, benefitId: '' });
    assert.equal(result.valid, false);
    assert.deepEqual(calls, []);
  });
});

describe('no secret in the client', () => {
  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      return statSync(full).isDirectory() ? sourceFiles(full) : full.endsWith('.ts') ? [full] : [];
    });
  }

  test('the source holds no access token, bearer header or API key', () => {
    for (const file of sourceFiles(path.join(ROOT, 'src'))) {
      const text = readFileSync(file, 'utf8');
      assert.doesNotMatch(text, /polar_(?:oat|pat|at|sk|whs)_[A-Za-z0-9]/, file);
      assert.doesNotMatch(text, /Authorization|Bearer /, file);
    }
  });

  test('only crossref.ts and license.ts make network calls', () => {
    const callers = sourceFiles(path.join(ROOT, 'src'))
      .filter((file) => /\bfetch\(|https?\.request\(|\bnet\.connect\(/.test(readFileSync(file, 'utf8')))
      .map((file) => path.basename(file))
      .sort();
    assert.deepEqual(callers, ['crossref.ts', 'license.ts']);
  });

  test('the published benefit id is a public identifier or empty', () => {
    assert.match(POLAR_BENEFIT_ID, /^$|^[0-9a-f-]{36}$/);
  });
});
