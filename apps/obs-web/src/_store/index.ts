import Vue from 'vue';
import Vuex from 'vuex';

import { alert } from './alert.module';
import { auth } from './auth.module';

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    alert,
    auth
  }
});

export default store;
