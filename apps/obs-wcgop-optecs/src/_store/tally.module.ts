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
  // TODO: Button Data changes (increment, assign discard reasons, etc)
  // setCurrentTrip({ commit }: any, trip: WcgopTrip) {
  //   commit('setCurrentTrip', trip);
  // },
};

const mutations: MutationTree<TallyState> = {
  initDefault(newState: any) {
    console.log('[Tally Module] Creating Default Tally Button Data');
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

};

const getters: GetterTree<TallyState, RootState> = {
  // TODO: get button data
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
