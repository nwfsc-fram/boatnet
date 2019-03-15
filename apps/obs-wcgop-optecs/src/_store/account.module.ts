// Vuex Account Module

// Typescript examples https://codeburst.io/vuex-and-typescript-3427ba78cfa8

import { userService } from '../_services';
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { AccountState, User, RootState } from '@/_store/types/types';

Vue.use(Vuex);

const userStored = localStorage.getItem('user');
let user: User | null = null;
if (userStored) {
  user = JSON.parse(userStored);
}

export const state: AccountState =  user
? { status: { loggedIn: true }, user }
: { status: {}, user: null };

const actions: ActionTree<AccountState, RootState> = {
  login({ dispatch, commit }: any, { username, password }: any) {
    commit('loginRequest', { username });

    userService.login(username, password).then(
      (u: any) => {
        commit('loginSuccess', u);
        router.push('/');
      },
      (error: any) => {
        commit('loginFailure', error);
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  logout({ commit }: any) {
    userService.logout();
    commit('logout');
  }
};

const mutations: MutationTree<AccountState> = {
  loginRequest(newState: any, newUser: any) {
    newState.status = { loggingIn: true };
    newState.user = newUser;
  },
  loginSuccess(newState: any, newUser: any) {
    newState.status = { loggedIn: true };
    newState.user = newUser;
  },
  loginFailure(newState: any) {
    newState.status = {};
    newState.user = null;
  },
  logout(newState: any) {
    newState.status = {};
    newState.user = null;
  }
};

export const account: Module<AccountState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations
};
