import { describe, expect, it } from 'vitest';
import { getQueryStringValue, joinPathWithParams, parseQueryString, stringifyQuery } from './url';

const sampleQueryString = '?a=1&b=C&d=3&d=4';
const sampleQueryObjectToBeStringified = Object.freeze({
  a: 1, // support number
  b: 'C', // support string
  d: [3, '4'], // support array of 2 types above
});
const sampleParsedQuery = Object.freeze({
  a: '1',
  b: 'C',
  d: ['3', '4'],
});

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
    expect(stringifyQuery(sampleQueryObjectToBeStringified)).toBe(sampleQueryString);
    expect(
      stringifyQuery(sampleQueryObjectToBeStringified, {
        appendQuestionMark: true,
      }),
    ).toBe(sampleQueryString);
  });

  it('should be able to omit question mark', () => {
    expect(stringifyQuery(sampleParsedQuery, { appendQuestionMark: false })).toBe(sampleQueryString.substring(1));
  });
});

describe('parseQueryString()', () => {
  it('should parse query string (w/ `?` prefixed) & return object', () => {
    expect(parseQueryString(sampleQueryString)).toMatchObject(sampleParsedQuery);
  });

  it('should parse query string (w/o `?` prefixed) & return object', () => {
    expect(parseQueryString(sampleQueryString.substring(1))).toMatchObject(sampleParsedQuery);
  });

  it('should parse query string (w/ or w/o `?` prefixed) with non-value key & return object', () => {
    expect(parseQueryString('a')).toMatchObject({ a: null });
    expect(parseQueryString('?a')).toMatchObject({ a: null });
  });

  it('should parse empty query string (w/ or w/o `?` prefixed) & return object', () => {
    let parsedQuery = parseQueryString('');
    runExpects(parsedQuery);

    parsedQuery = parseQueryString('?');
    runExpects(parsedQuery);

    function runExpects(parsedQuery: Record<string, any>): void {
      expect(parsedQuery).toMatchObject({});
      expect(Object.keys(parsedQuery).length).toBe(0);
    }
  });
});

describe('getQueryStringValue()', () => {
  it('should handle query string (w/ or w/o `?` prefixed)', () => {
    const testHandlingQueryString = (queryString: string): void => {
      let queryKey: 'a' | 'b' | 'd' = 'a'; // test with single-value key
      expect(getQueryStringValue(queryKey, queryString)).toBe(sampleParsedQuery[queryKey]);
      expect(getQueryStringValue(queryKey, queryString, { isSingle: false })).toBe(sampleParsedQuery[queryKey]);

      queryKey = 'd'; // test with multiple-values key
      expect(
        getQueryStringValue(queryKey, queryString, {
          isSingle: true,
        }),
      ).toBe(sampleParsedQuery[queryKey][0]);
      expect(
        getQueryStringValue(queryKey, queryString, {
          isSingle: false,
        }),
      ).toMatchObject(sampleParsedQuery[queryKey]);
    };
    testHandlingQueryString(sampleQueryString);
    testHandlingQueryString(sampleQueryString.substring(1));
  });

  it('should return single value BY DEFAULT', () => {
    const queryKey = 'd'; // test with multiple-values key
    expect(getQueryStringValue(queryKey, sampleQueryString)).toBe(sampleParsedQuery[queryKey][0]);
  });

  it('should return correct value if query key is duplicated in query string', () => {
    const queryKey: 'a' | 'b' | 'd' = 'd'; // test with multiple-values key
    expect(
      getQueryStringValue(queryKey, sampleQueryString, {
        isSingle: true,
      }),
    ).toBe(sampleParsedQuery[queryKey][0]);
    expect(
      getQueryStringValue(queryKey, sampleQueryString, {
        isSingle: false,
      }),
    ).toMatchObject(sampleParsedQuery[queryKey]);
  });

  it('should use return `null` when retrieving empty key (w/ or w/o `?` prefixed)', () => {
    const queryKey = '';
    expect(getQueryStringValue(queryKey, sampleQueryString)).toBe(null);
    expect(getQueryStringValue(queryKey, sampleQueryString.substring(1))).toBe(null);
    expect(
      getQueryStringValue(queryKey, sampleQueryString, {
        isSingle: false,
      }),
    ).toBe(null);
  });

  it('should use return `null` when parsing empty query string (w/ or w/o `?` prefixed)', () => {
    const queryKey = '';
    expect(getQueryStringValue(queryKey, '')).toBe(null);
    expect(getQueryStringValue(queryKey, '?')).toBe(null);
    expect(
      getQueryStringValue(queryKey, '', {
        isSingle: false,
      }),
    ).toBe(null);
  });
});
