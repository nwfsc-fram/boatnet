// Boatnet Auth Service Routines

/* tslint:disable:no-console */

import axios from 'axios';
import https from 'https';
import cryptoJS from 'crypto-js';

import jsonwebtoken from 'jsonwebtoken';
import pemjwk from 'pem-jwk';
import { BoatnetUserToken, BoatnetUser } from '../models/auth.model';

import dbConfig from '../config/dbConfig';

// TODO: Better username validation, maybe check for email address if we use email
async function validateUsername(username: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (username.length > 3) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

async function login(username: string, password: string) {
  const pubKey = await getPubKey();
  const apiUrl = dbConfig && dbConfig.apiUrl ? dbConfig.apiUrl : '';
  const userResponse = await axios
    .post(apiUrl + '/api/v1/login', { username, password })
    .catch((err) => {
      console.log(err);
      if (err.response && err.response.status === 401) {
        throw new Error('Invalid username or password.');
      } else {
        // Offline
        throw new Error(
          'Unable to log in using stored credentials. Internet connection required.'
        );
      }
    });

  if (userResponse) {
    const user = userResponse.data;
    const verified: any = jsonwebtoken.verify(user.token, pubKey!); // ! is the non-null assertion operator
    verified.sub = JSON.parse(verified.sub); // parse JSON encoded sub
    console.log('Logged in as', verified.sub.username);
    storeUserToken(verified);
    setCurrentUser(verified.sub);
  } else {
    console.log('Auth is Offline: Trying cached credentials');
    const storedUser = getStoredUserToken(username);
    if (!storedUser) {
      throw new Error(
        'Unable to log in using stored credentials. Internet connection required.'
      );
    } else {
      const isStoredPwOK = checkPassword(storedUser, password);
      if (!isStoredPwOK) {
        throw new Error('Invalid offline username or password.');
      } else {
        setCurrentUser(storedUser.sub);
      }
    }
  }
}

function logout() {
  // TODO: Vuex store instead of localstorage
  localStorage.removeItem('user');
}

function setCurrentUser(user: BoatnetUser) {
  // TODO: Vuex store instead of localstorage
  // store user details and jwt token in local storage to keep user logged in between page refreshes
  localStorage.setItem('user', JSON.stringify(user));
}

function getCurrentUser(): BoatnetUser | undefined {
  // TODO: Vuex store instead of localstorage
  const userStored = localStorage.getItem('user');
  let user: BoatnetUser | undefined;
  if (userStored) {
    user = JSON.parse(userStored);
  }
  return user;
}

function isLoggedIn(): boolean {
  // TODO: Vuex store instead of localstorage
  const logged = localStorage.getItem('user');
  return !!logged;
}

async function getPubKey() {
  // Gets public key for JWT verification.
  // Pull from localstorage for offline mode
  try {
    const apiUrl = dbConfig && dbConfig.apiUrl ? dbConfig.apiUrl : '';
    const result: any = await axios.get(apiUrl + '/api/v1/pubkey');
    if (result.status === 200) {
      const jwkKeyLoaded = result.data.keys[0]; // assuming our key is first
      // TODO If we add multiple keys, we would use 'kid' property for matching
      const pemKey = pemjwk.jwk2pem(jwkKeyLoaded);
      localStorage.setItem('jwk-pub-key', JSON.stringify(jwkKeyLoaded));
      return pemKey;
    }
  } catch (err) {
    const jwkKey = localStorage.getItem('jwk-pub-key');
    if (jwkKey) {
      const storedJWK = JSON.parse(jwkKey);
      console.log('PEM key retrieved from localStorage.');
      return pemjwk.jwk2pem(storedJWK);
    } else {
      throw new Error(
        'Public key not available. Internet connection required.'
      );
    }
  }
}

function storePubKey(jwkKey: string) {
  localStorage.setItem('jwk-pub-key', JSON.stringify(jwkKey));
}

function storeUserToken(userToken: BoatnetUserToken) {
  const bnUsers = localStorage.getItem('bn-users');
  let usersMap = new Map();
  if (bnUsers) {
    usersMap = new Map(JSON.parse(bnUsers));
  }
  usersMap.set(userToken.sub.username, userToken);
  localStorage.setItem('bn-users', JSON.stringify([...usersMap]));
  console.log('Stored JWT for ', userToken.sub.username);
}

function getStoredUserToken(username: string): BoatnetUserToken | undefined {
  const bnUsers = localStorage.getItem('bn-users') || '';
  if (bnUsers) {
    const storedUsers = new Map(JSON.parse(bnUsers));
    if (storedUsers && storedUsers.has(username)) {
      return storedUsers.get(username) as BoatnetUserToken;
    }
  }
  return undefined;
}

function checkPassword(
  storedUser: BoatnetUserToken,
  password: string
): boolean {
  const pwVals = storedUser.sub.hashedPW.split('|');
  if (pwVals.length !== 2) {
    throw new Error('Error parsing PW string.');
  }

  const salt = pwVals[0];
  const hashedPW = pwVals[1];

  const hashedPwSHA = cryptoJS.SHA512(salt + password).toString();
  const verified = hashedPW === hashedPwSHA;
  return verified;
}

export const authService = {
  validateUsername,
  login,
  logout,
  getCurrentUser,
  isLoggedIn
};
