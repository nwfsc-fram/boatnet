
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, ObserverAssignmentState } from '@/_store/types/types';
// import { otsTargets } from '@/_store/data';

Vue.use(Vuex);

export const state: ObserverAssignmentState = {activeTrip: null};

export const oa: Module<ObserverAssignmentState, RootState> = {
    namespaced: true,
    state,
  };
