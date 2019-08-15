// Vuex CouchDB Module

import { pouchService } from '../_services/pouch.service';
import moment from 'moment';
import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { CouchDBCredentials } from '@boatnet/bn-couch';
import { formatDate } from '@boatnet/bn-util';
import { PouchDBState, PouchDBSyncStatus } from './types/types';

Vue.use(Vuex);
const LS_LAST_SYNC_DATE = 'lastSyncDate';
const lastSync = localStorage.getItem(LS_LAST_SYNC_DATE);
export const state: PouchDBState = {
  credentials: null,
  syncStatus: { syncActive: false },
  lastSyncDate: lastSync ? lastSync : undefined
};

function activateSyncListener(commit: any) {
  // console.log('[PouchDB Module] Activate Sync Listener');
  // pouchService.$off('syncChanged');
  // pouchService.$off('syncCompleted');
  // pouchService.$off('syncProgress');
  pouchService.$on('syncChanged', (sync: PouchDBSyncStatus) => {
    commit('syncChanged', sync);
  });
  pouchService.$on('syncCompleted', (sync: PouchDBSyncStatus) => {
    commit('syncCompleted', sync);
  });
  pouchService.$on('syncProgress', (sync: PouchDBSyncStatus) => {
    commit('syncProgress', sync);
  });
}

const actions: ActionTree<PouchDBState, any> = {
  // Mutations are asynchronous
  async connect({ commit }: any, credentials: CouchDBCredentials) {
    activateSyncListener(commit);
    commit('connectRequest', credentials);
  },
  async reconnect({ commit }: any) {
    // will fail if credentials not already set
    activateSyncListener(commit);
    commit('reconnectRequest');
  },
  async disconnect({ commit }: any) {
    pouchService.$off('syncChanged');
    pouchService.$off('syncCompleted');
    pouchService.$off('syncProgress');
    commit('disconnect');
  },
  async addTest({ commit }: any, todoMsg: { message: string }) {
    commit('addTest', todoMsg);
  }
};

const mutations: MutationTree<PouchDBState> = {
  // Mutations must by synchronous
  connectRequest(newState: PouchDBState, credentials: CouchDBCredentials) {
    pouchService.connect(credentials);
    newState.credentials = credentials;
  },
  reconnectRequest(newState: PouchDBState) {
    if (!newState.credentials) {
      throw new Error('Please log out and back in for DB connection.');
    } else {
      pouchService.connect(newState.credentials);
    }
  },
  disconnect(newState: PouchDBState) {
    newState.syncStatus = { syncActive: false };
    pouchService.disconnect();
  },
  syncCompleted(newState: PouchDBState, status: PouchDBSyncStatus) {
    const date = moment().format();
    localStorage.setItem(LS_LAST_SYNC_DATE, date);
    newState.lastSyncDate = date;
    newState.syncStatus = status;
  },
  syncChanged(newState: PouchDBState, status: PouchDBSyncStatus) {
    const date = moment().format();
    localStorage.setItem(LS_LAST_SYNC_DATE, date);
    newState.lastSyncDate = date;
    newState.syncStatus = status;
  },
  syncProgress(newState: PouchDBState, status: PouchDBSyncStatus) {
    newState.syncStatus = status;
  }
};

const getters: GetterTree<PouchDBState, any> = {
  isSyncing(getState: PouchDBState) {
    return getState.syncStatus.syncActive;
  },
  syncDateFormatted(getState: PouchDBState) {
    if (getState.lastSyncDate) {
      return formatDate(getState.lastSyncDate);
    } else {
      return 'Never';
    }
  },
  allVessels(getState: PouchDBState) {
    // return pouchService.db.allDocs('lookups-dev');
  },
  syncStatus(getState: PouchDBState) {
    // return getState.syncStatus.dbInfo.info;
    const info = getState.syncStatus.dbInfo
      ? getState.syncStatus.dbInfo.info
      : undefined;
    if (info) {
      return info.direction + ': ' + info.change.docs_read + ' Pending: ' + info.change.pending;
    }
  }
};

export const pouchState: Module<PouchDBState, any> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
