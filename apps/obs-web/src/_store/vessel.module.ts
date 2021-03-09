
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { VesselState } from '@/_store/types/types';
// import { vessels } from '@/_store/data';
// import Vessel from '@boatnet/bn-models/models/_common';

Vue.use(Vuex);

export const state: VesselState = {
  activeVessel: undefined,
  filterText: ''
};

const actions: ActionTree<VesselState, RootState> = {
  setActiveVessel({ commit}: any, choice: any) {
    commit('setActiveVessel', choice);
  }
};

const mutations: MutationTree<VesselState> = {
  setActiveVessel(newState: any, val: any) {
    newState.activeVessel = val;
  }
};

export const vessel: Module<VesselState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations
  };
