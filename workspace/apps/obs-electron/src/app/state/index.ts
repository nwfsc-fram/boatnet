import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromAuth from './auth.reducer';
import * as fromLoginPage from './login-page.reducer';
import * as fromVessels from '../data-layer/vessel/vessel.reducer';

export interface State {
  auth: fromAuth.State;
  loginPage: fromLoginPage.State;
  vessels: fromVessels.VesselsState;
}

export const reducers: ActionReducerMap<State> = {
  auth: fromAuth.reducer,
  loginPage: fromLoginPage.reducer,
  vessels: fromVessels.reducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? []
  : [];

export const selectAuthState = createFeatureSelector<fromAuth.State>('auth');
export const selectAuthUser = createSelector(
  selectAuthState,
  fromAuth.selectUser
);
export const selectIsLoggedIn = createSelector(
  selectAuthUser,
  user => !!user
);

export const selectLoginPageState = createFeatureSelector<fromLoginPage.State>(
  'loginPage'
);
export const selectLoginPagePending = createSelector(
  selectLoginPageState,
  fromLoginPage.selectPending
);
export const selectLoginPageError = createSelector(
  selectLoginPageState,
  fromLoginPage.selectError
);

// Vessels
export const selectVesselsState = createFeatureSelector<
  fromVessels.VesselsState
>('vessels');

// export const selectAllVessels = createSelector(
//   selectVesselsState,
//   fromVessels.selectAll
// );
