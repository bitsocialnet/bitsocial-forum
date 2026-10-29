import { describe, expect, it } from 'vitest';
import { getShortAddress, toCommunityIdentifier } from '../community-identifier';

describe('toCommunityIdentifier', () => {
  it('treats domains as names and everything else as public keys', () => {
    expect(toCommunityIdentifier('forum.bitsocial.bso')).toEqual({ name: 'forum.bitsocial.bso' });
    expect(toCommunityIdentifier('12D3KooWAbCdEfGhIjKlMnOpQrStUvWxYz')).toEqual({ publicKey: '12D3KooWAbCdEfGhIjKlMnOpQrStUvWxYz' });
  });
});

describe('getShortAddress', () => {
  it('keeps domains whole and shortens long keys', () => {
    expect(getShortAddress('forum.bitsocial.bso')).toBe('forum.bitsocial.bso');
    expect(getShortAddress('12D3KooWAbCdEfGhIjKlMnOpQrStUvWxYz')).toBe('12D3KooWAbCd…');
  });
});
