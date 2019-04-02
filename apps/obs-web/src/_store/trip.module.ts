// TODO Vuex Trip Module
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { TripState } from '@/_store/types/types';
import { trips } from '@/_store/data';

Vue.use(Vuex);

export const state: TripState = {activeTrip: trips[0]};

export const trip: Module<TripState, RootState> = {
    namespaced: true,
    state,
  };
