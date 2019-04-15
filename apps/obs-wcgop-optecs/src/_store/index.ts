import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import { appState } from '@/_store/wcgop-app-state.module';
import { alert } from '@/_store/alert.module';
import { auth } from '@boatnet/bn-auth';
import { baseCouch } from '@boatnet/bn-couch';

import { RootState } from '@/_store/types/types';

// Primary app store: following examples at:
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// https://github.com/Armour/vue-typescript-admin-template

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0'
  },
  modules: {
    appState,
    alert,
    auth,
    baseCouch
  }
};

export default new Vuex.Store<RootState>(store);
