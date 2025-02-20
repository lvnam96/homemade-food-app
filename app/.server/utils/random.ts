import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const DEFAULT_CRYPTO_STR_LENGTH = 16;

export const getStrongCryptoRandomStr = (size = DEFAULT_CRYPTO_STR_LENGTH, strType: BufferEncoding = 'hex') =>
  promisify(randomBytes)(size).then((buf) => buf.toString(strType));
