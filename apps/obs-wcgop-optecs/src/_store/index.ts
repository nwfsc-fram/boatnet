import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import VuexPersist from 'vuex-persist';

import { alert } from '@boatnet/bn-common';
import { auth } from '@boatnet/bn-auth';
import { pouchState } from '@boatnet/bn-pouch';
import { tallyState } from '@/_store/tally.module';
import { pdfState } from '@/_store/pdf.module';
import { keyboard } from '@boatnet/bn-common';

import { RootState } from '@boatnet/bn-common';
import { tripsState } from '@boatnet/bn-common';
import { appSettings } from '@boatnet/bn-common';

// Primary app store: following examples at:
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// https://github.com/Armour/vue-typescript-admin-template

Vue.use(Vuex);

// Preserves state between page refreshes.
const vuexLocalStorage = new VuexPersist({
  key: 'obs-wcgop-optecs',
  modules: ['alert', 'appSettings', 'auth', 'keyboard', 'pouchState', 'pdfState', 'tallyState', 'tripsState']
});

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0'
  },
  modules: {
    alert,
    appSettings,
    auth,
    keyboard,
    pouchState,
    pdfState,
    tallyState,
    tripsState
  },
  plugins: [vuexLocalStorage.plugin]
};

export default new Vuex.Store<RootState>(store);
export * from './types/types';
