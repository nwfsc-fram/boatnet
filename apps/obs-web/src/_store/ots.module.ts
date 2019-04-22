
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, OTSState } from '@/_store/types/types';
// import { otsTargets } from '@/_store/data';

Vue.use(Vuex);

export const state: OTSState = {activeOTSTarget: null};

export const ots: Module<OTSState, RootState> = {
    namespaced: true,
    state,
  };
