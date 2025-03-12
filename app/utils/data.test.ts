import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkIsEmpty,
  checkIsFunction,
  checkIsPlainObject,
  convertMapToObject,
  convertObjectToMap,
  debounce,
  decodeBase64,
  encodeBase64,
  identity,
  makeObjectPropsJsonCompatible,
  omit,
  pick,
  shuffle,
  uniq,
  uniqBy,
  uniqWith,
  validateInstance,
} from './data';
import { convertTimestampToDate } from './date';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('encodeBase64()', () => {
  it('should work correctly', () => {
    expect(encodeBase64('')).toBe('');
    expect(encodeBase64('ấịơ')).toBe('4bql4buLxqE=');
    expect(encodeBase64('ab')).toBe('YWI=');
    expect(encodeBase64('abc')).toBe('YWJj');
    expect(encodeBase64('abcd')).toBe('YWJjZA==');
  });
});

describe('decodeBase64()', () => {
  it('should work correctly', () => {
    expect(decodeBase64('')).toBe('');
    expect(decodeBase64('4bql4buLxqE=')).toBe('ấịơ');
    expect(decodeBase64('YWI=')).toBe('ab');
    expect(decodeBase64('YWJj')).toBe('abc');
    expect(decodeBase64('YWJjZA==')).toBe('abcd');
  });
});

describe('convertObjectToMap()', () => {
  it('should throw exception when value is invalid', () => {
    // @ts-expect-error Testing invalid argument
    expect(() => convertObjectToMap(null)).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertObjectToMap(undefined)).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertObjectToMap('undefined')).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertObjectToMap('')).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertObjectToMap(11)).toThrow();
  });

  it('should return Map instance', () => {
    expect(convertObjectToMap({}) instanceof Map).toBe(true);
    expect(convertObjectToMap({})).toEqual(new Map());
  });

  it('should convert plain object to Map instance correctly', () => {
    expect(
      convertObjectToMap({
        a: 1,
        b: 'c',
        d: null,
        e: undefined,
        f: false,
      }),
    ).toEqual(
      new Map<string, any>([
        ['a', 1],
        ['b', 'c'],
        ['d', null],
        ['e', undefined],
        ['f', false],
      ]),
    );
  });
});

describe('convertMapToObject()', () => {
  it('should throw exception when value is invalid', () => {
    // @ts-expect-error Testing invalid argument
    expect(() => convertMapToObject(null)).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertMapToObject(undefined)).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertMapToObject('undefined')).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertMapToObject('')).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => convertMapToObject(11)).toThrow();
  });

  it('should return plain object instance', () => {
    expect(convertMapToObject(new Map()) instanceof Object).toBe(true);
    expect(checkIsPlainObject(convertMapToObject(new Map()))).toBe(true);
    expect(convertMapToObject(new Map())).toEqual({});
  });

  it('should convert Map instance to plain object correctly', () => {
    expect(
      convertMapToObject(
        new Map<string, any>([
          ['a', 1],
          ['b', 'c'],
          ['d', null],
          ['e', undefined],
          ['f', false],
        ]),
      ),
    ).toEqual({
      a: 1,
      b: 'c',
      d: null,
      e: undefined,
      f: false,
    });
  });
});

describe('checkIsPlainObject()', () => {
  it('should return true when value is plain object', () => {
    expect(checkIsPlainObject({})).toBe(true);
    expect(checkIsPlainObject(new Object())).toBe(true);
    expect(checkIsPlainObject(Object.create(null))).toBe(true);
  });

  it('should return false when value is not plain object ({})', () => {
    expect(checkIsPlainObject('')).toBe(false);
    expect(checkIsPlainObject('string')).toBe(false);
    expect(checkIsPlainObject(1)).toBe(false);
    expect(checkIsPlainObject(0)).toBe(false);
    expect(checkIsPlainObject(null)).toBe(false);
    expect(checkIsPlainObject(undefined)).toBe(false);
    expect(checkIsPlainObject(Object.create(Array))).toBe(false);
    expect(checkIsPlainObject(Object)).toBe(false);
    expect(checkIsPlainObject([])).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-array-constructor
    expect(checkIsPlainObject(new Array())).toBe(false);
    expect(checkIsPlainObject(new Map())).toBe(false);
  });
});

describe('checkIsEmpty()', () => {
  it('should return true when value is null or undefined', () => {
    expect(checkIsEmpty([])).toBe(true);
    expect(checkIsEmpty('')).toBe(true);
    expect(checkIsEmpty(null)).toBe(true);
    expect(checkIsEmpty(undefined)).toBe(true);
    // TODO expect(checkIsEmpty(Object.create(null))).toBe(true);
  });

  it('should return false when object has prototype properties but no own properties', () => {
    class Proto {}
    // Proto.prototype.prop = 'value';
    const obj = new Proto();
    expect(checkIsEmpty(obj)).toBe(false);
  });

  it('should return false for objects with non-enumerable properties', () => {
    const obj = Object.create(null);
    obj.nonEnumProp = 'value';
    expect(checkIsEmpty(obj)).toBe(false);
  });
});

describe('checkIsFunction()', () => {
  it('should return true when value is function/constructor/class', () => {
    expect(checkIsFunction(Object)).toBe(true);
  });

  it('should return false when value is NOT function/constructor/class', () => {
    expect(checkIsFunction('')).toBe(false);
    expect(checkIsFunction('string')).toBe(false);
    expect(checkIsFunction(1)).toBe(false);
    expect(checkIsFunction(0)).toBe(false);
    expect(checkIsFunction(null)).toBe(false);
    expect(checkIsFunction(undefined)).toBe(false);
    expect(checkIsFunction(Object.create(Array))).toBe(false);
    expect(checkIsFunction([])).toBe(false);
    expect(checkIsFunction([])).toBe(false);
    expect(checkIsFunction(new Map())).toBe(false);
  });
});

describe('pick()', () => {
  it('should work correctly', () => {
    expect(pick({ b: 1, a: 2 }, ['a'])).toStrictEqual({ a: 2 });
  });

  // TODO more tests for edge cases
});

describe('omit()', () => {
  it('should work correctly', () => {
    expect(omit({ b: 1, a: 2 }, ['a'])).toStrictEqual({ b: 1 });
  });

  // TODO more tests for edge cases
});

describe('uniq helpers', () => {
  let origArr: any[], uniqArr: any[];
  beforeEach(() => {
    origArr = [false, 1, false, true, 2, 1, '', 'true', null, {}];
    uniqArr = [false, 1, true, 2, '', 'true', null, {}];
  });

  describe('uniq()', () => {
    it('should work correctly', () => {
      expect(uniq(origArr)).toEqual(uniqArr);
    });

    // TODO more tests for edge cases
  });

  describe('uniqBy()', () => {
    it('should work correctly', () => {
      expect(uniqBy([], identity, Object.is)).toEqual([]);
      expect(uniqBy([1], identity, Object.is)).toEqual([1]);
      expect(uniqBy([1, 1], identity, Object.is)).toEqual([1]);
    });

    // TODO more tests for edge cases
  });

  describe('uniqWith()', () => {
    it('should work correctly', () => {
      expect(uniqWith(origArr, (a, b) => a === b)).toEqual(uniqArr);
    });

    // TODO more tests for edge cases
  });
});

describe('debounce()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should work correctly', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  // TODO test all available behavior options
});

describe('shuffle()', () => {
  it('should work correctly', () => {
    const origArr = [1, 'a', false];
    const shuffledArr = shuffle(origArr);
    origArr.forEach((item) => expect(shuffledArr).toContain(item)); // new array must contain all items of original array

    const atLeastOneItemIndexHasChanged = origArr.reduce<boolean>((acc, item, index) => {
      const itemIndexInShuffledArray = shuffledArr.findIndex((i) => i === item);
      if (itemIndexInShuffledArray === -1) throw new Error('item not found in shuffled array');
      return itemIndexInShuffledArray !== index || acc;
    }, false);
    expect(atLeastOneItemIndexHasChanged).toBe(true); // index of items in original array must be different
    expect(shuffledArr.length).toBe(origArr.length);
  });

  it('should work correctly with object-like items', () => {
    const origArr = [{ order: 1 }, new Set([1, 2, 3]), new Date('2020-01-01')];
    const shuffledArr = shuffle(origArr);
    origArr.forEach((item) => expect(shuffledArr).toContain(item)); // new array must contain all items of original array

    const atLeastOneItemIndexHasChanged = origArr.reduce<boolean>((acc, item, index) => {
      const itemIndexInShuffledArray = shuffledArr.findIndex((i) => i === item);
      if (itemIndexInShuffledArray === -1) throw new Error('item not found in shuffled array');
      return itemIndexInShuffledArray !== index || acc;
    }, false);
    expect(atLeastOneItemIndexHasChanged).toBe(true); // index of items in original array must be different
    expect(shuffledArr.length).toBe(origArr.length);
  });

  // TODO more tests for edge cases
});

//   it('check true positive cases:', () => {
//     expect(
//       hasDuplicatedObjects([
//         { a: 2, x: 'y' },
//         { x: 'y', a: 2 },
//       ]),
//     ).toBe(true);
//     expect(hasDuplicatedObjects([{ a: 2, x: 'y' }, { a: 2 }, { x: 'y', a: 2 }])).toBe(true);
//   });

//   it('check special cases', () => {
//     expect(hasDuplicatedObjects([])).toBe(false);
//     expect(hasDuplicatedObjects([{ a: 2 }])).toBe(false);
//   });
// });

describe('validateInstance()', () => {
  it('should NOT throw error if an object is an instance of a class', () => {
    class A {}
    class B extends Array {}
    const a = new A();
    const b = new B();
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance({}, Object)).not.toThrow();
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance([], Array)).not.toThrow();
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance(/a/, RegExp)).not.toThrow();
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance(a, A)).not.toThrow();
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance(a, Object)).not.toThrow();
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance(b, Array)).not.toThrow();
  });

  it('should throw error if an object is NOT an instance of a class', () => {
    class A {}
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance({}, A)).toThrow();
    // @ts-expect-error intentionally passing invalid arg type
    expect(() => validateInstance(new A(), Array)).toThrow();
  });
});

describe(makeObjectPropsJsonCompatible.name, () => {
  it('should convert object with `Date` value to a timestamp to be JSON compatible', () => {
    const timestamp = 1609459200; // 2021-01-01T00:00:00.000Z
    const date = convertTimestampToDate(timestamp);
    const dateProps = makeObjectPropsJsonCompatible({ date });
    expect(dateProps?.date).toBe(timestamp);
  });
});
