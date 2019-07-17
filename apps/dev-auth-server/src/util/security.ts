import fs = require('fs');
import crypto = require('crypto');

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
import SHA3 = require('crypto-js/sha3');

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
  const hashedPW_SHA = await SHA3(hashedPW).toString(); // For FIPS compliance, need SHA-3 layer
  const hashedPW_Final = hash + '|' + hashedPW_SHA.toString();
  return hashedPW_Final;
}

export function getCouchUserDBName(username: string): string {
  // Converts username to couchdb format
  if (username) {
    return 'userdb-' + toHex(username);
  } else {
    throw new Error('Invalid username');
  }
}

function toHex(str: string): string {
  // https://stackoverflow.com/questions/21647928/javascript-unicode-string-to-hex
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}


// Encode/decode base64 (not encryption functions)
// from https://stackoverflow.com/questions/23097928/node-js-btoa-is-not-defined-error
const btoaUTF8 = function(str: any) { return Buffer.from(str, 'utf8').toString('base64'); }
const atobUTF8 = function(b64Encoded: any) {return Buffer.from(b64Encoded, 'base64').toString('utf8');}

export function decode64(encValue: string): string {
  return atobUTF8(encValue);
}

export function encode64(value: string): string {
  return btoaUTF8(value);
}