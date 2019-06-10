import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { WcgopAppState, RootState } from '@/_store/types/types';
import { WcgopTrip, WcgopOperation, BoatnetUser, WcgopCatch } from '@boatnet/bn-models';
import { pouchService } from '@boatnet/bn-pouch';

Vue.use(Vuex);

export const state: WcgopAppState = {
  currentTrip: undefined,
  currentHaul: undefined,
  currentCatch: undefined,
  isKeyboardEnabled: true,
  isSoundEnabled: true
};

const actions: ActionTree<WcgopAppState, RootState> = {
  save({ commit }: any, trip: WcgopTrip) {
    commit('save', trip);
  },
  setCurrentTrip({ commit }: any, trip: WcgopTrip) {
    commit('setCurrentTrip', trip);
  },
  setCurrentHaul({ commit }: any, haul: WcgopOperation) {
    commit('setCurrentHaul', haul);
  },
  setCurrentCatch({ commit }: any, wCatch: WcgopCatch) {
    commit('setCurrentCatch', wCatch);
  },
  clear({ commit }: any) {
    commit('setCurrentTrip', undefined);
  },
  setKeyboardStatus({ commit }: any, isEnabled: boolean) {
    commit('setKeyboardStatus', isEnabled);
  },
  setSoundEnabled({ commit }: any, isEnabled: boolean) {
    commit('setSoundEnabled', isEnabled);
  }
};

const mutations: MutationTree<WcgopAppState> = {
  save(newState: any, record: any) {
    try {
      if (record._id) {
        pouchService.db
          .put(pouchService.userDBName, record)
          .then((response: any) => {
            record._rev = response.rev;
          });
      }
    } catch (err) {
      console.log('not properly save to the database');
    }
  },
  setCurrentTrip(newState: any, trip: WcgopTrip) {
    newState.currentTrip = trip;
  },
  setCurrentHaul(newState: any, haul: WcgopOperation) {
    newState.currentHaul = haul;
  },
  setCurrentCatch(newState: any, wCatch: WcgopCatch) {
    newState.currentHaul = wCatch;  // catch is a reserved keyword
  },
  setKeyboardStatus(newState: any, isEnabled: boolean) {
    newState.isKeyboardEnabled = isEnabled;
  },
  setSoundEnabled(newState: any, isEnabled: boolean) {
    newState.isSoundEnabled = isEnabled;
  }
};

const getters: GetterTree<WcgopAppState, RootState> = {
  currentTrip(getState: WcgopAppState) {
    return getState.currentTrip;
  },
  currentHaul(getState: WcgopAppState) {
    return getState.currentHaul;
  },
  currentCatch(getState: WcgopAppState) {
    return getState.currentCatch;
  },
  isSoundEnabled(getState: WcgopAppState) {
    return getState.isSoundEnabled;
  }
};

export const appState: Module<WcgopAppState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
