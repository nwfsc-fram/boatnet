import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import { alert } from '@/_store/alert.module';
import { account } from '@/_store/account.module';

import { RootState } from '@/_store/types/types';


// Primary app store: following examples at https://codeburst.io/vuex-and-typescript-3427ba78cfa8

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0'
  },
  modules: {
    alert,
    account
  }
};

export default new Vuex.Store<RootState>(store);
