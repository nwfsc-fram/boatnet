
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { VesselState } from '@/_store/types/types';
// import { vessels } from '@/_store/data';
// import Vessel from '@boatnet/bn-models/models/_common';

Vue.use(Vuex);

export const state: VesselState = {
  activeVessel: {vesselName: 'Excalibur'}
};

// const actions: ActionTree<VesselState, RootState> = {

// }

// const mutations: MutationTree<VesselState> = {
//   setActiveVessel(newState: any, newVessel: Vessel) {
//     newState.vessel = newVessel;
//   }
// }

export const vessel: Module<VesselState, RootState> = {
    namespaced: true,
    state,
  };
