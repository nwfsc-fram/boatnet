// Vuex CouchDB Module

import { authService } from '@boatnet/bn-auth';
import { couchService } from '../_services/couch.service';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { AuthState } from '@boatnet/bn-auth';
import { CouchDBState, CouchDBCredentials } from './types/types';

Vue.use(Vuex);

const user = authService.getCurrentUser();

export const state: CouchDBState =  { credentials: null };

const actions: ActionTree<CouchDBState, any> = {
  connect({ dispatch, commit }: any, credentials: CouchDBCredentials) {
    commit('connectRequest', credentials); // TODO connection
    couchService.connect(credentials);
  },
  logout({ commit }: any) {
    // authService.logout();
    // commit('logout');
  }
};

const mutations: MutationTree<CouchDBState> = {
  connectRequest(newState: any, credentials: CouchDBCredentials) {
    newState.credentials = credentials;
  },
  loginSuccess(newState: any, newUser: any) { // TODO
    // newState.status = { isLoggedIn: true };
    // newState.user = newUser;
  },
  loginFailure(newState: any, errorMsg: string) { // TODO
    // newState.status = { error: { message: errorMsg } };
    // newState.user = null;
  },
  logout(newState: any) { // TODO
    // newState.status = {};
    // newState.user = null;
  }
};

export const baseCouch: Module<CouchDBState, any> = {
  namespaced: true,
  state,
  actions,
  mutations
};
