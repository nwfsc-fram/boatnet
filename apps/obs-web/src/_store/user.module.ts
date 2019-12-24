
import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { RootState } from '@/_store/types/types';
import { UserState } from '@/_store/types/types';
// import { users } from '@/_store/data';

Vue.use(Vuex);

export const state: UserState = {
  users: [],
  newUser: false,
  activeUser: undefined,
  activeUserAlias: undefined,
  unLinkedApexUsers: [],
  captainMode: false
};

export const user: Module<UserState, RootState> = {
    namespaced: true,
    state,
  };
