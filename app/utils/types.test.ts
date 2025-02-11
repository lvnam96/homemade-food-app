/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'vitest';
import type {
  ArrayToTuple,
  Assert,
  DeepReadonly,
  JsonCompatible,
  PartialBy,
  ValueOf,
  ValueOfMapRecord,
  Writeable,
} from './types';

type TestObject = {
  a: number;
  b: string;
  c: boolean;
  d: Date;
  e: bigint;
};

interface TestInterface {
  a: number;
  b: string;
  c: boolean;
  d: Date;
  e: bigint;
}

describe('PartialBy', () => {
  it('', () => {
    // @ts-expect-error This assertion should pass
    const test1: Assert<
      PartialBy<TestObject, 'a' | 'c'>,
      {
        a?: number;
        b: string;
        c?: boolean;
      }
    > = true;
  });
});

describe('ValueOfMapRecord', () => {
  it('should work with Map', () => {
    type Val1 = string[];
    const test1: Assert<ValueOfMapRecord<Map<string, Val1>>, Val1> = true;
    const test2: Assert<ValueOfMapRecord<Map<string, Val1>>, any[], false> = false;

    type Val2 = { a: string; b: number };
    const test3: Assert<ValueOfMapRecord<Map<Val1, Val2>>, Val2> = true;
  });

  it('extract value of Set as `never`', () => {
    const test1: Assert<ValueOfMapRecord<Set<number>>, number, false> = false;
    const test2: Assert<ValueOfMapRecord<Set<number>>, never> = true;
  });
});

describe('ValueOf', () => {
  it('should work with Object', () => {
    const test1: Assert<ValueOf<TestObject>, number | string | boolean | Date | bigint> = true;
    const test2: Assert<ValueOf<TestObject>, number | string | boolean | Date, false> = false;
  });

  it('should not work with Set (not extract value of Set as `never` but something)', () => {
    const test1: Assert<ValueOf<Set<number>>, never, false> = false;
  });
});

describe('Writeable', () => {
  it('should work', () => {
    const test1: Assert<Writeable<Readonly<TestObject>>, TestObject> = true;
    const test2: Assert<Writeable<Readonly<TestInterface>>, TestInterface> = true;

    const test3: Assert<Writeable<Readonly<string[]>>, string[]> = true;
    const test4: Assert<Writeable<ReadonlyArray<string>>, string[]> = true;

    const test5: Assert<
      Writeable<{
        a: number;
        readonly b: string;
      }>,
      {
        a: number;
        b: string;
      }
    > = true;
  });
});

describe('DeepReadonly', () => {
  it('should work', () => {
    const test1: Assert<
      DeepReadonly<{
        a: number;
        b: {
          c: number;
        };
      }>,
      {
        readonly a: number;
        readonly b: {
          readonly c: number;
        };
      }
    > = true;

    const test2: Assert<
      DeepReadonly<{
        a: number;
        b: bigint;
        c: {
          d: string;
        };
        // FIXME: `Assert` cannot evaluate object types like `Date`, `Set`, `Map`
        // e: Set<string>;
        // f: Date;
      }>,
      {
        readonly a: number;
        readonly b: bigint;
        readonly c: {
          readonly d: string;
        };
        // readonly e: Set<string>;
        // readonly f: Date;
      }
    > = true;
  });
});

describe('ArrayToTuple', () => {
  it('should work with Array of string only', () => {
    const test1: Assert<ArrayToTuple<['a', 'b', 'c']>, 'a' | 'b' | 'c'> = true;
    const test2: Assert<ArrayToTuple<['a', 'b', 'c']>, 'a' | 'b', false> = false;
    const test3: Assert<ArrayToTuple<['a', 'b']>, 'a' | 'b' | 'c', false> = false;
  });
});

describe('JsonCompatible', () => {
  type JsonCompatibleObject = {
    a: number;
    b: string;
    c: boolean;
    d: number;
    e: string;
  };
  it('should convert type of bigint to string & Date to number', () => {
    const test1: Assert<JsonCompatible<TestObject>, JsonCompatibleObject> = true;
    const test2: Assert<JsonCompatible<TestInterface>, JsonCompatibleObject> = true;
  });
});
