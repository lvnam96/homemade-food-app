import jwt, { type JwtPayload, type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { assertGuard } from '~/utils/types';

const SECRET_KEY = process.env.JWT_SECRET;

export const signJwt = (payload = {}, secret = SECRET_KEY, opts: SignOptions = {}) => {
  secret = secret || SECRET_KEY;
  opts = opts || {};
  opts.algorithm = opts.algorithm || 'HS256'; // need to be changed to RS256 to meet Google requirement
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secret, opts, (err, token) => {
      if (err) return reject(err);

      assertGuard<string>(token);
      resolve(token);
    });
  });
};

export const verifyJwt = (token: string, secret = SECRET_KEY, opts: VerifyOptions = {}) => {
  secret = secret || SECRET_KEY;
  opts = opts || {};
  opts.algorithms = Array.isArray(opts.algorithms) ? opts.algorithms : ['RS256', 'HS256'];
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secret, opts, (err, decodedPayload) => {
      if (err) return reject(err);

      assertGuard<JwtPayload>(decodedPayload);
      resolve(decodedPayload);
    });
  });
};
