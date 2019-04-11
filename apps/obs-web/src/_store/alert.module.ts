import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { AlertState, RootState } from '@/_store/types/types';

Vue.use(Vuex);

export const state: AlertState = {
  type: null,
  message: null
};

const actions: ActionTree<AlertState, RootState> = {
  success({ commit }: any, message: string) {
    commit('success', message);
  },
  error({ commit }: any, message: string) {
    commit('error', message);
  },
  clear({ commit }: any, message: string) {
    commit('clear', message);
  }
};

const mutations: MutationTree<AlertState> = {
  success(newState: any, message: string) {
    newState.type = 'alert-success';
    newState.message = message;
  },
  error(newState: any, message: string) {
    newState.type = 'alert-danger';
    newState.message = message;
  },
  clear(newState: any) {
    newState.type = null;
    newState.message = null;
  }
};

export const alert: Module<AlertState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations
};
