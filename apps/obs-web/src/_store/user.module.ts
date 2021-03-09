
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
  },
  setShowLogbookRetained({ commit}: any, choice: boolean) {
    commit('setShowLogbookRetained', choice);
  },
  setAutoHideMenu({ commit }: any, choice: boolean) {
    commit('setAutoHideMenu', choice);
  },
  setShowOpenEmTrips({ commit}: any, choice: boolean) {
    commit('setShowOpenEmTrips', choice);
  }
};

const mutations: MutationTree<UserState> = {
  setClosedTripsTable(newState: any, choice: boolean) {
    newState.closedTripsTable = choice;
  },
  setShowLogbookRetained(newState: any, choice: boolean) {
    newState.showLogbookRetained = choice;
  },
  setAutoHideMenu(newState: any, choice: boolean) {
    newState.autoHideMenu = choice;
  },
  setShowOpenEmTrips(newState: any, choice: boolean) {
    newState.showOpenEmTrips = choice;
  }
};

const getters: GetterTree<UserState, RootState> = {
  closedTripsTable(getState: UserState) {
    return getState.closedTripsTable;
  },
  showLogbookRetained(getstate: UserState) {
    return getstate.showLogbookRetained;
  },
  autoHideMenu(getstate: UserState) {
    return getstate.autoHideMenu;
  },
  showOpenEmTrips(getstate: UserState) {
    return getstate.showOpenEmTrips;
  }
};

export const state: UserState = {
  users: [],
  newUser: false,
  activeUser: undefined,
  activeUserAlias: undefined,
  unLinkedApexUsers: [],
  captainMode: false,
  closedTripsTable: false,
  showLogbookRetained: true,
  autoHideMenu: true,
  showOpenEmTrips: false
};

export const user: Module<UserState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
  };
