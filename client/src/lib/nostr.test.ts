import { describe, expect, it } from 'vitest';
import { createBlossomAuthEvent, createBlossomMirrorAuthEvent } from './nostr.js';

describe('Blossom auth events', () => {
  it('creates upload auth events with the upload verb and blob hash scope', () => {
    const event = createBlossomAuthEvent('https://blossom.example.com/upload', 'a'.repeat(64));

    expect(event.kind).toBe(24242);
    expect(event.tags).toContainEqual(['t', 'upload']);
    expect(event.tags).toContainEqual(['x', 'a'.repeat(64)]);
  });

  it('creates mirror auth events with the upload verb per BUD-11', () => {
    const event = createBlossomMirrorAuthEvent(
      'https://blossom.example.com/mirror',
      'b'.repeat(64)
    );

    expect(event.kind).toBe(24242);
    expect(event.tags).toContainEqual(['t', 'upload']);
    expect(event.tags).toContainEqual(['x', 'b'.repeat(64)]);
  });
});
