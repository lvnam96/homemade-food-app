export type ValueOf<T> = Required<T>[keyof T];

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
 * @link https://stackoverflow.com/a/71525485/5805244
 */
export type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V;
};

export function assertGuard<T>(input: unknown): asserts input is T {}
