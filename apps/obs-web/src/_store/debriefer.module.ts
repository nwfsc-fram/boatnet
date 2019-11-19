import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { DebrieferState } from '@/_store/types/types';

Vue.use(Vuex);

export const state: DebrieferState = {
  tripIds: [],
  operationIds: [],
  catches: []
};

const actions: ActionTree<DebrieferState, RootState> = {
  addTripId({ commit }: any, tripId: string) {
    commit('addTripId', tripId);
  },
  removeTripId({ commit }: any, tripId: string) {
    commit('removeTripId', tripId);
  },
  addOperationId({ commit }: any, operationId: string) {
    commit('addOperationId', operationId);
  },
  removeOperationId({ commit }: any, operationId: string) {
    commit('removeOperationId', operationId);
  },
  addCatchId({ commit }: any, catchId: string) {
    commit('addCatchId', catchId);
  },
  removeCatchId({ commit }: any, catchId: string) {
    commit('removeCatchId', catchId);
  }
};

const mutations: MutationTree<DebrieferState> = {
  addTripId(newState: any, id: string) {
    newState.tripIds.push(id);
  },
  removeTripId(newState: any, id: string) {
    newState.tripIds.splice(state.tripIds.indexOf(id), 1);
  },
  addOperationId(newState: any, id: string) {
    newState.operationIds.push(id);
  },
  removeOperationId(newState: any, id: string) {
    newState.operationIds.splice(state.operationIds.indexOf(id), 1);
  },
  addCatchId(newState: any, id: string) {
    newState.catches.push(id);
  },
  removeCatchId(newState: any, id: string) {
    newState.catches.splice(state.catches.indexOf(id), 1);
  }
};

export const debriefer: Module<DebrieferState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations
  };
