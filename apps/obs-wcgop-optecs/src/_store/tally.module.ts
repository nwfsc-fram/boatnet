import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { TallyState, RootState } from '@/_store/types';

Vue.use(Vuex);

export const state: TallyState = {
  buttonData: [],
  horizButtonCount: 8,
  vertButtonCount: 4
};

const actions: ActionTree<TallyState, RootState> = {
  initDefaultTemplate({commit }: any) {
    commit('initDefault');
  }
  // setCurrentTrip({ commit }: any, trip: WcgopTrip) {
  //   commit('setCurrentTrip', trip);
  // },
  // clear({ commit }: any) {
  //   commit('setCurrentTrip', undefined);
  // },
  // navigate({ commit }: any, uri: string) {
  //   commit('navigate', uri);
  // },
  // navigateBack({ commit }: any) {
  //   commit('navigateBack');
  // },
  // setKeyboardStatus({ commit }: any, isEnabled: boolean) {
  //   commit('setKeyboardStatus', isEnabled);
  // }
};

const mutations: MutationTree<TallyState> = {
  initDefault(newState: any) {
    console.log('*********************************************************');
    const tmpBtnData = [];
    for (let r = 0; r < newState.vertButtonCount; r++) {
      for (let c = 0; c < newState.horizButtonCount; c++) {
        if (c === 6) {
          tmpBtnData.push({
            color: 'red',
            code: 'KORN',
            reason: 'PRED',
            count: r
          });
        } else if (c === 7) {
          tmpBtnData.push({
            color: 'green-9',
            code: 'SABL',
            reason: 'RET',
            count: 0
          });
        } else if (c === 5) {
          tmpBtnData.push({ blank: true });
        } else {
          tmpBtnData.push({
            'color': 'green-3',
            'text-color': 'black',
            'code': 'PHLB',
            'reason': 'MKT',
            'count': 0
          });
        }
      }
    }
    newState.buttonData = tmpBtnData;
  }
  // setCurrentTrip(newState: any, trip: WcgopTrip) {
  //   // if (trip) {
  //   //   console.log('[AppState] Current trip:', trip.tripNum);
  //   // } else {
  //   //   console.log('[AppState] Cleared current trip');
  //   // }
  //   newState.currentTrip = trip;
  // },
  // navigate(newState: any, uri: string) {
  //   console.log('[AppState] TODO Navigate to', uri);
  // },
  // navigateBack(newState: any, uri: string) {
  //   console.log('[AppState] TODO Navigate to', uri);
  // },
  // setKeyboardStatus(newState: any, isEnabled: boolean) {
  //   newState.isKeyboardEnabled = isEnabled;
  // }
};

const getters: GetterTree<TallyState, RootState> = {
  // currentTrip(getState: WcgopAppState) {
  //   return getState.currentTrip;
  // }
};

export const tallyState: Module<TallyState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
