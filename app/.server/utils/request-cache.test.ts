// implement tests for `getRequestCache` at `./request-cache.ts` using vitest

import { describe, expect, it } from 'vitest';
import { getRequestCache } from './request-cache';

describe('getRequestCache()', () => {
  it('should return a request cache object', () => {
    const cache = getRequestCache(new Request('http://example.com'));
    expect(cache).toBeTypeOf('object');
  });

  it('should be able to set & get values', () => {
    const cache = getRequestCache<{ foo: string }>(new Request('http://example.com'));
    cache.set('foo', 'bar');
    expect(cache.get('foo')).toBe('bar');
  });

  it('should be able to remove values', () => {
    const cache = getRequestCache<{ foo: string }>(new Request('http://example.com'));
    cache.set('foo', 'bar');
    cache.remove('foo');
    expect(cache.get('foo')).toBeUndefined();
  });

  it('should be able to clear values', () => {
    const cache = getRequestCache<{ foo: string; baz: number }>(new Request('http://example.com'));
    cache.set('foo', 'bar');
    cache.set('baz', 2);
    cache.clear();
    expect(cache.get('foo')).toBeUndefined();
    expect(cache.get('baz')).toBeUndefined();
  });

  it('should be able to check if a value exists', () => {
    const cache = getRequestCache<{ foo: string }>(new Request('http://example.com'));
    cache.set('foo', 'bar');
    expect(cache.has('foo')).toBe(true);
  });

  it('should be able to remove values', () => {
    const cache = getRequestCache<{ foo: string; baz: number }>(new Request('http://example.com'));
    cache.set('foo', 'bar');
    cache.set('baz', 2);
    cache.remove('foo');
    expect(cache.get('foo')).toBeUndefined();
    expect(cache.get('baz')).toBe(2);
  });
});
