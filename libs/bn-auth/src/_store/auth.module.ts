// Vuex Auth Module

// Typescript examples:
// https://medium.com/coding-blocks/writing-vuex-modules-in-neat-typescript-classes-9bf7b505e7b5
// https://github.com/coding-blocks-archives/realworld-vue-typescript/blob/master/src/store/modules/users.ts

import { authService, BoatnetUser } from '@boatnet/bn-auth';

import Vue from 'vue';
import Vuex, { ActionTree, MutationTree } from 'vuex';
import { AuthState } from './types/types';
// import { Module } from 'module';

import {
  getModule,
  Module,
  Mutation,
  VuexModule,
  Action
} from 'vuex-module-decorators';

Vue.use(Vuex);

interface UserLoginInfo {
  username: string;
  password: string;
}

@Module({
  namespaced: true,
  name: 'auth',
  store: new Vuex.Store<AuthState>({}),
  dynamic: true // TODO: needed?
})
class Auth extends VuexModule implements AuthState {
  // public user = authService.getCurrentUser();
  public user: BoatnetUser | null = authService.getCurrentUser();
  public status: any = this.user ? { isLoggedIn: true } : {};

  @Mutation
  public loginRequest() {
    this.status = { isLoggingIn: true };
    this.user = null;
    authService.logout();
  }

  @Mutation
  public loginSuccess(newUser: BoatnetUser) {
    this.status = { isLoggedIn: true };
    this.user = newUser;
  }

  @Mutation
  public loginFailure() {
    this.status = {};
    this.user = null;
    authService.logout();
  }

  @Mutation
  public logout() {
    this.status = {};
    this.user = null;
    authService.logout();
  }

  @Action
  public async login(userLogin: UserLoginInfo) {
    try {
      this.loginRequest();
      const user = await authService.login(
        userLogin.username,
        userLogin.password
      );
      this.loginSuccess(user);
    } catch (error) {
      // TODO dispatch('alert/error', error, { root: true });
      this.loginFailure();
    }
  }
}

export const AuthModule = getModule(Auth);
