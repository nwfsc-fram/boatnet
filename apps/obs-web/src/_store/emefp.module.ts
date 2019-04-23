
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { EmefpState } from '@/_store/types/types';
import { permits } from '@/_store/data';

Vue.use(Vuex);

export const state: EmefpState = {
    activeEmefpPermit: null,
    filterText: ''
};

export const emefp: Module<EmefpState, RootState> = {
    namespaced: true,
    state,
  };
