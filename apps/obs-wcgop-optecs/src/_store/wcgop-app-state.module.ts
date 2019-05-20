import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { WcgopAppState, RootState } from '@/_store/types/types';
import { WcgopTrip, BoatnetUser } from '@boatnet/bn-models';
import { pouchService } from '@boatnet/bn-pouch';

Vue.use(Vuex);

export const state: WcgopAppState = {
  currentSelectionId: undefined,
  currentTrip: undefined,
  isKeyboardEnabled: true,
  isSoundEnabled: true
};

const actions: ActionTree<WcgopAppState, RootState> = {
  setCurrentSelectionId({ commit }: any, id: string) {
    commit('setCurrentSelectionId', id);
  },
  saveTrip({ commit }: any, trip: WcgopTrip) {
    commit('saveTrip', trip);
  },
  setCurrentTrip({ commit }: any, trip: WcgopTrip) {
    commit('setCurrentTrip', trip);
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
  setCurrentSelectionId(newState: any, id: string) {
    newState.currentSelectionId = id;
  },
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
  setKeyboardStatus(newState: any, isEnabled: boolean) {
    newState.isKeyboardEnabled = isEnabled;
  },
  setSoundEnabled(newState: any, isEnabled: boolean) {
    newState.isSoundEnabled = isEnabled;
  }
};

const getters: GetterTree<WcgopAppState, RootState> = {
  currentSelectionId(getState: WcgopAppState) {
    return getState.currentSelectionId;
  },
  currentTrip(getState: WcgopAppState) {
    return getState.currentTrip;
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
