import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree, Store } from 'vuex';
import { RootState, AppSettings, BoatnetConfig } from './types/types';
import { pouchService } from '@boatnet/bn-pouch';

Vue.use(Vuex);

const state: AppSettings = {
  isKeyboardEnabled: true,
  isSoundEnabled: true,
  appMode: 'wcgop',
  appConfig: undefined
};

const actions: ActionTree<AppSettings, RootState> = {
  setKeyboardStatus({ commit }: any, isEnabled: boolean) {
    commit('setKeyboardStatus', isEnabled);
  },
  setSoundEnabled({ commit }: any, isEnabled: boolean) {
    commit('setSoundEnabled', isEnabled);
  },
  setAppMode({ commit }: any, appMode: string) {
    commit('setAppMode', appMode);
  },
 async setAppConfig({ commit }: any) {
    await commit('setAppConfig');
  }
};

const mutations: MutationTree<AppSettings> = {
  setKeyboardStatus(newState: any, isEnabled: boolean) {
    newState.isKeyboardEnabled = isEnabled;
  },
  setSoundEnabled(newState: any, isEnabled: boolean) {
    newState.isSoundEnabled = isEnabled;
  },
  setAppMode(newState: any, appMode: string) {
    newState.appMode = appMode;
  },
  async setAppConfig(newState: any) {
    try {
      const db = pouchService.db;
      const queryOptions = {
        limit: 1,
        start_key: newState.appMode,
        inclusive_end: true,
        descending: false,
        include_docs: true
      };
      const config = await db.query(
        pouchService.lookupsDBName,
        'LookupDocs/boatnet-config-lookup',
        queryOptions
      );
      console.log('got the goods ' + config.rows[0].doc);
      newState.appConfig = config.rows[0].doc;
    } catch (err) {
      console.log(err);
    }
  }
};

const getters: GetterTree<AppSettings, RootState> = {
  isSoundEnabled(getState: AppSettings) {
    return getState.isSoundEnabled;
  },
  appMode(getState: AppSettings) {
    return getState.appMode;
  },
  appConfig(getState: AppSettings) {
    return getState.appConfig;
  }
};

export const appSettings: Module<AppSettings, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
