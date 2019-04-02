import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types/types';

import { alert } from './alert.module';
import { auth } from './auth.module';
import { trip } from './trip.module';

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
    trip
  }
};
