import { compare as bcryptCompare, hash as bcryptHash } from 'bcrypt';
import { getStrongCryptoRandomStr } from './random';
// import forge from 'node-forge';

// const globalPepper = '<special_chars_here>'; // also used for AES256, should save it in a .key file or database

/**
 * @param raw raw password + salt
 */
export const hashPassword = (raw: string, saltRounds = 10) => bcryptHash(raw, saltRounds);

/**
 * @param raw raw password + salt
 * @param hash password string in database
 */
export const comparePassword = bcryptCompare;

export const getSaltedPassword = async (passwd: string, salt?: string) => {
  if (!passwd || typeof passwd !== 'string') throw new Error('"passwd" argument is invalid');
  salt = salt || (await getStrongCryptoRandomStr());
  return {
    passwd: passwd + salt,
    salt,
  };
};
