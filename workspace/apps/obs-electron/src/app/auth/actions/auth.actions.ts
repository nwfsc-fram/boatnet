import { Action } from '@ngrx/store';
import { Credentials } from '../models/authentication.model';
import { BoatnetUser } from '@boatnet/bn-auth'; // TODO

export enum AuthActionTypes {
  Login = '[Login Screen] Login',
  LoginSuccess = '[Auth API] Login Success',
  LoginFailure = '[Auth API] Login Failure',
  Logout = '[Login Screen] Logout',
  LogoutComplete = '[Auth API] Logout Complete'
}

export class Login implements Action {
  readonly type = AuthActionTypes.Login;

  constructor(public payload: Credentials) {}
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.LoginSuccess;

  constructor(public payload: { user: BoatnetUser }) {}
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.LoginFailure;

  constructor(public payload: any) {}
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export class LogoutComplete implements Action {
  readonly type = AuthActionTypes.LogoutComplete;
}

export type AuthActions =
  | Login
  | LoginSuccess
  | LoginFailure
  | Logout
  | LogoutComplete;
