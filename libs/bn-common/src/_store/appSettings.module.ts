import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, AppSettings } from './types/types';

Vue.use(Vuex);

const state: AppSettings = {
  isKeyboardEnabled: true,
  isSoundEnabled: true
};

const actions: ActionTree<AppSettings, RootState> = {
  setKeyboardStatus({ commit }: any, isEnabled: boolean) {
    commit('setKeyboardStatus', isEnabled);
  },
  setSoundEnabled({ commit }: any, isEnabled: boolean) {
    commit('setSoundEnabled', isEnabled);
  }
};

const mutations: MutationTree<AppSettings> = {
  setKeyboardStatus(newState: any, isEnabled: boolean) {
    newState.isKeyboardEnabled = isEnabled;
  },
  setSoundEnabled(newState: any, isEnabled: boolean) {
    newState.isSoundEnabled = isEnabled;
  }
};

const getters: GetterTree<AppSettings, RootState> = {
  isSoundEnabled(getState: AppSettings) {
    return getState.isSoundEnabled;
  }
};

export const appSettings: Module<AppSettings, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
