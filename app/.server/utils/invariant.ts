import _invariant from 'tiny-invariant';
import { getPublicErrorResponseData, handleError, ValidationError, ServerBaseError } from './error';
import { assertGuard, type PartialBy } from '~/utils/types';
import { apiErrorCodes, getErrorResponse } from './api';

/**
 * Wrapper of helper from `tiny-invariant` to throw appropriate `ServerBaseError` instead of native Error.
 * @param message Private error message sent to client
 * @param options.publicMessage Public error message logged to error reporting service
 */
export function invariant(
  condition: any,
  message?: string,
  {
    errorClass = ValidationError,
    ...args
  }: PartialBy<ConstructorParameters<typeof ServerBaseError>[0], 'code' | 'publicMessage'> & {
    errorClass?: typeof ServerBaseError;
  } = {
    errorClass: ValidationError,
  },
): asserts condition {
  try {
    _invariant(condition, message);
  } catch (error) {
    assertGuard<Error>(error);
    handleError({ error });
    throw new errorClass({
      ...args,
      privateMessage: args.privateMessage ?? error.message,
      code: args.code ?? apiErrorCodes.UNKNOWN_ERROR,
      publicMessage: args.publicMessage ?? 'Unknown server error',
    });
  }
}

/**
 * Wrapper of helper from `tiny-invariant` to throw appropriate `Response` instead of native `Error`. This is intended to be used in `catch` block of each API route handler instead of raw `invariant()`
 * @param message Private error message sent to client
 * @param options.publicMessage Public error message logged to error reporting service
 */
export function invariantWithResponse(
  condition: any,
  message?: string,
  {
    errorClass = ValidationError,
    ...args
  }: PartialBy<ConstructorParameters<typeof ServerBaseError>[0], 'code' | 'publicMessage'> & {
    errorClass?: typeof ServerBaseError;
  } = {
    errorClass: ValidationError,
  },
): asserts condition {
  try {
    _invariant(condition, message);
  } catch (error) {
    assertGuard<Error>(error);
    handleError({ error });
    throw getErrorResponse(
      getPublicErrorResponseData(
        new errorClass({
          ...args,
          privateMessage: args.privateMessage ?? error.message,
          code: args.code ?? apiErrorCodes.UNKNOWN_ERROR,
          publicMessage: args.publicMessage ?? 'Unknown server error',
        }),
      ),
    );
  }
}
