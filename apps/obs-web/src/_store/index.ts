import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types/types';

import { alert } from './alert.module';
import { auth } from './auth.module';
import { trip } from './trip.module';
import { permit } from './permit.module';
import { user } from './user.module';
import { vessel } from './vessel.module';
import { general } from './general.module';

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
    version: '1.1.0'
  },
  modules: {
    alert,
    auth,
    trip,
    permit,
    user,
    vessel,
    general
    // ots
  }
};

export default new Vuex.Store<RootState>(store);
