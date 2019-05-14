
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, ObserverAvailabilityState } from '@/_store/types/types';
// import { otsTargets } from '@/_store/data';

Vue.use(Vuex);

export const state: ObserverAvailabilityState = {activeActivity: null, isNewActivity: true};

export const obact: Module<ObserverAvailabilityState, RootState> = {
    namespaced: true,
    state,
  };
