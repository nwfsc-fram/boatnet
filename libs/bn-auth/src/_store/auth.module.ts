// Vuex Auth Module

// Typescript examples https://codeburst.io/vuex-and-typescript-3427ba78cfa8

import { authService } from '../_services/auth.service';
import { BoatnetUser } from '../models/auth.model';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { AuthState } from '@boatnet/bn-auth';

Vue.use(Vuex);

const user = authService.getCurrentUser();

export const state: AuthState =  user
? { status: { isLoggedIn: true }, user }
: { status: {}, user: null };

const actions: ActionTree<AuthState, any> = {
  login({ dispatch, commit }: any, { username, password }: any) {
    commit('loginRequest', { username });
    authService.login(username, password).then(
      (u: BoatnetUser) => {
        // dispatch('alert/clear', {}, { root: true }); // TODO
        commit('loginSuccess', u);
        // router.push('/'); // TODO
      },
      (error: any) => {
        commit('loginFailure', error);
        // dispatch('alert/error', error, { root: true }); // TODO
      }
    );
  },
  logout({ commit }: any) {
    authService.logout();
    commit('logout');
  }
};

const mutations: MutationTree<AuthState> = {
  loginRequest(newState: any, newUser: any) {
    newState.status = { isLoggingIn: true };
    newState.user = newUser;
  },
  loginSuccess(newState: any, newUser: any) {
    newState.status = { isLoggedIn: true };
    newState.user = newUser;
  },
  loginFailure(newState: any, errorMsg: string) {
    newState.status = { error: { message: errorMsg } };
    newState.user = null;
  },
  logout(newState: any) {
    newState.status = {};
    newState.user = null;
  }
};

export const auth: Module<AuthState, any> = {
  namespaced: true,
  state,
  actions,
  mutations
};
