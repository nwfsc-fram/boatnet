import { userService } from '../_services';
import { router } from '../_helpers';

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const userStored = localStorage.getItem('user');
let user: any;

if (userStored) {
  user = JSON.parse(userStored);
}

const state = user
  ? { status: { loggedIn: true }, user }
  : { status: {}, user: null };

const actions = {
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

const mutations = {
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

export const account = {
  namespaced: true,
  state,
  actions,
  mutations
};
