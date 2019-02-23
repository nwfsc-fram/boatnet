import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, exhaustMap, catchError, tap, mergeMap } from 'rxjs/operators';
import { of, empty } from 'rxjs';
import {
  AuthActions,
  AuthActionTypes,
  Login,
  LoginSuccess,
  LoginFailure
} from '../actions/auth.actions';
// import { AuthService } from '../services/auth.service';
import { AuthService } from 'bn-auth';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

@Injectable()
export class AuthEffects {
  @Effect()
  login$ = this.actions$.pipe(
    ofType<Login>(AuthActionTypes.Login),
    map(action => action.payload),
    exhaustMap(auth =>
      this.authService.login(auth.username, auth.password).pipe(
        map(user => new LoginSuccess({ user })),
        catchError(error => of(new LoginFailure(error)))
      )
    )
  );

  @Effect({ dispatch: false })
  loginRedirect$ = this.actions$.pipe(
    ofType<LoginSuccess>(AuthActionTypes.LoginSuccess),
    tap(() => this.router.navigate(['/home']))
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private dialogService: MatDialog
  ) {}
}
