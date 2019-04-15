import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { WcgopAppState, RootState } from '@/_store/types/types';
import { WcgopTrip, BoatnetUser } from '@boatnet/bn-models';

Vue.use(Vuex);

export const state: WcgopAppState = {
  currentNavigation: undefined, // TODO could set this to current router location?
  currentTrip: undefined
};

const actions: ActionTree<WcgopAppState, RootState> = {
  setCurrentTrip({ commit }: any, trip: WcgopTrip) {
    commit('setCurrentTrip', trip);
  },
  navigate({ commit }: any, uri: string) {
    commit('navigate', uri);
  },
  navigateBack({ commit }: any) {
    commit('navigateBack');
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
  }
};

export const appState: Module<WcgopAppState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations
};
