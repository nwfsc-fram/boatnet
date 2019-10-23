import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import VuexPersistence from 'vuex-persist';

import { auth } from '@boatnet/bn-auth';
import { pouchState } from '@boatnet/bn-pouch';

import { tripsState } from '@boatnet/bn-common';
import { alert } from '@boatnet/bn-common';
import { RootState } from '@boatnet/bn-common';
import { keyboard } from '@boatnet/bn-common';
import { appSettings } from '@boatnet/bn-common';

// Primary app store: following examples at:
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// https://github.com/Armour/vue-typescript-admin-template

Vue.use(Vuex);

// Preserves state between page refreshes.
const vuexLocalStorage = new VuexPersistence<RootState>({
  storage: window.localStorage,
  modules: ['alert', 'auth', 'appSettings', 'keyboard', 'pouchState', 'tripsState']
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
    tripsState
  },
  plugins: [vuexLocalStorage.plugin]
};

export default new Vuex.Store<RootState>(store);
