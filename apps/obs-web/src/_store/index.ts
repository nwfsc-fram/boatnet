import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import { alert } from './alert.module';
import { trip } from './trip.module';
import { permit } from './permit.module';
import { user } from './user.module';
import { vessel } from './vessel.module';
import { general } from './general.module';
import { emefp } from './emefp.module';
import { ots } from './ots.module';

import { RootState } from './types/types';

import { auth } from '@boatnet/bn-auth';
import { baseCouch } from '@boatnet/bn-couch';

// Primary app store: following examples at:
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// https://github.com/Armour/vue-typescript-admin-template

Vue.use(Vuex);

// export const store = new Vuex.Store({
//   modules: {
//     alert,
//     auth
//   }
// });

// export default store;

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
    ots
  }
};

export default new Vuex.Store<RootState>(store);
