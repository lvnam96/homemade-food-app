import qs from 'query-string';

/** Returns a path with params joined with `?`, e.g: `/path/to/page?param1=value1&param2=value2` */
export const joinPathWithParams = (path: string, params?: Parameters<typeof stringifyQuery>[0]) => {
  if (typeof path !== 'string') throw new Error('`path` argument is required');
  if (!params) return path;

  return `${path}${stringifyQuery(params)}`;
};

/**
 * @deprecated This is old implementation
 * @alias {@link stringifyQuery}
 *  */
const _stringifyQuery = (
  obj?: ConstructorParameters<typeof URLSearchParams>[0],
  {
    appendQuestionMark = true,
  }: {
    appendQuestionMark?: boolean;
  } = {
    appendQuestionMark: true,
  },
) => (appendQuestionMark ? '?' : '') + new URLSearchParams(obj).toString();

/**
 * NOTE: `query-string` is used instead of platform-specific API `new URLSearchParams().toString()` because `query-string` supports multiple values for the same key via an easy-to-read format (`Record<string, string[] | string>`) & ensures compatibility with NodeJS API `URLSearchParams` (Web API `URLSearchParams` supports only (`[string, string][]` format, see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams#parameters)
 */
export const stringifyQuery = (
  obj: Record<string, any>,
  {
    appendQuestionMark = true,
  }: {
    appendQuestionMark?: boolean;
  } = {
    appendQuestionMark: true,
  },
) => (appendQuestionMark ? '?' : '') + qs.stringify(obj);

export const parseQueryString = <T = string>(queryString: string): ParsedQuery<T> =>
  typeof queryString === 'string' && queryString.length > 0
    ? Array.from(
        new URLSearchParams(queryString.startsWith('?') ? queryString.substring(1) : queryString).entries(),
      ).reduce(
        (obj, [key, val]) => {
          const value = val || null; // value should fallback to `null` instead of empty string
          // if key already exists, convert to array and append value:
          const valueInParsedQueryObject = obj[key];
          if (valueInParsedQueryObject)
            return {
              ...obj,
              [key]: Array.isArray(valueInParsedQueryObject)
                ? valueInParsedQueryObject.push(value)
                : [valueInParsedQueryObject, value],
            };
          else return Object.assign(obj, { [key]: value });
        },
        {} as Record<string, any>,
      )
    : {};

export const getQueryStringValue = <T extends string | string[] = string | string[]>(
  queryKey: string,
  query: ParsedQuery | string,
  {
    isSingle = true,
  }: {
    isSingle: boolean;
  } = {
    isSingle: true,
  },
): T | null => {
  const queryObject = typeof query === 'string' ? parseQueryString(query) : query;

  let queryValue = queryObject?.[queryKey] ?? null; // use `null` as fallback for `undefined` due to JSON does not support `undefined`
  if (isSingle && Array.isArray(queryValue)) {
    queryValue = queryValue[0];
  }
  return queryValue as T;
};

export type ParsedQuery<T = string> = Record<string, T | null | Array<T | null>>;
