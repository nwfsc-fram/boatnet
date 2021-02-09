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
  tripSearchFilters: {},
  tripIds: [],
  displayColumns: {},
  trips: [],
  selectedOperations: [],
  operations: [],
  specimens: [],
  filters: {},
  errors: []
};

const actions: ActionTree<DebrieferState, RootState> = {
  setTripIds({ commit }: any, tripId: string) {
    commit('setTripIds', tripId);
  },
  setCruiseIds({ commit }: any, cruiseId: string) {
    commit('setCruiseIds', cruiseId);
  },
  updateProgram({ commit }: any, value: string) {
    commit('updateVal', {id: 'program', val: value});
  },
  updateObservers({ commit }: any, value: string) {
    commit('updateVal', {id: 'observers', val: value});
  },
  updateEvaluationPeriod({ commit }: any, value: any) {
    commit('updateVal', {id: 'evaluationPeriod', val: value});
  },
  updateTripSearchFilters({ commit }: any, value: any) {
    commit('updateVal', {id: 'tripSearchFilters', val: value});
  },
  updateTrips({ commit }: any, value: any) {
    commit('updateVal', {id: 'trips', val: value});
  },
  updateOperations({ commit }: any, value: any) {
    commit('updateVal', {id: 'operations', val: value});
  },
  updateSelectedOperations({ commit }: any, value: any) {
    commit('updateVal', {id: 'selectedOperations', val: value});
  },
  updateSpecimens({ commit }: any, value: any) {
    commit('updateVal', {id: 'specimens', val: value});
  },
  updateDisplayColumns({ commit }: any, value: any) {
    commit('updateDisplayColumns', value);
  },
  updateFilters({ commit }: any, value: any) {
    commit('updateVal', {id: 'filters', val: value});
  },
};

const mutations: MutationTree<DebrieferState> = {
  updateVal(newState: any, val: any) {
    newState[val.id] = val.val;
  },
  updateDisplayColumns(newState: any, val: any) {
    newState.displayColumns = val;
  },
  setTripIds(newState: any, ids: string[]) {
    newState.tripIds = ids;
  },
  setCruiseIds(newState: any, ids: string) {
    newState.cruiseIds = ids;
  },
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
