import Vue from 'vue';
import Vuex from 'vuex';

import { alert } from './alert.module';
import { account } from './account.module';

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    alert,
    account
  }
});

export default store;
