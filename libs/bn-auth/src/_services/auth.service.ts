// Boatnet Auth Service Routines

/* tslint:disable:no-console */

import axios from 'axios';
import https from 'https';
import cryptoJS from 'crypto-js';

import jsonwebtoken from 'jsonwebtoken';
import pemjwk from 'pem-jwk';
import { BoatnetUserToken, BoatnetUser } from '../models/auth.model';

import dbConfig from '../config/dbConfig';
import { CouchDBCredentials } from '@boatnet/bn-couch';

class AuthService {
  private currentUser: BoatnetUser | null = null;
  private currentCredentials!: { username: string; password: string };

  constructor() {
    console.log('[Auth Service] Initialized');
    this.currentUser = this.getCurrentUser();
  }

  // TODO: Better username validation, maybe check for email address if we use email
  public async validateUsername(username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (username.length > 3) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public async login(username: string, password: string): Promise<BoatnetUser> {
    const pubKey = await this.getPubKey();
    const apiUrl = dbConfig && dbConfig.apiUrl ? dbConfig.apiUrl : '';
    const userResponse = await axios
      .post(apiUrl + '/api/v1/login', { username, password })
      .catch((err) => {
        console.log('[Auth Service]', err);
        if (err.response && err.response.status === 401) {
          throw new Error('Invalid username or password.');
        }
        // Else - possibly offline - Continue
      });

    if (userResponse) {
      const user = userResponse.data;
      const verified: any = jsonwebtoken.verify(user.token, pubKey!); // ! is the non-null assertion operator
      verified.sub = JSON.parse(verified.sub); // parse JSON encoded sub
      this.storeUserToken(verified);
      this.setCurrentUser(verified.sub);
      this.setCredentials(username, password);
      return verified.sub;
    } else {
      console.log('[Auth Service] Auth is Offline: Trying cached credentials');
      const storedUser = this.getStoredUserToken(username);
      if (!storedUser) {
        throw new Error(
          'Unable to log in using stored credentials. Internet connection required.'
        );
      } else {
        const isStoredPwOK = this.checkPassword(storedUser, password);
        if (!isStoredPwOK) {
          throw new Error('Invalid offline username or password.');
        } else {
          this.setCurrentUser(storedUser.sub);
          this.setCredentials(username, password);
          return storedUser.sub;
        }
      }
    }
  }

  public logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
    delete this.currentCredentials;
  }

  public getCurrentUser(): BoatnetUser | null {
    const isDevMode = process.env.NODE_ENV === 'development';

    if (this.currentUser) {
      return this.currentUser;
    } else if (!isDevMode) {
      return null; // Do not store user (Production mode)
    }

    const userStored = localStorage.getItem('user');
    let user: BoatnetUser | null;
    if (userStored) {
      console.log('[Auth Service] Dev mode: auto-login using stored user.');
      user = JSON.parse(userStored);
    } else {
      user = null;
    }
    return user;
  }

  public isLoggedIn(): boolean {
    const logged = localStorage.getItem('user');
    return !!logged;
  }

  public getCouchDBCredentials(): CouchDBCredentials | undefined {
    // For CouchDB access (TODO cookie or JWT for couch)
    if (!this.currentUser) {
      return undefined;
    }
    return {
      dbInfo: this.currentUser.couchDBInfo,
      userCredentials: this.currentCredentials
    };
  }

  private setCurrentUser(user: BoatnetUser) {
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  private setCredentials(username: string, password: string) {
    // For CouchDB access (TODO cookie or JWT for couch)
    this.currentCredentials = { username, password }; // Not stored in local storage.
  }

  private async getPubKey() {
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
        console.log('[Auth Service] PEM key retrieved from localStorage.');
        return pemjwk.jwk2pem(storedJWK);
      } else {
        throw new Error(
          'Public key not available. Internet connection required.'
        );
      }
    }
  }

  private storePubKey(jwkKey: string) {
    localStorage.setItem('jwk-pub-key', JSON.stringify(jwkKey));
  }

  private storeUserToken(userToken: BoatnetUserToken) {
    const bnUsers = localStorage.getItem('bn-users');
    let usersMap = new Map();
    if (bnUsers) {
      usersMap = new Map(JSON.parse(bnUsers));
    }
    usersMap.set(userToken.sub.username, userToken);
    localStorage.setItem('bn-users', JSON.stringify([...usersMap]));
  }

  private getStoredUserToken(username: string): BoatnetUserToken | undefined {
    const bnUsers = localStorage.getItem('bn-users') || '';
    if (bnUsers) {
      const storedUsers = new Map(JSON.parse(bnUsers));
      if (storedUsers && storedUsers.has(username)) {
        return storedUsers.get(username) as BoatnetUserToken;
      }
    }
    return undefined;
  }

  private checkPassword(
    storedUser: BoatnetUserToken,
    password: string
  ): boolean {
    const pwVals = storedUser.sub.hashedPW.split('|');
    if (pwVals.length !== 2) {
      throw new Error('Error parsing PW string.');
    }

    const salt = pwVals[0];
    const hashedPW = pwVals[1];

    const hashedPwSHA = cryptoJS.SHA3(salt + password).toString();
    const verified = hashedPW === hashedPwSHA;

    return verified;
  }
}

export const authService = new AuthService();
