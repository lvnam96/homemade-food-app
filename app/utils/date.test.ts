import { describe, expect, it } from 'vitest';
import { isValidDate, convertDateStringToTimestamp, convertDateToTimestamp, convertTimestampToDate } from './date';

describe('isValidDate()', () => {
  it('should return boolean', () => {
    expect(typeof isValidDate(new Date('2021-01-01T00:00'))).toBe('boolean');
    expect(typeof isValidDate(new Date('invalid datetime'))).toBe('boolean');
  });

  it('should return false when first argument is not instance of `Date` constructor', () => {
    expect(isValidDate(new Date('2021-01-01T00:00'))).toBe(true);
    expect(isValidDate(1)).toBe(false);
    expect(isValidDate(false)).toBe(false);
    expect(isValidDate('1')).toBe(false);
  });

  it('should return false when first argument is instance of `Date` constructor containing invalid datetime', () => {
    expect(isValidDate(new Date(''))).toBe(false);
    expect(isValidDate(new Date('abc'))).toBe(false);
  });

  it('should should return true when first argument is a valid datetime', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('1'))).toBe(true);
    expect(isValidDate(new Date(1))).toBe(true);
    expect(isValidDate(new Date('1/1/2021'))).toBe(true);
    expect(isValidDate(new Date('2021-01-01T00:00'))).toBe(true);
  });
});

describe('convertDateStringToTimestamp()', () => {
  const validDateString = '2021-01-01T00:00';
  const invalidDateString = '';

  it('should return number', () => {
    expect(typeof convertDateStringToTimestamp(validDateString) === 'number').toBeTruthy();
    expect(typeof convertDateStringToTimestamp('2021-01-01T00:01:02+02:00') === 'number').toBeTruthy();
    expect(typeof convertDateStringToTimestamp('2021-01-01') === 'number').toBeTruthy();
  });

  it('should throw exception if argument is not a valid datetime string', () => {
    expect(typeof convertDateStringToTimestamp(validDateString) === 'number').toBe(true);
    expect(() => convertDateStringToTimestamp(invalidDateString)).toThrow();
  });
});

describe('convertDateToTimestamp', () => {
  it('should convert a Date object to a timestamp', () => {
    const timestamp1 = convertDateToTimestamp(new Date('2021-01-01T00:00:00.000Z'));
    expect(timestamp1).toBe(1609459200);
  });

  it('should convert a Date object with milliseconds to a timestamp', () => {
    const timestamp1 = convertDateToTimestamp(new Date('2021-01-01T00:00:00.000Z'));
    const timestamp2 = convertDateToTimestamp(new Date('2021-01-01T00:00:00.123Z'));
    expect(timestamp1).toBe(timestamp2);
    expect(timestamp2).toBe(1609459200);
  });

  it('should throw an error if the argument is not a Date object', () => {
    // @ts-expect-error Testing invalid argument
    expect(() => convertDateToTimestamp('2021-01-01T00:00:00.000Z')).toThrowError();
  });
});

describe('convertTimestampToDate', () => {
  it('should convert a timestamp to a Date object', () => {
    const timestamp = 1609459200; // 2021-01-01T00:00:00.000Z
    const date = convertTimestampToDate(timestamp);
    expect(date instanceof Date).toBe(true);
    expect(date.getUTCFullYear()).toBe(2021);
    expect(date.getUTCMonth()).toBe(0);
    expect(date.getUTCDate()).toBe(1);
    expect(date.getUTCHours()).toBe(0);
  });

  it('should throw an error if the argument is not a number', () => {
    // @ts-expect-error Testing invalid argument
    expect(() => convertTimestampToDate('2021-01-01T00:00:00.000Z')).toThrowError();
  });
});
