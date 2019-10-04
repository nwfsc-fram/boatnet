import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { KeyboardState, RootState } from './types/types';

Vue.use(Vuex);

const state: KeyboardState = {
    showKeyboard: false,
    keyboardType: 'normal',
    keyboardInputTarget: undefined,
    input: ''
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
        commit('setInput', '');
      },
      setInput({ commit }: any, input: string) {
        commit('setInput', input);
      },
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
    setInput(newState: any, input: string) {
        newState.input = input;
    },
};

const getters: GetterTree<KeyboardState, RootState> = {
    input(getState: KeyboardState) {
      return getState.input;
    }
};

export const keyboard: Module<KeyboardState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
