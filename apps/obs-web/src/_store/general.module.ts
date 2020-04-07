
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { GeneralState } from '@/_store/types/types';
import {
  portDecoder
} from '@/_store/data';

Vue.use(Vuex);

const getters: GetterTree<GeneralState, RootState> = {
  getOnlineStatus(getState: GeneralState) {
    return getState.isOnline;
  }
};

const actions: ActionTree<GeneralState, RootState> = {
  setOnlineStatus({ commit }: any, choice: boolean) {
    commit('setOnlineStatus', choice);
  }
};

const mutations: MutationTree<GeneralState> = {
  setOnlineStatus(newState: any, choice: boolean) {
    newState.isOnline = choice;
  }
};

export const state: GeneralState = {
  appVersion: '42',
  portDecoder,
  isOnline: true
};

export const general: Module<GeneralState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  };
