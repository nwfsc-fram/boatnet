import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { KeyboardState, RootState } from '@/_store/types/types';

Vue.use(Vuex);

export const state: KeyboardState = {
    showKeyboard: false,
    keyboardType: 'normal',
    keyboardInputTarget: undefined
};

const actions: ActionTree<KeyboardState, RootState> = {
    setKeyboard({ commit }: any, isEnabled: boolean) {
        commit('setKeyboard', isEnabled);
      },
      setKeyboardType({ commit }: any, type: string) {
        commit('setKeyboardType', type);
      },
      setKeyboardInput({ commit }: any, input: any) {
        commit('setKeyboardInput', input);
      },
};

const mutations: MutationTree<KeyboardState> = {
    setKeyboard(newState: any, isEnabled: boolean) {
        newState.showKeyboard = isEnabled;
    },
    setKeyboardType(newState: any, type: string) {
        newState.keyboardType = type;
    },
    setKeyboardInput(newState: any, input: any) {
        newState.keyboardInputTarget = input;
    },
};

export const keyboard: Module<KeyboardState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations
};
