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
  displayColumns: {},
  selectedValues: {}
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
  updateDisplayColumns({ commit }: any, value: any) {
    commit('updateDisplayColumns', value);
  },
  updateSelectedValues({ commit }: any, value: any) {
    commit('updateSelectedValues', value);
  }
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
  updateSelectedValues(newState: any, val: string) {
    newState.selectedValues = val;
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
