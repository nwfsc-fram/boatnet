import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { CATCH_STACK_VAR } from '@angular/compiler/src/output/abstract_emitter';

const fakeUsers = require('./fake-users.json');

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  private static BACKEND_AUTH_VER = 2;

  // WS - Refactored to pipe syntax
  // https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md#pipe-syntax
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const users: any[] = (<any>fakeUsers).users;

    // wrap in delayed observable to simulate server api call
    return of(null).pipe(
      mergeMap(() => {
        // authenticate
        if (
          request.url.endsWith('/api/authenticate') &&
          request.method === 'POST'
        ) {
          // find if any user matches login credentials
          let filteredUsers = users.filter(user => {
            return (
              user.username === request.body.username &&
              user.password === request.body.password
            );
          });

          // TEMP: Also allow any username - map to Test user (needs test pw)
          if (filteredUsers.length === 0) {
            filteredUsers = users.filter(user => {
              return (
                user.username === 'test' &&
                user.password === request.body.password
              );
            });
          }

          if (filteredUsers.length) {
            // if login details are valid return 200 OK with user details and fake jwt token
            const user = filteredUsers[0];
            const body = {
              id: user.id,
              username: request.body.username, // user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              pwexpiry: user.pwexpiry,
              roles: user.roles,
              token: 'fake-jwt-token',
              authVersion: FakeBackendInterceptor.BACKEND_AUTH_VER
            };

            return of(new HttpResponse({ status: 200, body: body }));
          } else {
            // else return 400 bad request
            return throwError('Username or password is incorrect');
          }
        }

        // get users
        if (request.url.endsWith('/api/users') && request.method === 'GET') {
          // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
          if (
            request.headers.get('Authorization') === 'Bearer fake-jwt-token'
          ) {
            return of(new HttpResponse({ status: 200, body: users }));
          } else {
            // return 401 not authorised if token is null or invalid
            return throwError('Unauthorised');
          }
        }

        // get user by id
        if (
          request.url.match(/\/api\/users\/\d+$/) &&
          request.method === 'GET'
        ) {
          // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
          if (
            request.headers.get('Authorization') === 'Bearer fake-jwt-token'
          ) {
            // find user by id in users array
            const urlParts = request.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 1], 10);
            const matchedUsers = users.filter(matched => {
              return matched.id === id;
            });
            const user = matchedUsers.length ? matchedUsers[0] : null;

            return of(new HttpResponse({ status: 200, body: user }));
          } else {
            // return 401 not authorised if token is null or invalid
            return throwError('Unauthorised');
          }
        }

        // create user
        if (request.url.endsWith('/api/users') && request.method === 'POST') {
          // get new user object from post body
          const newUser = request.body;

          // validation
          const duplicateUser = users.filter(user => {
            return user.username === newUser.username;
          }).length;
          if (duplicateUser) {
            return throwError(
              'Username "' + newUser.username + '" is already taken'
            );
          }

          // save new user
          newUser.id = users.length + 1;
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));

          // respond 200 OK
          return of(new HttpResponse({ status: 200 }));
        }

        // delete user
        if (
          request.url.match(/\/api\/users\/\d+$/) &&
          request.method === 'DELETE'
        ) {
          // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
          if (
            request.headers.get('Authorization') === 'Bearer fake-jwt-token'
          ) {
            // find user by id in users array
            const urlParts = request.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 1], 10);
            for (let i = 0; i < users.length; i++) {
              const user = users[i];
              if (user.id === id) {
                // delete user
                users.splice(i, 1);
                localStorage.setItem('users', JSON.stringify(users));
                break;
              }
            }

            // respond 200 OK
            return of(new HttpResponse({ status: 200 }));
          } else {
            // return 401 not authorised if token is null or invalid
            return throwError('Unauthorised');
          }
        }

        // pass through any requests not handled above
        return next.handle(request);
      }),
      // call materialize and dematerialize to ensure delay,
      // even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
      materialize(),
      delay(500),
      dematerialize()
    );
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
