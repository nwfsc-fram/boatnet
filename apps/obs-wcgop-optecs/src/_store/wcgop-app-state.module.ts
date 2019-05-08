import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { WcgopAppState, RootState } from '@/_store/types/types';
import { WcgopTrip, BoatnetUser } from '@boatnet/bn-models';

Vue.use(Vuex);

export const state: WcgopAppState = {
  currentNavigation: undefined, // TODO could set this to current router location?
  currentTrip: undefined,
  isKeyboardEnabled: true,
  isSoundEnabled: true
};

const actions: ActionTree<WcgopAppState, RootState> = {
  setCurrentTrip({ commit }: any, trip: WcgopTrip) {
    commit('setCurrentTrip', trip);
  },
  clear({ commit }: any) {
    commit('setCurrentTrip', undefined);
  },
  navigate({ commit }: any, uri: string) {
    commit('navigate', uri);
  },
  navigateBack({ commit }: any) {
    commit('navigateBack');
  },
  setKeyboardStatus({ commit }: any, isEnabled: boolean) {
    commit('setKeyboardStatus', isEnabled);
  },
  setSoundEnabled({ commit }: any, isEnabled: boolean) {
    commit('setSoundEnabled', isEnabled);
  }
};

const mutations: MutationTree<WcgopAppState> = {
  setCurrentTrip(newState: any, trip: WcgopTrip) {
    // if (trip) {
    //   console.log('[AppState] Current trip:', trip.tripNum);
    // } else {
    //   console.log('[AppState] Cleared current trip');
    // }
    newState.currentTrip = trip;
  },
  navigate(newState: any, uri: string) {
    console.log('[AppState] TODO Navigate to', uri);
  },
  navigateBack(newState: any, uri: string) {
    console.log('[AppState] TODO Navigate to', uri);
  },
  setKeyboardStatus(newState: any, isEnabled: boolean) {
    newState.isKeyboardEnabled = isEnabled;
  },
  setSoundEnabled(newState: any, isEnabled: boolean) {
    newState.isSoundEnabled = isEnabled;
  }
};

const getters: GetterTree<WcgopAppState, RootState> = {
  currentTrip(getState: WcgopAppState) {
    return getState.currentTrip;
  },
  isSoundEnabled(getState: WcgopAppState) {
    return getState.isSoundEnabled;
  }
};

export const appState: Module<WcgopAppState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
