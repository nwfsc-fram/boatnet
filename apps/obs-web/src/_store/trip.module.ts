
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, TripState, VesselState } from '@/_store/types/types';
// import { trips } from '@/_store/data';
import { State, Action, Getter } from 'vuex-class';

Vue.use(Vuex);

export const state: TripState = {
  activeTrip: null,
  trips: [],
  newTrip: false,
};

// const getters: GetterTree<TripState, RootState> = {
//   openTrips(trip) {
//     return trips.filter(
//       (trip) => {
//         return trip.vessel.vesselName === state.activeVessel && trip.tripStatus === true;
//       }
//     )
//   }
// }

export const trip: Module<TripState, RootState> = {
    namespaced: true,
    state,
  };
