import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { User } from 'bn-models';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthenticationService {
  /**
   * If AUTH_VER changes, user will need to log in again
   */
  private static AUTH_VER = 2;

  private _currentUser: User;
  private userSubject = new Subject<User>();

  /**
   * TODO: Implement for real auth server + offline
   * @param username username for validation against db
   */
  public validateUsername(username: string) {
    return new Promise((resolve, reject) => {
      if (username.length > 3) {
        // TEMPORARY
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  private userChange(user: User) {
    this._currentUser = user;
    this.userSubject.next(user);
  }

  /**
   * Temporary - Need to implement
   */
  checkPrograms(username: string) {
    if (username.length > 0) {
      return [
        { value: '1', desc: 'Limited Entry' },
        { value: '2', desc: 'ASHOP' },
        { value: '3', desc: 'Open Access' },
        { value: '4', desc: 'Catch Shares' }
      ];
    } else {
      return [];
    }
  }

  constructor(private http: HttpClient) {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.validateAuthVersion(storedUser)) {
      this.userChange(storedUser);
    } else {
      this.logout();
    }
  }

  /**
   * Validate version number returned by auth
   * @param user auth result (not necessarily a User)
   */
  validateAuthVersion(user: any) {
    if (
      user &&
      user.authVersion &&
      user.authVersion === AuthenticationService.AUTH_VER
    ) {
      return true;
    } else {
      return false;
    }
  }

  isLoggedIn(): boolean {
    return !!this._currentUser;
  }

  /**
   * Perform RESTful login call
   * @param username Username - apexuseradmin style
   * @param password Password
   */
  login(username: string, password: string) {
    return this.http
      .post<any>('/api/authenticate', {
        username: username,
        password: password
      })
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          console.log('Login success:', user.username);

          if (!this.validateAuthVersion(user)) {
            console.log(
              `WARNING: User auth version ${
                user.authVersion
              } mismatch, should be ${AuthenticationService.AUTH_VER}`
            );
          }
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.userChange(user);
            return user;
          } else {
            this.userChange(null);
            return null;
          }
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.userChange(null);
  }

  /**
   * Get current User object (observable.)
   */
  getUserObs(): Observable<User> {
    return this.userSubject.asObservable();
  }

  public getCurrentUser(): User {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  public getCurrentUsername(): string {
    const user = this.getCurrentUser();
    return user ? user.username : undefined;
  }
}
