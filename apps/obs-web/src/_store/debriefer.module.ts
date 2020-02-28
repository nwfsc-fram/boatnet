import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { DebrieferState } from '@/_store/types/types';

Vue.use(Vuex);

export const state: DebrieferState = {
  program: '',
  cruiseIds: '',
  observers: '',
  evaluationPeriod: {},
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
  },
  updateProgram({ commit }: any, value: string) {
    commit('updateVal', {id: 'program', val: value});
  },
  updateCruise({ commit }: any, value: string) {
    commit('updateVal', {id: 'cruiseIds', val: value});
  },
  updateObservers({ commit }: any, value: string) {
    commit('updateVal', {id: 'observers', val: value});
  },
  updateEvaluationPeriod({ commit }: any, value: any) {
    commit('updateVal', {id: 'evaluationPeriod', val: value});
  }
};

const mutations: MutationTree<DebrieferState> = {
  updateVal(newState: any, val: any) {
    newState[val.id] = val.val;
  },
  addTripId(newState: any, id: string) {
    newState.tripIds.splice(newState.tripIds.length, 1, id);
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

const getters: GetterTree<DebrieferState, RootState> = {
  tripIds(getState: DebrieferState) {
    return getState.tripIds;
  }
};

export const debriefer: Module<DebrieferState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
  };
