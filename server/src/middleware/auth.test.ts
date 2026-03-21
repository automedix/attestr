/**
 * Tests for NIP-98 HTTP Auth middleware.
 *
 * Run with: npm test --workspace=server
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools/pure';
import { requireAuth, type AuthVariables } from './auth.js';

const app = new Hono<{ Variables: AuthVariables }>();
app.use('/test/*', requireAuth);
app.get('/test/resource', (c) => c.json({ pubkey: c.get('authedPubkey') }));
app.post('/test/resource', (c) => c.json({ pubkey: c.get('authedPubkey') }));

const sk = generateSecretKey();
const pk = getPublicKey(sk);
const TEST_URL = 'http://localhost/test/resource';

function signEvent(
  overrides: Partial<{ kind: number; created_at: number; tags: string[][]; content: string }> = {}
) {
  return finalizeEvent(
    {
      kind: overrides.kind ?? 27235,
      created_at: overrides.created_at ?? Math.floor(Date.now() / 1000),
      tags: overrides.tags ?? [
        ['u', TEST_URL],
        ['method', 'GET'],
      ],
      content: overrides.content ?? '',
    },
    sk
  );
}

function toAuthHeader(event: object): string {
  return `Nostr ${btoa(JSON.stringify(event))}`;
}

describe('NIP-98 auth middleware', () => {
  it('rejects missing auth header', async () => {
    const res = await app.request('/test/resource');
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /[Aa]uthorization required/);
  });

  it('rejects non-Nostr auth prefix', async () => {
    const res = await app.request('/test/resource', {
      headers: { Authorization: 'Bearer some-token' },
    });
    assert.equal(res.status, 401);
  });

  it('rejects invalid base64', async () => {
    const res = await app.request('/test/resource', {
      headers: { Authorization: 'Nostr !!!not-base64!!!' },
    });
    assert.equal(res.status, 401);
  });

  it('rejects wrong event kind', async () => {
    const event = signEvent({ kind: 1 });
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 401);
    assert.match((await res.json()).error, /kind/i);
  });

  it('rejects expired event (>60s old)', async () => {
    const event = signEvent({ created_at: Math.floor(Date.now() / 1000) - 120 });
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 401);
    assert.match((await res.json()).error, /expired/i);
  });

  it('rejects future event (>60s ahead)', async () => {
    const event = signEvent({ created_at: Math.floor(Date.now() / 1000) + 120 });
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 401);
    assert.match((await res.json()).error, /expired/i);
  });

  it('rejects URL path mismatch', async () => {
    const event = signEvent({
      tags: [
        ['u', 'http://localhost/wrong/path'],
        ['method', 'GET'],
      ],
    });
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 401);
    assert.match((await res.json()).error, /URL/i);
  });

  it('rejects missing URL tag', async () => {
    const event = signEvent({ tags: [['method', 'GET']] });
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 401);
    assert.match((await res.json()).error, /URL/i);
  });

  it('rejects method mismatch', async () => {
    const event = signEvent({
      tags: [
        ['u', TEST_URL],
        ['method', 'POST'],
      ],
    });
    const res = await app.request('/test/resource', {
      method: 'GET',
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 401);
    assert.match((await res.json()).error, /[Mm]ethod/);
  });

  it('rejects tampered signature', async () => {
    const event = signEvent();
    const tampered = { ...event, pubkey: '00'.repeat(32) };
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(tampered) },
    });
    assert.equal(res.status, 401);
  });

  it('accepts valid auth and sets pubkey', async () => {
    const event = signEvent();
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.pubkey, pk);
  });

  it('accepts valid POST auth', async () => {
    const event = signEvent({
      tags: [
        ['u', TEST_URL],
        ['method', 'POST'],
      ],
    });
    const res = await app.request('/test/resource', {
      method: 'POST',
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).pubkey, pk);
  });

  it('compares URL pathname only, ignores host (dev/prod flexibility)', async () => {
    const event = signEvent({
      tags: [
        ['u', 'https://stashu.tech/test/resource'],
        ['method', 'GET'],
      ],
    });
    const res = await app.request('/test/resource', {
      headers: { Authorization: toAuthHeader(event) },
    });
    assert.equal(res.status, 200);
  });
});
