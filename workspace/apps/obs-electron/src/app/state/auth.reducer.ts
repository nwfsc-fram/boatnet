import { Action } from '@ngrx/store';
import { AuthActions, AuthActionTypes } from '../auth/actions/auth.actions';
import { BoatnetUser } from '@boatnet/bn-auth';

export interface State {
  user: BoatnetUser | null;
}

export const initialState: State = {
  user: null
};

export function reducer(state = initialState, action: AuthActions): State {
  switch (action.type) {
    case AuthActionTypes.LoginSuccess:
      return { ...state, user: action.payload.user };

    case AuthActionTypes.Logout:
      return initialState;

    default:
      return state;
  }
}

export const selectUser = (state: State) => state.user;
