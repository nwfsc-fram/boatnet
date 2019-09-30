import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, AppSettings } from './types/types';

Vue.use(Vuex);

const state: AppSettings = {
  isKeyboardEnabled: true,
  isSoundEnabled: true,
  appMode: 'wcgop',
  validAppViews: undefined
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
  setValidAppViews({ commit }: any, validAppViews: string[]) {
    commit('setValidAppViews', validAppViews);
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
  setValidAppViews(newState: any, validAppViews: string[]) {
    newState.validAppViews = validAppViews;
  }
};

const getters: GetterTree<AppSettings, RootState> = {
  isSoundEnabled(getState: AppSettings) {
    return getState.isSoundEnabled;
  },
  appMode(getState: AppSettings) {
    return getState.appMode;
  },
  validAppViews(getState: AppSettings) {
    return getState.validAppViews;
  }
};

export const appSettings: Module<AppSettings, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
