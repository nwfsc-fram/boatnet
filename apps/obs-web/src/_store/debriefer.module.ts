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
  setTripIds({ commit }: any, tripId: string) {
    commit('setTripIds', tripId);
  },
  setCruiseIds({ commit }: any, cruiseId: string) {
    commit('setCruiseIds', cruiseId);
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
  setTripIds(newState: any, ids: string[]) {
    newState.tripIds = ids;
  },
  setCruiseIds(newState: any, ids: string) {
    newState.cruiseIds = ids;
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
