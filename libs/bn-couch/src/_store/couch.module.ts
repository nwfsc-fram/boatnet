// Vuex CouchDB Module

import { couchService } from '../_services/couch.service';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { CouchDBState, CouchDBCredentials } from './types/types';

Vue.use(Vuex);

export const state: CouchDBState =  { credentials: null };

const actions: ActionTree<CouchDBState, any> = {
  async connect({ dispatch, commit }: any, credentials: CouchDBCredentials) {
    commit('connectRequest', credentials);
    couchService.connect(credentials);
  },
  async reconnect({ commit }: any) {
    // will fail if credentials not already set
    commit('reconnectRequest');
  },
};

const mutations: MutationTree<CouchDBState> = {
  connectRequest(newState: any, credentials: CouchDBCredentials) {
    newState.credentials = credentials;
  },
  reconnectRequest(newState: CouchDBState) {
    if (!newState.credentials) {
      throw new Error('Please log out and back in for DB connection.');
    } else {
      couchService.connect(newState.credentials);
    }
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

export const baseCouch: Module<CouchDBState, any> = {
  namespaced: true,
  state,
  actions,
  mutations
};
