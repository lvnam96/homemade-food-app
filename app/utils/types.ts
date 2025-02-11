export type ValueOf<T> = Required<T>[keyof T];

// ref: https://stackoverflow.com/a/65511666/5805244
export type ValueOfMapRecord<T> = T extends Map<any, infer I> ? I : never;

export type PartialBy<T extends object, K extends keyof T> = Pick<T, Exclude<keyof T, K>> & Partial<Pick<T, K>>;

export type RequiredBy<T extends object, K extends keyof T> = T & { [P in K]-?: T[P] };

export type PartialExcept<T extends object, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

export type Nullish = null | undefined;

export type Nullishable<T> = T | Nullish;

/** Remove `undefined` from union. Usually, built-in type `NonNullable<T>` is what you need. */
export type NonUndefined<T> = Exclude<T, undefined>;

export type MaybePromise<T> = T | Promise<T>;

/**
 * Make readonly object to mutable
 * @link https://stackoverflow.com/a/43001581/5805244
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
/**
 * Make readonly object to mutable
 * @link https://stackoverflow.com/a/43001581/5805244
 */
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
/**
 * Make object to deep readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * @link https://stackoverflow.com/a/71525485/5805244
 */
export type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V;
};

/**
 * Folows result of `toJSON` method from `@adllang/jsonbinding`. This is meant to be used as the return type of `makeDatePropsJsonCompatible()` (see `./data` utils)
 */
export type JsonCompatible<T extends object> = {
  [K in keyof T]: T[K] extends Nullable<Date>
    ? T[K] extends Date
      ? Timestamp
      : Nullable<Timestamp>
    : T[K] extends Nullable<bigint>
      ? T[K] extends bigint
        ? string
        : Nullable<string>
      : T[K] extends object
        ? JsonCompatible<T[K]>
        : T[K];
};

// export type MockedFn<T extends (...args: any) => any> = import('vitest').Mock<T>;

export function assertGuard<T>(input: unknown): asserts input is T {}

/**
 * Used for testing types
 */
export type Assert<
  T,
  U,
  Falsy extends false | { error: 'Types are not equal'; type1: T; type2: U } = {
    error: 'Types are not equal';
    type1: T;
    type2: U;
  },
  Truthy extends true | { error: 'Types are equal'; type1: T; type2: U } = true,
> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? Truthy : Falsy;
