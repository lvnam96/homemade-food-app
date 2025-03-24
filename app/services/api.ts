import Api, { HTTPError, type Options } from 'ky';
import { assertGuard } from '~/utils/types';
import { parseLinkHeader as plh } from '@web3-storage/parse-link-header';

// export const API_ENDPOINT = process.env.API_ENDPOINT;

const apiBaseConfig = Object.freeze({
  // prefixUrl: checkIsBrowser() ? window.location.origin : API_ENDPOINT, // omitted due to we don't have seperate API endpoint server yet
  headers: {},
  timeout: 10000,
} as Options);

const api = Api.create(apiBaseConfig);

export const createApiInstance = (config?: Options) => (config === apiBaseConfig ? api : Api.create(config));

export const getApiBaseConfig = () => apiBaseConfig;

export default api;

export const checkIsApiError = <T = unknown>(err: unknown): err is HTTPError<T> => {
  assertGuard<HTTPError>(err);
  return !!err.request && !!err.response;
};

export const checkIsNetworkError = (err: any) => !err.response && err?.request && !err.request?.status;

export const generateAuthHeaderValue = (token: string) => `Bearer ${token}`;

const createMergeSearchParamsFunc =
  (
    {
      overrideDuplicate = false,
    }: {
      overrideDuplicate?: boolean;
    } = {
      overrideDuplicate: false,
    },
  ) =>
  (
    params: Record<string, string | number | boolean | null>,
    originalSearchParams: Options['searchParams'] = {},
  ): Options['searchParams'] => {
    const searchParams = new URLSearchParams();
    const writeParam = overrideDuplicate ? searchParams.set : searchParams.append;
    for (const [key, value] of Object.entries(params)) {
      if (value !== null) writeParam.call(searchParams, key, String(value));
    }
    for (const [key, value] of Object.entries(originalSearchParams)) {
      if (value !== null) writeParam.call(searchParams, key, String(value));
    }
    return searchParams;
  };

export const mergeSearchParams = createMergeSearchParamsFunc({ overrideDuplicate: true });
export const combineSearchParams = createMergeSearchParamsFunc({ overrideDuplicate: false });

/**
 * Generate helper to merge/combine multiple header objects into one (uses `.set()` (or `.append()`) so headers are (not) overridden)
 */
const createMergeHeadersFunc =
  (
    {
      overrideDuplicate = false,
    }: {
      overrideDuplicate?: boolean;
    } = {
      overrideDuplicate: false,
    },
  ) =>
  (...headers: Array<ResponseInit['headers'] | null | undefined>) => {
    const combinedHeaders = new Headers();
    for (const header of headers) {
      if (!header) continue;
      for (const [key, value] of new Headers(header).entries()) {
        combinedHeaders[overrideDuplicate ? 'append' : 'set'](key, value);
      }
    }
    return combinedHeaders;
  };
export const mergeHeaders = createMergeHeadersFunc({ overrideDuplicate: true });
export const combineHeaders = createMergeHeadersFunc({ overrideDuplicate: false });

export const parseLinkHeader = (res?: { headers?: { link?: string } }) => {
  const linkHeaderStringValue = res?.headers?.link;
  const linkHeader = linkHeaderStringValue ? plh(linkHeaderStringValue as string) : null;
  const prevPageIndex = Number.parseInt(linkHeader?.prev?.page as string, 10);
  const nextPageIndex = Number.parseInt(linkHeader?.next?.page as string, 10);
  const lastPageIndex = Number.parseInt(linkHeader?.last?.page as string, 10);

  return {
    prevPageIndex: Number.isNaN(prevPageIndex) ? null : prevPageIndex,
    nextPageIndex: Number.isNaN(nextPageIndex) ? null : nextPageIndex,
    lastPageIndex: Number.isNaN(lastPageIndex) ? null : lastPageIndex,
  };
};

export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponsePaginationLinks = {
  self: string;
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
};

export type ApiResponseBody<T extends JSONValue = JSONValue, E extends JSONObject = JSONObject> = {
  data: T; // some special APIs return `null` when there is no data (for example: `/qr/login/wait` while waiting for QR code login to complete)
  errors: ApiError[] | null;
  meta: JSONObject | null;
  links: ApiResponsePaginationLinks | null;
} & E;

export interface ApiResponseSuccess<T extends JSONValue = JSONValue> extends ApiResponseBody<T> {
  errors: null;
  data: T;
}

export interface ApiResponseError extends ApiResponseBody<null> {
  errors: ApiError[];
  data: null;
  links: null;
}

export const invalidDataErrorMsg = 'Response data is invalid';

export const assertResponseBody = <T extends JSONValue>(
  resBody: ApiResponseBody<T>,
  {
    skipAssertData = false,
  }: {
    /** Some special APIs return 204 No Content, for example: waiting for QR code login */
    skipAssertData?: boolean;
  } = {
    skipAssertData: false,
  },
): void => {
  if (resBody.errors && resBody.errors.length !== 0) {
    throw new Error(resBody.errors[0]?.message ?? 'Unknown error: ' + JSON.stringify(resBody.errors));
  } else if (!skipAssertData && !resBody.data) {
    throw new Error('Missing data');
  }
};

export const apiErrorCodes = {
  BAD_REQUEST: 'bad_request',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  UNAUTHORIZED: 'unauthorized',
  ANONYMOUS_REQUIRED: 'anonymous_required',
  INVALID_CREDENTIALS: 'invalid_credentials',
  INVALID_REQUEST_BODY: 'invalid_request_body',
  INVALID_REQUEST_QUERY_PARAMS: 'invalid_request_query_params',
  UNKNOWN_ERROR: 'unknown_error',
  INVALID_AUTH_TOKEN: 'invalid_auth_token',
  INVALID_AUTH_TOKEN_TYPE: 'invalid_auth_token_type',
  INVALID_AUTH_CODE: 'invalid_auth_code',
  INVALID_USERNAME: 'invalid_username',
  INVALID_PASSWORD: 'invalid_password',
  INVALID_EMAIL: 'invalid_email',
  USERNAME_ALREADY_EXISTS: 'username_already_exists',
  EMAIL_ALREADY_EXISTS: 'email_already_exists',
  TOO_MANY_REQUESTS: 'too_many_requests',
  INVALID_REQUEST_METHOD: 'invalid_request_method',
} as const;
