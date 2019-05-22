import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { WcgopAppState, RootState } from '@/_store/types/types';
import { WcgopTrip, WcgopOperation, BoatnetUser } from '@boatnet/bn-models';
import { pouchService } from '@boatnet/bn-pouch';

Vue.use(Vuex);

export const state: WcgopAppState = {
  currentTrip: undefined,
  currentHaul: undefined,
  isKeyboardEnabled: true,
  isSoundEnabled: true
};

const actions: ActionTree<WcgopAppState, RootState> = {
  saveTrip({ commit }: any, trip: WcgopTrip) {
    commit('saveTrip', trip);
  },
  setCurrentTrip({ commit }: any, trip: WcgopTrip) {
    commit('setCurrentTrip', trip);
  },
  setCurrentHaul({ commit }: any, haul: WcgopOperation) {
    commit('setCurrentHaul', haul);
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
  saveTrip(newState: any, trip: WcgopTrip) {
    try {
      if (trip._id) {
        pouchService.db
          .put(pouchService.userDBName, trip)
          .then((response: any) => {
            trip._rev = response.rev;
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
