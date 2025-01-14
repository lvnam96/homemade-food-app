/** Returns a path with params joined with `?`, e.g: `/path/to/page?param1=value1&param2=value2` */
export const joinPathWithParams = (path: string, params?: ConstructorParameters<typeof URLSearchParams>[0]) => {
  if (typeof path !== 'string') throw new Error('`path` argument is required');
  if (!params) return path;

  return `${path}${stringifyQuery(params)}`;
};

export const stringifyQuery = (
  obj?: ConstructorParameters<typeof URLSearchParams>[0],
  {
    appendQuestionMark = true,
  }: {
    appendQuestionMark?: boolean;
  } = {
    appendQuestionMark: true,
  },
) => (appendQuestionMark ? '?' : '') + new URLSearchParams(obj).toString();
