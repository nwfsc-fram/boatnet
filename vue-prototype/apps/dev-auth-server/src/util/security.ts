import fs = require('fs');
import crypto = require('crypto');

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
import SHA512 = require('crypto-js/sha512');

export const randomBytes = promisify(crypto.randomBytes);

export const signJwt = promisify(jwt.sign);

// TEMPORARY Keys used for signing JWT - NOT SECURE! (Publicly committed)
export const RSA_CERT = fs.readFileSync(

  'src/keys/temp-cert.pem'
);
export const RSA_PRIVATE_KEY = fs.readFileSync(
  'src/keys/temp-priv-key.pem'
);
export const RSA_PUBLIC_KEY = fs.readFileSync(
  'src/keys/temp-pub-key.pem'
);

const SESSION_DURATION = 7200;

export async function createSessionToken(userInfo: any) {
  return signJwt({}, RSA_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: SESSION_DURATION,
    subject: JSON.stringify(userInfo)
  });
}

export async function decodeJwt(token: string) {
  const payload = await jwt.verify(token, RSA_PUBLIC_KEY);
  console.log('Decoded JWT payload', payload);
  return payload;
}

export async function createCsrfToken() {
  return await randomBytes(32).then((bytes: any) => bytes.toString('hex'));
}

export async function hashBoatnetPW(password: string): Promise<string> {
  const hash = crypto.randomBytes(20).toString('hex');
  const hashedPW = hash + password;
  const hashedPW_SHA = await SHA512(hashedPW).toString(); // For FIPS compliance, need SHA-512 layer
  const hashedPW_Final = hash + '|' + hashedPW_SHA.toString();
  return hashedPW_Final;
}
