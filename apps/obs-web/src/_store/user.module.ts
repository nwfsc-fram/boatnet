
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
  setShowLogbookRetained({ commit }: any, choice: boolean) {
    commit('setShowLogbookRetained', choice);
  },
  setAutoHideMenu({ commit }: any, choice: boolean) {
    commit('setAutoHideMenu', choice);
  },
  setShowOpenEmTrips({ commit }: any, choice: boolean) {
    commit('setShowOpenEmTrips', choice);
  },
  setObserverMode({ commit }: any, choice: boolean) {
    commit('setObserverMode', choice);
  },
  setCaptainMode({ commit }: any, choice: boolean) {
    commit('setCaptainMode', choice);
  },
  setUserRoles({ commit }: any, roles: string[]) {
    commit('setUserRoles', roles);
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
  },
  setObserverMode(newState: any, choice: boolean) {
    newState.observerMode = choice;
  },
  setCaptainMode(newState: any, choice: boolean) {
    newState.captainMode = choice;
  },
  setUserRoles(newState: any, roles: string[]) {
    newState.userRoles = roles;
  }
};

const getters: GetterTree<UserState, RootState> = {
  closedTripsTable(getState: UserState) {
    return getState.closedTripsTable;
  },
  showLogbookRetained(getState: UserState) {
    return getState.showLogbookRetained;
  },
  autoHideMenu(getState: UserState) {
    return getState.autoHideMenu;
  },
  showOpenEmTrips(getState: UserState) {
    return getState.showOpenEmTrips;
  },
  getCaptainMode(getState: UserState) {
    return getState.captainMode;
  },
  getObserverMode(getState: UserState) {
    return getState.observerMode;
  },
  getUserRoles(getState: UserState) {
    return getState.userRoles;
  }
};

export const state: UserState = {
  users: [],
  newUser: false,
  activeUser: undefined,
  activeUserAlias: undefined,
  unLinkedApexUsers: [],
  captainMode: false,
  observerMode: false,
  closedTripsTable: false,
  showLogbookRetained: true,
  autoHideMenu: true,
  showOpenEmTrips: false,
  userRoles: []
};

export const user: Module<UserState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
  };
