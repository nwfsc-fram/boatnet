// Boatnet Auth Service Routines

/* tslint:disable:no-console */

// Typescript examples https://codeburst.io/vuex-and-typescript-3427ba78cfa8

import axios from 'axios';
import cryptoJS from 'crypto-js';

import jsonwebtoken from 'jsonwebtoken';
import pemjwk from 'pem-jwk';
import { BoatnetUserToken, BoatnetUser } from '../models/auth.model';

// const authedUserToken: BoatnetUserToken | undefined;

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

// TODO Refactor login routine commented out below
async function login(username: string, password: string) {

  const pubKey = await getPubKey();
  const userResponse = await axios.post('/api/v1/login', { username, password }).catch( (err) => {
    if (err.response.status === 401) {
      throw new Error('Invalid username or password.');
    } else {
      throw new Error(err);
    }
  });
  const user = userResponse.data;
  const verified: any = jsonwebtoken.verify(user.token, pubKey!); // ! is the non-null assertion operator
  verified.sub = JSON.parse(verified.sub); // parse JSON encoded sub
  storeUserToken(verified);
  // catchError(err => {
  //   if (err.status === 401) {
  //     return throwError('Invalid username or password.');
  //   }
  //   console.log('Getting stored user, because of error:', err);
  //   const storedUser = this.getStoredUserToken(username);
  //   if (!storedUser) {
  //     return throwError(
  //       'Unable to log in using cached credentials. Internet connection required.'
  //     );
  //   } else {
  //     const isStoredPwOK = this.checkPassword(storedUser, password);
  //     if (!isStoredPwOK) {
  //       return throwError('Invalid offline username or password.');
  //     } else {
  //       this.authedUserToken = storedUser;
  //       return of(this.authedUserToken);
  //     }
  //   }

  //     // login successful if there's a jwt token in the response
  //     if (user.token) {
  //       // store user details and jwt token in local storage to keep user logged in between page refreshes
  //       localStorage.setItem('user', JSON.stringify(user));
  //     }
}

// TODO Refactor logout routine commented out below
function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
}

function getStoredUser(): BoatnetUser | undefined {
  const userStored = localStorage.getItem('user');
  let user: BoatnetUser | undefined;
  if (userStored) {
    user = JSON.parse(userStored);
  }
  return user;
}

async function getPubKey() {
  // Gets public key for JWT verification.
  // Pull from localstorage for offline mode
  try {
    const result: any = await axios.get('/api/v1/pubkey');
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
  const bnUsers = localStorage.getItem('bn-users') || '';
  let usersMap = new Map(JSON.parse(bnUsers));
  if (!usersMap) {
    usersMap = new Map();
  }
  usersMap.set(userToken.sub.username, userToken);
  localStorage.setItem('bn-users', JSON.stringify([...usersMap]));
  console.log('Stored JWT for ', userToken.sub.username);
}

function getStoredUserToken(username: string): BoatnetUserToken | undefined {
  const bnUsers = localStorage.getItem('bn-users') || '';
  const storedUsers = new Map(JSON.parse(bnUsers));
  if (storedUsers && storedUsers.has(username)) {
    return storedUsers.get(username) as BoatnetUserToken;
  } else {
    return undefined;
  }
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

  const hashedPwSHA = cryptoJS.SHA512(salt + password).toString(); // For FIPS compliance, need SHA-512 layer
  const verified = hashedPW === hashedPwSHA;
  return verified;
}

function handleResponse(response: any) {
  return response.text().then((text: any) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        logout();
        // location.reload(true);
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

/*
  private loginKeyVerify(
    username: string,
    password: string,
    pubKey: string
  ): Observable<BoatnetUserToken> {
    return this.http
      .post<any>(this.authUrl + '/api/login', {
        username: username,
        password: password
      })
      .pipe(
        map(result => {
          const verified = jsonwebtoken.verify(result.token, pubKey);
          this.authedUserToken = verified;
          this.authedUserToken.sub = JSON.parse(verified.sub); // decode sub
          this.storeUserToken(this.authedUserToken);
          return this.authedUserToken;
        }),
        catchError(err => {
          if (err.status === 401) {
            return throwError('Invalid username or password.');
          }
          console.log('Getting stored user, because of error:', err);
          const storedUser = this.getStoredUserToken(username);
          if (!storedUser) {
            return throwError(
              'Unable to log in using cached credentials. Internet connection required.'
            );
          } else {
            const isStoredPwOK = this.checkPassword(storedUser, password);
            if (!isStoredPwOK) {
              return throwError('Invalid offline username or password.');
            } else {
              this.authedUserToken = storedUser;
              return of(this.authedUserToken);
            }
          }
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }



  login(user: string, pw: string): Observable<BoatnetUser> {
    // Login, and use cached credentials if unable to connect to login server.

    return this.getPubKey().pipe(
      // flattens Observable to its return value, exhaustMap only allows 1 login req. at a time
      exhaustMap(key => this.loginKeyVerify(user, pw, key)),
      map(result => {
        return result.sub; // pull user out of JWT
      }),
      catchError(err => {
        let errMsg = err;
        if (err.error) {
          errMsg = err.error.message;
        }
        return throwError(errMsg);
      })
    );
  }

  logout() {
    console.log('[AuthService] TODO: Logout functionality.');
    this.authedUserToken = undefined;
    // TODO remove user from local storage to log user out
    // localStorage.removeItem('currentUser');
  }

  public isLoggedIn(): boolean {
    return !!this.authedUserToken;
  }

  public getCurrentUser(): BoatnetUser {
    // TODO: Observable only?
    return this.authedUserToken ? this.authedUserToken.sub : undefined;
  }

  public getCurrentUsername(): string {
    // TODO
    const user = 'test'; // this.getCurrentUser();
    return user;
  }


}
*/

export const authService = {
  validateUsername,
  login,
  logout,
  getStoredUser
};
