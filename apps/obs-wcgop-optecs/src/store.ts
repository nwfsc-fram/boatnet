import Vue from 'vue';
import Vuex from 'vuex';

import { alert } from './_store/alert.module';
import { account } from './_store/account.module';
// import { users } from './users.module';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    alert,
    account
    // users
  }
});

export default store;
