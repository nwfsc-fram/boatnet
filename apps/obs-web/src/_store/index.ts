import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import VuexPersist from 'vuex-persist';

import { appState } from '@/_store/wcgop-app-state.module';
import { alert } from './alert.module';
import { trip } from './trip.module';
import { permit } from './permit.module';
import { user } from './user.module';
import { debriefer } from './debriefer.module';
import { vessel } from './vessel.module';
import { general } from './general.module';
import { emefp } from './emefp.module';
import { ots } from './ots.module';
import { oa } from './observer-assignment.module';
import { obact } from './observer-availability.module';

import { pouchState } from '@boatnet/bn-pouch';
import { RootState } from './types/types';

import { auth } from '@boatnet/bn-auth';
import { baseCouch } from '@boatnet/bn-couch';

// Primary app store: following examples at:
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// https://github.com/Armour/vue-typescript-admin-template

Vue.use(Vuex);

// Preserves state between page refreshes.
const vuexLocalStorage = new VuexPersist({
  key: 'obs-web',
  storage: window.localStorage
});

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0'
  },
  modules: {
    alert,
    auth,
    baseCouch,
    trip,
    permit,
    user,
    vessel,
    general,
    emefp,
    ots,
    oa,
    obact,
    pouchState,
    appState,
    debriefer
  },
  plugins: [vuexLocalStorage.plugin]
};

export default new Vuex.Store<RootState>(store);
export * from './types/types';
