import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, defer, of } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { BoatnetUser, LoginResult } from './bn-auth.models';

import * as jsonwebtoken from 'jsonwebtoken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  public authedUser: BoatnetUser;

  /**
   * TODO: Better validation?
   * @param username username for validation against db
   */
  public validateUsername(username: string) {
    return new Promise((resolve, reject) => {
      // Maybe check for @ if we use email users
      if (username.length > 3) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  getPubKey(): Observable<string> {
    return this.http.get<any>('/api/pubkey').pipe(
      map(result => {
        return result.publicKey;
      })
    );
  }

  async login(user: string, pw: string): Promise<LoginResult> {
    try {
      const key = await this.getPubKey().toPromise();
      const loginResult = await this.loginKeyVerify(user, pw, key).toPromise();
      console.log(loginResult);
      if (loginResult) {
        return of({ user: loginResult}).toPromise();
      }
    } catch (err) {
      return of({ error: err.error.message }).toPromise();
    }
  }

  private loginKeyVerify(
    user: string,
    pw: string,
    pubKey: string
  ): Observable<BoatnetUser> {
    return this.http
      .post<any>('/api/login', {
        username: user,
        password: pw
      })
      .pipe(
        // TODO Decode JWT and verify signature
        map(result => {
          const verified = jsonwebtoken.verify(result.token, pubKey);
          console.log('[Service]', verified);
          this.authedUser = verified.sub;
          return this.authedUser;
        })
      );
    // See README.md for an example NgRx based utilization of this service
  }

  logout() {
    console.log('TODO: Logout functionality.');
    this.authedUser = undefined;
    // TODO remove user from local storage to log user out
    // localStorage.removeItem('currentUser');
  }

  getUserObs(): Observable<BoatnetUser> {
    return of(this.authedUser);
  }

  public isLoggedIn(): boolean {
    return !!this.authedUser;
  }

  public getCurrentUser(): BoatnetUser {
    // TODO localStorage
    // return JSON.parse(localStorage.getItem('currentUser'));

    return this.authedUser;
  }

  public getCurrentUsername(): string {
    // TODO
    const user = 'test'; // this.getCurrentUser();
    return user;
  }
}
