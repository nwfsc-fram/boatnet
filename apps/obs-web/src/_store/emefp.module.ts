
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { EmefpState } from '@/_store/types/types';

Vue.use(Vuex);

export const state: EmefpState = {
    activeEmefp: null,
    filterText: ''
};

export const emefp: Module<EmefpState, RootState> = {
    namespaced: true,
    state,
  };
