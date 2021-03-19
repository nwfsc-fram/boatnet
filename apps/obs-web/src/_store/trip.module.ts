
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, TripState, VesselState } from '@/_store/types/types';
// import { trips } from '@/_store/data';
import { State, Action, Getter } from 'vuex-class';

Vue.use(Vuex);

export const state: TripState = {
  activeTrip: null,
  trips: [],
  newTrip: false,
  logTrip: false,
  index: null
};

const actions: ActionTree<TripState, RootState> = {
  setLogTrip({ commit}: any, choice: any) {
    commit('setLogTrip', choice);
  }
};

const mutations: MutationTree<TripState> = {
  setLogTrip(newState: any, val: any) {
    newState.logTrip = val;
  }
};

const getters: GetterTree<TripState, RootState> = {
  logTrip(getState: TripState) {
    return getState.logTrip;
  }
};

export const trip: Module<TripState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
  };
