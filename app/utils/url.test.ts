// implement tests for URL utils at `./url`

import { describe, expect, it } from 'vitest';
import { joinPathWithParams, stringifyQuery } from './url';

describe('joinPathWithParams()', () => {
  it('should work correctly', () => {
    expect(joinPathWithParams('/foo', { bar: 'baz' })).toBe('/foo?bar=baz');
  });

  it('should return path with empty params', () => {
    expect(joinPathWithParams('/foo')).toBe('/foo');
  });

  it('should work correctly with empty path', () => {
    expect(joinPathWithParams('', { bar: 'baz' })).toBe('?bar=baz');
  });

  it('should throw exception when path is not a string', () => {
    // @ts-expect-error Testing invalid argument
    expect(() => joinPathWithParams()).toThrow();
  });
});

describe('stringifyQuery()', () => {
  it('should default to include question mark', () => {
    expect(stringifyQuery({ foo: 'bar', baz: 'qux' })).toBe('?foo=bar&baz=qux');
    expect(
      stringifyQuery(
        { foo: 'bar', baz: 'qux' },
        {
          appendQuestionMark: true,
        },
      ),
    ).toBe('?foo=bar&baz=qux');
  });

  it('should be able to omit question mark', () => {
    expect(stringifyQuery({ foo: 'bar', baz: '1' }, { appendQuestionMark: false })).toBe('foo=bar&baz=1');
  });
});
