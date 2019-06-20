
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { PermitState } from '@/_store/types/types';
// import { permits } from '@/_store/data';

Vue.use(Vuex);

export const state: PermitState = {
  activePermit: null,
  permits: [],
  vesselPermits: {},
  filterText: ''
};

export const permit: Module<PermitState, RootState> = {
    namespaced: true,
    state,
  };
