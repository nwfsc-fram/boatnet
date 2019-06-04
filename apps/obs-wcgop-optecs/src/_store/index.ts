import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import VuexPersist from 'vuex-persist';

import { appState } from '@/_store/wcgop-app-state.module';
import { alert } from '@/_store/alert.module';
import { auth } from '@boatnet/bn-auth';
import { pouchState } from '@boatnet/bn-pouch';
import { tallyState } from '@/_store/tally.module';
import { pdfState } from '@/_store/pdf.module';

import { RootState } from '@/_store/types/types';

// Primary app store: following examples at:
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// https://github.com/Armour/vue-typescript-admin-template

Vue.use(Vuex);

// Preserves state between page refreshes.
const vuexLocalStorage = new VuexPersist({
  key: 'obs-wcgop-optecs',
  storage: window.localStorage
});

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0'
  },
  modules: {
    appState,
    alert,
    auth,
    pouchState,
    tallyState,
    pdfState
  },
  plugins: [vuexLocalStorage.plugin]
};

export default new Vuex.Store<RootState>(store);
export * from './types/types';
