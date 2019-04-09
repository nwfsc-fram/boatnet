// TODO Vuex Trip Module
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { UserState } from '@/_store/types/types';
import { users } from '@/_store/data';

Vue.use(Vuex);

export const state: UserState = {
  activeUser: users[0],
  users,
  newUser: false
};

export const user: Module<UserState, RootState> = {
    namespaced: true,
    state,
  };
