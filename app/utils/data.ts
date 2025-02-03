import _intersectionWith from 'lodash.intersectionwith';

export { default as checkIsEqual } from 'fast-deep-equal';

export const encodeBase64 = (str: string) => Buffer.from(str).toString('base64');

export const decodeBase64 = (str: string) => Buffer.from(str, 'base64').toString();

export const convertObjectToMap = (obj: Record<string, any>) => {
  if (!(obj instanceof Object)) throw new Error();
  return new Map(Object.entries(obj));
};

export const convertMapToObject = <K extends string | number | symbol, V>(map: Map<K, V>): { [k: string]: V } => {
  if (!(map instanceof Map)) throw new Error();
  return Object.fromEntries(map);
};

export const convertMapToArray = <K, V>(map: Map<K, V>): [K, V][] => Array.from(map);

/**
 * Alternative of `lodash.isObjectLike`
 *
 * @see https://github.com/lodash/lodash/blob/97d4a2fe193a66f5f96d7b813bed96b35b5abf15/src/isObjectLike.ts
 */
export const checkIsObjectLike = (value: any): value is Record<string, any> =>
  typeof value === 'object' && value !== null;

/**
 * Alternative of `lodash.isPlainObject`
 *
 * @see https://github.com/lodash/lodash/blob/0b28b7f7b6702c4bffe80f2d12279ff8df217116/src/isPlainObject.ts
 */
export const checkIsPlainObject = <T>(value: T): value is NonNullable<T> => {
  if (!checkIsObjectLike(value) || getTag(value) !== '[object Object]') {
    return false;
  }
  if (Object.getPrototypeOf(value) === null) {
    return true;
  }
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
};

/** Alternative of `lodash.isEmpty` */
export const checkIsEmpty = (value: any) => {
  if (value == null) {
    return true;
  }

  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  if (value instanceof Set || value instanceof Map) {
    return value.size === 0;
  }

  if (typeof value === 'object') {
    // Check for empty objects, considering objects with prototype properties
    return Object.keys(value).length === 0 && value.constructor === Object;
  }

  // Check for rare case where toString has been overridden to return an empty string
  // if (typeof value.toString === 'function' && value.toString() === '') {
  //   return true;
  // }

  return false;
};

/** Alternative of `lodash.isFunction` */
export const checkIsFunction = <T extends (...args: any[]) => any>(value: any): value is T =>
  typeof value === 'function';

/**
 * Alternative of `lodash.pick`
 *
 * PERF: In real usecases, the AMOUNT OF KEYS IS RELATIVELY SMALL (<10), `Array.prototype.reduce` performs better than
 * `Object.fromEntries`. Ref: https://jsbench.me/2klropmx7y/1
 *
 * ```
 * pick<T extends object, U extends keyof T>(object: T, ...props: Array<Many<U>>): Pick<T, U>;
 * ```
 */
export const pick = <T extends Record<string, any>, U extends keyof T>(
  obj: T,
  keys: U[],
): T extends object ? Pick<T, U> : null =>
  checkIsObjectLike(obj)
    ? Object.entries(obj) // will throw exception if `obj` is `null`
        .filter(([key]) => keys.includes(key as U))
        .reduce(
          (acc, [key, value]) => {
            // Assign key/value pair directly is always better than `Object.assign` in perf
            acc[key as U] = value;
            return acc;
          },
          {} as T extends object ? Pick<T, U> : null,
        )
    : (null as T extends object ? Pick<T, U> : null);

/**
 * Alternative of `lodash.omit`
 *
 * NOTE(perf): In real usecases, the AMOUNT OF KEYS IS RELATIVELY SMALL (<10), `Object.fromEntries().filter()` is better
 * perf than `Array.prototype.reduce` in general (it scales well with either small/large number of key/value pairs in
 * `obj`). Ref: https://jsbench.me/2klropmx7y/1
 */
export const omit = <T extends Record<string, any>, U extends keyof T>(obj: T, keys: U[]): Omit<T, U> =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as U))) as Omit<T, U>;

/** Alternative of `lodash.identity`. It return firstly passed argument. */
export const identity = <T>(...args: [T, ...any]): T => args[0];

/** Alternative of `lodash.uniq` */
export const uniq = <T>(arr: T[]): typeof arr => Array.from(new Set(arr));

/** Alternative of `lodash.uniqBy` with optional "comparator" (idea from `lodash.uniqWith`) */
export const uniqBy = <T, U>(
  arr: T[],
  /** Receive being-checked item, return whatever you want to be checked */
  iteratee: (a: T) => U,
  /**
   * This parameter must be required otherwise `uniq` is the better choice. Use `Object.js` in case you just want common
   * strict compare function like `(a, b) => a === b`
   */
  comparator: (a: U, b: U) => boolean = Object.is,
): typeof arr =>
  arr.reduce<typeof arr>((acc, val, index) => {
    if (arr.findLastIndex((a) => comparator(iteratee(a), iteratee(val))) === index) acc.push(val);
    return acc;
  }, []);

/** Alternative of `lodash.uniqWith` */
export const uniqWith = <T>(arr: T[], comparator: (a: T, b: T) => boolean): typeof arr =>
  arr.reduce<typeof arr>((acc, val) => {
    if (acc.findIndex((u) => comparator(val, u)) === -1) acc.push(val);
    return acc;
  }, []);

/**
 * @example
 *   Setting options:
 *   leading: true (trailing:false) -> before timeout
 *   leading: false (trailing:false) -> after timeout
 *   trailing: true (leading:true|false) -> [default] after timeout, used for typing (input's change) event handlers
 */
export const debounce = <T extends any[]>(
  func: (...args: T) => any,
  /** Time period in miliseconds */
  wait: number,
  {
    leading = false,
    trailing = true,
    context,
  }: {
    leading?: boolean;
    trailing?: boolean;
    context?: any;
  } = {
    leading: false,
    trailing: true,
  },
) => {
  let timeout: ReturnType<typeof setTimeout> | number | null = null;

  return function (...args: Parameters<typeof func>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context = context || this;

    clearTimeout(timeout as number);

    if (!timeout && leading && !trailing) {
      func.apply(context, args);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (trailing || !leading) {
        func.apply(context, args);
      }
    }, wait);
  };
};

/** Alternative of `lodash.shuffle`. It shuffles array's items keeping their references */
export const shuffle = <T>(arr: T[]): T[] => {
  const copyArray = arr.slice();
  let currentIndex = copyArray.length,
    randomIndex,
    temporaryValue;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    do {
      randomIndex = Math.floor(Math.random() * copyArray.length);
    } while (randomIndex === currentIndex - 1);

    currentIndex--; // loop breaker; make its value in first loop valid for next swap:

    // And swap it with the current element.
    temporaryValue = copyArray[currentIndex];
    copyArray[currentIndex] = copyArray[randomIndex];
    copyArray[randomIndex] = temporaryValue;

    // Reset
    randomIndex = undefined;
    temporaryValue = undefined;
  }

  return copyArray;
};

/**
 * NOTE: `getCommonItems` is memoized due to the fact that both `getCommonItems` & `checkHasCommonItem` will be called together (in the same function) most of the times, so doing the same task outside & inside of `checkHasCommonItem` is a bit redundant.
 *
 * NOTE: `memoize-one` does not convert types well (the type of return value is `unknown[]` instead of `string[]` if both arrays' type is `string[]`).
 */
// export const getCommonItems = memoizeOne(_intersectionWith);
// export const checkHasCommonItem = <T1 = unknown, T2 = unknown>(
//   arr1: T1[] = [],
//   arr2: T2[] = [],
//   comparator: Parameters<typeof _intersectionWith>[2],
// ): boolean => {
//   if (Array.isArray(arr1) && Array.isArray(arr2) && arr1.length > 0 && arr2.length > 0) {
//     const commonItems = getCommonItems(arr1, arr2, comparator);
//     return commonItems.length > 0;
//   }
//   return false;
// };

/**
 * This helper check whether an array contains duplicated objects (objects that have same properies & values)
 */
// export const hasDuplicatedObjects = (list: any[] = [], compareObjectFn = checkIsEqual) => {
//   if (!Array.isArray(list)) throw new Error('First argument must be array');
//   if (!checkIsFunction(compareObjectFn)) throw new Error('Second argument must be function');
//   if (list.length < 2) return false;

//   const uniqueList = uniqWith(list, compareObjectFn);
//   // const uniqueList = [];
//   // list.forEach((item) => {
//   //   let isMatched = false;
//   //   for (let i = 0; i < uniqueList.length; i++) {
//   //     if (compareObjectFn(uniqueList[i], item)) {
//   //       isMatched = true;
//   //       return true;
//   //     }
//   //   }
//   //   if (!isMatched) {
//   //     uniqueList.push(item);
//   //   }
//   // });
//   return uniqueList.length !== list.length;
// };

export const validateInstance = <T extends FunctionConstructor>(
  object: any,
  classConstructor: FunctionConstructor,
): object is T => {
  if (!(object instanceof classConstructor)) {
    throw new Error(`Passed object is not an instance of ${classConstructor.name}`);
  }
  return object;
};

export const convertDateToTimestamp = (date: Date) => {
  if (!(date instanceof Date)) {
    throw new Error('Date must be an instance of Date');
  }
  return Math.floor(date.getTime() / 1000);
};

export const convertTimestampToDate = (timestamp: number) => {
  if (!Number.isFinite(timestamp)) {
    throw new Error('Timestamp must be a finite number');
  }
  return new Date(timestamp * 1000);
};

export const makeDatePropsJsonCompatible = <T extends Record<string, any>>(
  obj: T,
): Record<string, JSONValue> | null => {
  if (obj === null) {
    return obj;
  }

  if (!checkIsObjectLike(obj)) {
    throw new Error('First argument must be an object');
  }

  const newObj: Record<string, JSONValue> = { ...obj };
  Object.keys(newObj).forEach((key) => {
    const value = newObj[key];
    if (value instanceof Date) {
      newObj[key] = convertDateToTimestamp(value);
    } else if (checkIsObjectLike(value)) {
      newObj[key] = makeDatePropsJsonCompatible(value);
    }
  });
  return newObj;
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @see https://github.com/lodash/lodash/blob/97d4a2fe193a66f5f96d7b813bed96b35b5abf15/src/.internal/getTag.ts
 */
function getTag(value: any): string {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return Object.prototype.toString.call(value);
}
