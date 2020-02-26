
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { UserState } from '@/_store/types/types';
// import { users } from '@/_store/data';

Vue.use(Vuex);

const actions: ActionTree<UserState, RootState> = {
  setClosedTripsTable({ commit }: any, choice: boolean) {
    commit('setClosedTripsTable', choice);
  }
};

const mutations: MutationTree<UserState> = {
  setClosedTripsTable(newState: any, choice: boolean) {
    newState.closedTripsTable = choice;
  }
};

const getters: GetterTree<UserState, RootState> = {
  closedTripsTable(getState: UserState) {
    return getState.closedTripsTable;
  }
};

export const state: UserState = {
  users: [],
  newUser: false,
  activeUser: undefined,
  activeUserAlias: undefined,
  unLinkedApexUsers: [],
  captainMode: false,
  closedTripsTable: false
};

export const user: Module<UserState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
  };
