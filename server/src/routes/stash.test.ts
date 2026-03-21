/**
 * Tests for stash creation and retrieval routes.
 *
 * Run with: npm test --workspace=server
 */

// Set env before any db-dependent imports
if (!process.env.TOKEN_ENCRYPTION_KEY) {
  const { randomBytes } = await import('node:crypto');
  process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString('hex');
}
process.env.DB_PATH = ':memory:';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';

const db = (await import('../db/index.js')).default;
const { stashRoutes } = await import('./stash.js');
const { requireAuth } = await import('../middleware/auth.js');
const { createKeypair, makeNip98Header } = await import('../test/helpers.js');

type AuthVars = { authedPubkey: string };
const app = new Hono<{ Variables: AuthVars }>();
app.post('/api/stash', requireAuth);
app.route('/api/stash', stashRoutes);

const { sk, pk } = createKeypair();

function auth(method: string, path: string) {
  return makeNip98Header(method, `http://localhost${path}`, sk);
}

function validBody() {
  return {
    blobUrl: 'https://blossom.example.com/abc123',
    secretKey: 'test-secret-key-xyz',
    title: 'Test File',
    fileName: 'document.pdf',
    priceSats: 100,
    fileSize: 1024,
  };
}

async function createStash(body: Record<string, unknown> = validBody()) {
  return app.request('/api/stash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth('POST', '/api/stash'),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  db.exec('DELETE FROM payments');
  db.exec('DELETE FROM stashes');
});

describe('POST /api/stash', () => {
  it('requires auth', async () => {
    const res = await app.request('/api/stash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody()),
    });
    assert.equal(res.status, 401);
  });

  it('rejects missing required fields', async () => {
    const res = await createStash({ priceSats: 100 });
    assert.equal(res.status, 400);
  });

  it('rejects invalid blobUrl', async () => {
    const res = await createStash({ ...validBody(), blobUrl: 'not-a-url' });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /blobUrl/i);
  });

  it('rejects zero price', async () => {
    const res = await createStash({ ...validBody(), priceSats: 0 });
    assert.equal(res.status, 400);
  });

  it('rejects negative price', async () => {
    const res = await createStash({ ...validBody(), priceSats: -5 });
    assert.equal(res.status, 400);
  });

  it('rejects float price', async () => {
    const res = await createStash({ ...validBody(), priceSats: 10.5 });
    assert.equal(res.status, 400);
  });

  it('rejects title over 200 chars', async () => {
    const res = await createStash({ ...validBody(), title: 'x'.repeat(201) });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /title/i);
  });

  it('rejects description over 2000 chars', async () => {
    const res = await createStash({ ...validBody(), description: 'x'.repeat(2001) });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /description/i);
  });

  it('rejects file size over 100MB', async () => {
    const res = await createStash({ ...validBody(), fileSize: 100 * 1024 * 1024 + 1 });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /fileSize/i);
  });

  it('rejects zero file size', async () => {
    const res = await createStash({ ...validBody(), fileSize: 0 });
    assert.equal(res.status, 400);
  });

  it('creates stash with valid data', async () => {
    const res = await createStash();
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.id);
    assert.ok(body.data.shareUrl.startsWith('/s/'));
  });

  it('encrypts sensitive fields in DB', async () => {
    const input = validBody();
    const res = await createStash(input);
    const { data } = await res.json();

    const row = db.prepare('SELECT * FROM stashes WHERE id = ?').get(data.id) as Record<
      string,
      string
    >;
    assert.notEqual(row.title, input.title);
    assert.notEqual(row.secret_key, input.secretKey);
    assert.notEqual(row.file_name, input.fileName);
    assert.ok(row.title.includes(':'), 'encrypted format is nonce:ciphertext');
  });

  it('uses authed pubkey, ignores body pubkey', async () => {
    const res = await createStash({ ...validBody(), sellerPubkey: 'spoofed-pubkey' });
    const { data } = await res.json();

    const row = db.prepare('SELECT seller_pubkey FROM stashes WHERE id = ?').get(data.id) as {
      seller_pubkey: string;
    };
    assert.equal(row.seller_pubkey, pk);
  });
});

describe('GET /api/stash/:id', () => {
  it('returns 404 for non-existent stash', async () => {
    const res = await app.request('/api/stash/nonexistent');
    assert.equal(res.status, 404);
    assert.equal((await res.json()).success, false);
  });

  it('returns decrypted metadata', async () => {
    const input = validBody();
    const createRes = await createStash(input);
    const { data: created } = await createRes.json();

    const res = await app.request(`/api/stash/${created.id}`);
    assert.equal(res.status, 200);
    const { data } = await res.json();
    assert.equal(data.title, input.title);
    assert.equal(data.fileName, input.fileName);
    assert.equal(data.priceSats, input.priceSats);
    assert.equal(data.fileSize, input.fileSize);
  });

  it('omits description when not provided', async () => {
    const createRes = await createStash();
    const { data: created } = await createRes.json();

    const res = await app.request(`/api/stash/${created.id}`);
    const { data } = await res.json();
    assert.equal(data.description, undefined);
  });

  it('returns description when provided', async () => {
    const createRes = await createStash({ ...validBody(), description: 'A test description' });
    const { data: created } = await createRes.json();

    const res = await app.request(`/api/stash/${created.id}`);
    const { data } = await res.json();
    assert.equal(data.description, 'A test description');
  });
});
