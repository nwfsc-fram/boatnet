// Vuex CouchDB Module

import { authService } from '@boatnet/bn-auth';
import { pouchService } from '../_services/pouch.service';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { AuthState } from '@boatnet/bn-auth';
import { CouchDBCredentials } from '@boatnet/bn-couch';
import { PouchDBState } from './types/types';

Vue.use(Vuex);

const user = authService.getCurrentUser();

export const state: PouchDBState =  { credentials: null };

const actions: ActionTree<PouchDBState, any> = {
  connect({ dispatch, commit }: any, credentials: CouchDBCredentials) {
    commit('connectRequest', credentials);
    pouchService.connect(credentials);
  },
  disconnect({ commit }: any) { // TODO
    // authService.logout();
    // commit('logout');
  }
};

const mutations: MutationTree<PouchDBState> = {
  connectRequest(newState: any, credentials: CouchDBCredentials) {
    newState.credentials = credentials;
  },
  connectSuccess(newState: any, newUser: any) { // TODO
    // newState.status = { isLoggedIn: true };
    // newState.user = newUser;
  },
  connectFailure(newState: any, errorMsg: string) { // TODO
    // newState.status = { error: { message: errorMsg } };
    // newState.user = null;
  },
  disconnect(newState: any) { // TODO
    // newState.status = {};
    // newState.user = null;
  }
};

export const basePouch: Module<PouchDBState, any> = {
  namespaced: true,
  state,
  actions,
  mutations
};
