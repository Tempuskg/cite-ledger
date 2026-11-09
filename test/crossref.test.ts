import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createCrossrefClient, type Fetch } from '../src/core/crossref';

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('Crossref client rate limits', () => {
  test('retries repeated 429 answers that include Retry-After, then returns the work', async () => {
    const sleeps: number[] = [];
    let calls = 0;
    const fetch: Fetch = async () => {
      calls++;
      if (calls <= 3) {
        return json({ status: 'error' }, 429, { 'retry-after': String(calls) });
      }
      return json({
        status: 'ok',
        message: {
          DOI: '10.1038/nature14539',
          title: ['Deep learning'],
        },
      });
    };

    const crossref = createCrossrefClient({
      fetch,
      minIntervalMs: 0,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    });

    const result = await crossref.getWork('10.1038/nature14539');
    assert.equal(result.status, 'found');
    if (result.status === 'found') {
      assert.equal(result.work.DOI, '10.1038/nature14539');
    }
    assert.equal(calls, 4);
    assert.deepEqual(sleeps, [1000, 2000, 3000]);
  });

  test('without a mailto, defaults stay within the public pool (concurrency 1)', async () => {
    let peak = 0;
    let active = 0;
    const fetch: Fetch = async () => {
      active++;
      peak = Math.max(peak, active);
      active--;
      return json({
        status: 'ok',
        message: { DOI: '10.1038/nature14539', title: ['Deep learning'] },
      });
    };

    const crossref = createCrossrefClient({
      fetch,
      minIntervalMs: 0,
      sleep: async () => undefined,
    });

    await Promise.all([
      crossref.getWork('10.1038/nature14539'),
      crossref.getWork('10.1038/nature14539-b'),
      crossref.getWork('10.1038/nature14539-c'),
    ]);
    assert.equal(peak, 1);
  });
});
