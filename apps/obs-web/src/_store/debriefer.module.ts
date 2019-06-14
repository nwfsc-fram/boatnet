import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { DebrieferState } from '@/_store/types/types';
// import { users } from '@/_store/data';

Vue.use(Vuex);

export const state: DebrieferState = {
 WcgopOperationTripDict: {}
};

export const debriefer: Module<DebrieferState, RootState> = {
    namespaced: true,
    state,
  };
