
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { GeneralState } from '@/_store/types/types';
import {
  // fisheries,
  // targetTypes,
  roles,
  usStates,
  portGroups,
  portDecoder,
  // otsTargets,
  // vessels,
  notificationOptions } from '@/_store/data';
// import Vessel from '@boatnet/bn-models/models/_common';

Vue.use(Vuex);

export const state: GeneralState = {
  // fisheries,
  // targetTypes,
  roles,
  usStates,
  portGroups,
  portDecoder,
  // otsTargets,
  // vessels,
  notificationOptions,
  // activeTarget: otsTargets[0]
};

export const general: Module<GeneralState, RootState> = {
    namespaced: true,
    state,
  };
