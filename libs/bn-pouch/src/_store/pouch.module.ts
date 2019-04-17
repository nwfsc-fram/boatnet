// Vuex CouchDB Module

import { authService } from '@boatnet/bn-auth';
import { pouchService } from '../_services/pouch.service';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { AuthState } from '@boatnet/bn-auth';
import { CouchDBCredentials } from '@boatnet/bn-couch';
import { PouchDBState, PouchDBSyncStatus } from './types/types';

Vue.use(Vuex);

export const state: PouchDBState = {
  credentials: null,
  syncStatus: { syncActive: false }
};

const actions: ActionTree<PouchDBState, any> = { // Mutations are asynchronous
  async connect({ commit }: any, credentials: CouchDBCredentials) {
    commit('connectRequest', credentials);
    pouchService.$on('sync', (sync: PouchDBSyncStatus) => {
      commit('syncChanged', sync);
    });
  },
  async disconnect({ commit }: any) {
    commit('disconnect');
  },
  async addTest({ commit }: any, todoMsg: { message: string }) {
    commit('addTest', todoMsg);
    // authService.logout();
    // commit('logout');
  }
};

const mutations: MutationTree<PouchDBState> = { // Mutations must by synchronous
  connectRequest(newState: any, credentials: CouchDBCredentials) {
    pouchService.connect(credentials);
    newState.credentials = credentials;
  },
  disconnect(newState: any) {
    newState.syncStatus = { syncActive: false };
    pouchService.$off('sync');
  },
  syncChanged(newState: any, status: PouchDBSyncStatus) {
    newState.syncStatus = status;
  },
  addTest(newState: any, testMsg: { message: string }) {
    pouchService.addTestRow(testMsg);
  }
};

export const pouchState: Module<PouchDBState, any> = {
  namespaced: true,
  state,
  actions,
  mutations
};
