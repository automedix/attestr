import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools/pure';

export function createKeypair() {
  const sk = generateSecretKey();
  return { sk, pk: getPublicKey(sk) };
}

export function makeNip98Header(method: string, url: string, sk: Uint8Array): string {
  const event = finalizeEvent(
    {
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['u', url],
        ['method', method],
      ],
      content: '',
    },
    sk
  );
  return `Nostr ${btoa(JSON.stringify(event))}`;
}
