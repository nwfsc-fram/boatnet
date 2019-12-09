import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { KeyboardState, RootState } from './types/types';

Vue.use(Vuex);

const state: KeyboardState = {
  showKeyboard: false,
  keyboardType: 'normal',
  keyboardInputTarget: undefined,
  activeFieldName: '',
  valueSelected: false
};

const actions: ActionTree<KeyboardState, RootState> = {
  setKeyboard({ commit }: any, isEnabled: boolean) {
    commit('setKeyboard', isEnabled);
  },
  setKeyboardType({ commit }: any, type: string) {
    commit('setKeyboardType', type);
  },
  setKeyboardInputTarget({ commit }: any, target: any) {
    commit('setKeyboardInputTarget', target);
  },
  setActiveFieldName({ commit }: any, activeFieldName: string) {
    commit('setActiveFieldName', activeFieldName);
  },
  setValueSelected({ commit }: any, selectedValue: boolean) {
    commit('setValueSelected', selectedValue);
  }
};

const mutations: MutationTree<KeyboardState> = {
  setKeyboard(newState: any, isEnabled: boolean) {
    newState.showKeyboard = isEnabled;
  },
  setKeyboardType(newState: any, type: string) {
    newState.keyboardType = type;
  },
  setKeyboardInputTarget(newState: any, target: any) {
    newState.keyboardInputTarget = target;
  },
  setActiveFieldName(newState: any, activeFieldName: string) {
    newState.activeFieldName = activeFieldName;
  },
  setValueSelected(newState: any, selectedValue: boolean) {
    newState.valueSelected = selectedValue;
  }
};

export const keyboard: Module<KeyboardState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations
};
