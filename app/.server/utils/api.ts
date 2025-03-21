import { apiErrorCodes, type ApiResponseError, type ApiResponseSuccess } from '~/services/api';
import type { Nullishable, ValueOf } from '~/utils/types';

export const wrapResponseBody = <T extends JSONValue = JSONValue>(
  data: T,
  meta: ApiResponseSuccess['meta'] = null,
  links: ApiResponseSuccess['links'] = null,
): ApiResponseSuccess<T> => ({
  data: data,
  errors: null,
  meta,
  links,
});

export const wrapResponseError = (
  errors: ApiResponseError['errors'],
  meta: ApiResponseError['meta'] = null,
): ApiResponseError => ({
  data: null,
  errors,
  meta,
  links: null,
});

export const getBearerTokenFromAuthHeader = (authHeader: Nullishable<string>) =>
  authHeader?.substring?.('Bearer '.length) || null;

export const getErrorResponse = ({
  code,
  message,
  status,
  headers,
}: {
  code: string;
  message: string;
  status: number;
  headers?: HeadersInit;
}) =>
  Response.json(
    wrapResponseError([
      {
        code,
        message,
      },
    ]),
    { status, headers },
  );

export const unauthorizedError = {
  code: apiErrorCodes.UNAUTHORIZED,
  message: 'Unauthorized',
};
export const getUnauthorizedResponse = ({
  code,
  message,
  status,
  ...args
}: Partial<Parameters<typeof getErrorResponse>[0]> = {}) =>
  getErrorResponse({
    code: code || unauthorizedError.code,
    message: message || unauthorizedError.message,
    status: status || 401,
    ...args,
  });

export const forbiddenError = {
  code: apiErrorCodes.FORBIDDEN,
  message: 'Request is forbidden',
};
export const getForbiddenResponse = ({
  code,
  message,
  status,
  ...args
}: Partial<Parameters<typeof getErrorResponse>[0]> = {}) =>
  getErrorResponse({
    code: code || forbiddenError.code,
    message: message || forbiddenError.message,
    status: status || 403,
    ...args,
  });

export const notFoundError = {
  code: apiErrorCodes.NOT_FOUND,
  message: 'Requested data is not found',
};
export const getNotFoundResponse = ({
  code,
  message,
  status,
  ...rest
}: Partial<Parameters<typeof getErrorResponse>[0]> = {}) =>
  getErrorResponse({
    code: code || notFoundError.code,
    message: message || notFoundError.message,
    status: status || 404,
    ...rest,
  });

export const badRequestError = {
  code: apiErrorCodes.BAD_REQUEST,
  message: 'Invalid request due to missing search parameters or invalid body value/format',
};
export const getBadRequestResponse = ({
  code,
  message,
  status,
  ...rest
}: Partial<Parameters<typeof getErrorResponse>[0]> = {}) =>
  getErrorResponse({
    code: code || badRequestError.code,
    message: message || badRequestError.message,
    status: status || 400,
    ...rest,
  });

export const generalServerError = {
  code: apiErrorCodes.UNKNOWN_ERROR,
  message: 'Unknown server error',
};
export const getGeneralServerErrorResponse = ({
  code,
  message,
  status,
  ...rest
}: Partial<Parameters<typeof getErrorResponse>[0]> = {}) =>
  getErrorResponse({
    code: code || generalServerError.code,
    message: message || generalServerError.message,
    status: status || 500,
    ...rest,
  });

export { apiErrorCodes } from '~/services/api';

export const apiErrorResponseStatus: Record<ValueOf<typeof apiErrorCodes>, number> = Object.freeze({
  [apiErrorCodes.BAD_REQUEST]: 400,
  [apiErrorCodes.FORBIDDEN]: 403,
  [apiErrorCodes.NOT_FOUND]: 404,
  [apiErrorCodes.UNAUTHORIZED]: 401,
  [apiErrorCodes.ANONYMOUS_REQUIRED]: 401,
  [apiErrorCodes.INVALID_CREDENTIALS]: 401,
  [apiErrorCodes.INVALID_REQUEST_BODY]: 400,
  [apiErrorCodes.INVALID_REQUEST_QUERY_PARAMS]: 400,
  [apiErrorCodes.UNKNOWN_ERROR]: 500,
  [apiErrorCodes.INVALID_AUTH_TOKEN]: 401,
  [apiErrorCodes.INVALID_AUTH_TOKEN_TYPE]: 401,
  [apiErrorCodes.INVALID_AUTH_CODE]: 401,
  [apiErrorCodes.INVALID_USERNAME]: 400,
  [apiErrorCodes.INVALID_PASSWORD]: 400,
  [apiErrorCodes.INVALID_EMAIL]: 400,
  [apiErrorCodes.USERNAME_ALREADY_EXISTS]: 400,
  [apiErrorCodes.EMAIL_ALREADY_EXISTS]: 400,
  [apiErrorCodes.TOO_MANY_REQUESTS]: 429,
});
