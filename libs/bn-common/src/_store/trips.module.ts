import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState, TripState } from './types/types';
import { Base, BaseTrip, BaseOperation, BaseCatch } from '@boatnet/bn-models';
import { pouchService } from '@boatnet/bn-pouch';

Vue.use(Vuex);

const state: TripState = {
  currentCruise: undefined,
  currentTrip: undefined,
  currentHaul: undefined,
  currentCatch: undefined
};

const actions: ActionTree<TripState, RootState> = {
  save({ commit }: any, trip: BaseTrip) {
    commit('save', trip);
  },
  setCurrentCruise({ commit }: any, cruise: Base) {
    commit('setCurrentCruise', cruise);
  },
  setCurrentTrip({ commit }: any, trip: BaseTrip) {
    commit('setCurrentTrip', trip);
  },
  setCurrentHaul({ commit }: any, haul: BaseOperation) {
    commit('setCurrentHaul', haul);
  },
  setCurrentCatch({ commit }: any, wCatch: BaseCatch) {
    commit('setCurrentCatch', wCatch);
  },
  clear({ commit }: any) {
    commit('setCurrentTrip', undefined);
  },
};

const mutations: MutationTree<TripState> = {
  save(newState: any, record: any) {
    try {
      if (record._id) {
        pouchService.db
          .put(record)
          .then((response: any) => {
            record._rev = response.rev;
          });
      }
    } catch (err) {
      console.log('not properly save to the database');
    }
  },
  setCurrentCruise(newState: any, cruise: Base) {
    newState.currentCruise = cruise;
  },
  setCurrentTrip(newState: any, trip: BaseTrip) {
    newState.currentTrip = trip;
  },
  setCurrentHaul(newState: any, haul: BaseOperation) {
    newState.currentHaul = haul;
  },
  setCurrentCatch(newState: any, wCatch: BaseCatch) {
    newState.currentCatch = wCatch;  // catch is a reserved keyword
  }
};

const getters: GetterTree<TripState, RootState> = {
  currentCruise(getState: TripState) {
    return getState.currentCruise;
  },
  currentTrip(getState: TripState) {
    return getState.currentTrip;
  },
  currentHaul(getState: TripState) {
    return getState.currentHaul;
  },
  currentCatch(getState: TripState) {
    return getState.currentCatch;
  }
};

export const tripsState: Module<TripState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
