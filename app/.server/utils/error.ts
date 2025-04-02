import { captureException, captureRemixServerException } from '@sentry/remix';
import { apiErrorCodes, apiErrorResponseStatus, type getErrorResponse } from './api';
import type { MaybePromise, PartialBy, RequiredBy } from '~/utils/types';

export class ServerBaseError extends Error {
  /** Private message (explaination) that must not be sent to client */
  privateMessage?: string;
  /** Classification of the error */
  name: string;
  /** Error code to be sent to client */
  code: keyof typeof apiErrorResponseStatus;

  constructor({
    name,
    code,
    publicMessage,
    privateMessage,
    ...rest
  }: {
    name?: string;
    code: ServerBaseError['code'];
    publicMessage: string;
    privateMessage?: string;
  } & Omit<Error, 'message' | 'name'>) {
    if (!publicMessage) throw new SyntaxError('Error message is required');
    super(publicMessage);
    this.name = name ?? this.constructor.name;
    this.privateMessage = privateMessage;
    this.code = code;
    Object.assign(this, rest);
  }
}

export class DatabaseError extends ServerBaseError {}

export class LogicError extends ServerBaseError {}

export class AuthError extends ServerBaseError {}

export class ValidationError extends ServerBaseError {
  constructor(args: PartialBy<ConstructorParameters<typeof ServerBaseError>[0], 'code'>) {
    super({
      ...args,
      code: apiErrorCodes.UNKNOWN_ERROR,
    });
  }
}

export const reportError = async ({
  error,
  request,
  reportToSentry = true,
}: {
  error: ServerBaseError | Error;
  request?: Request;
  reportToSentry?: boolean;
}) => {
  if (!reportToSentry || process.env.NODE_ENV !== 'production') return;
  if (request)
    await captureRemixServerException(
      error,
      `${error.name}: ${error instanceof ServerBaseError ? error.privateMessage : error.message}`,
      request,
    );
  else captureException(error);
};

export const handleError = (args: RequiredBy<Parameters<typeof reportError>[0], 'error'>) => {
  console.error(args.error);

  // Omit reporting validation errors since we don't want to spam sentry & our error notifications system:
  if (args.error.name === 'ValidationError') return;
  else reportError(args);
};

export const getPublicErrorResponseStatus = (errorCode: ServerBaseError['code']) => apiErrorResponseStatus[errorCode];

export type ServerError = DatabaseError | LogicError | AuthError | ValidationError;
export const getPublicErrorResponseData = (
  error: ServerError,
): Pick<Parameters<typeof getErrorResponse>[0], 'message' | 'code' | 'status'> => ({
  message: error.message || (error.stack ? error.stack.split('\n')[0] : `${error.name}: Unknown error`),
  code: error.code,
  status: getPublicErrorResponseStatus(error.code),
});

type Success<T> = [error: null, data: T];
type Failure<E> = [error: E, data?: never];
type Result<T, E = Error> = Success<T> | Failure<E>;
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return [null, await promise];
  } catch (error) {
    return [error as E];
  }
}

export async function tryCatchFunction<T, E = Error>(fn: () => MaybePromise<T>): Promise<Result<T, E>> {
  try {
    return [null, await fn()];
  } catch (error) {
    return [error as E];
  }
}
