import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BoatnetUser } from './boatnet-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  testUser: BoatnetUser = {
    user: 'test',
    roles: ['test'],
    couchDBInfo: {
      urlRoot: 'test',
      readonlyDB: 'test',
      userDB: 'test'
    }
  };

  login(user: string, pw: string): Observable<BoatnetUser> {
    return this.http
      .post<BoatnetUser>('/api/login', {
        username: user,
        password: pw
      })
      .pipe(
        // TODO Decode JWT and verify signature
        map(result => {
          console.log(result);
          return this.testUser;
        })
      );
    // See README.md for an example NgRx based utilization of this service
  }
}
