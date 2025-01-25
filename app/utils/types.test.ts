/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'vitest';
import { ArrayToTuple, Assert, PartialBy, ValueOf, ValueOfMapRecord, Writeable } from './types';

type ExampleObject = {
  a: number;
  b: string;
  c: boolean;
};

interface ExampleInterface {
  a: number;
  b: string;
  c: boolean;
}

describe('PartialBy', () => {
  it('', () => {
    // @ts-expect-error This assertion should pass
    const test1: Assert<
      PartialBy<ExampleObject, 'a' | 'c'>,
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
    const test1: Assert<ValueOf<ExampleObject>, number | string | boolean> = true;
    const test2: Assert<ValueOf<ExampleObject>, number, false> = false;
  });

  it('should not work with Set (not extract value of Set as `never` but something)', () => {
    const test1: Assert<ValueOf<Set<number>>, never, false> = false;
  });
});

describe('Writeable', () => {
  it('should work', () => {
    const test1: Assert<Writeable<Readonly<ExampleObject>>, ExampleObject> = true;
    const test2: Assert<Writeable<Readonly<ExampleInterface>>, ExampleInterface> = true;

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

describe('ArrayToTuple', () => {
  it('should work with Array of string only', () => {
    const test1: Assert<ArrayToTuple<['a', 'b', 'c']>, 'a' | 'b' | 'c'> = true;
    const test2: Assert<ArrayToTuple<['a', 'b', 'c']>, 'a' | 'b', false> = false;
    const test3: Assert<ArrayToTuple<['a', 'b']>, 'a' | 'b' | 'c', false> = false;
  });
});
