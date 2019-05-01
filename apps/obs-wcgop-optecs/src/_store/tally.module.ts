import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { TallyState, RootState, TallyButtonData, TallyRecordTypeName } from '@/_store/types';

import { TallyRecord } from './types';
import { pouchService } from '@boatnet/bn-pouch';

Vue.use(Vuex);

export const state: TallyState = {
  tallyRecord: {
    type: TallyRecordTypeName,
    buttonData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  }
};

const actions: ActionTree<TallyState, RootState> = {
  connectDB({ commit }: any) {
    commit('connectDB');
    commit('initDefault');
  },
  updateButton({ commit }: any, button: TallyButtonData) {
    commit('updateButton', button);
  }
  // TODO: Button Data changes (increment, assign discard reasons, etc)
  // setCurrentTrip({ commit }: any, trip: WcgopTrip) {
  //   commit('setCurrentTrip', trip);
  // },
};

const mutations: MutationTree<TallyState> = {
  initDefault(newState: any) {
    if (newState.tallyRecord.buttonData.length > 0  && newState.tallyRecord._id) {
      console.log('[Tally Module] Already have tally data, skip template init. DB ID=',
      newState.tallyRecord._id);
      return;
    }
    console.log('[Tally Module] Creating Default Tally Button Data', newState);
    const tmpBtnData = [];
    let index = 0;
    for (let r = 0; r < newState.tallyRecord.vertButtonCount; r++) {
      for (let c = 0; c < newState.tallyRecord.horizButtonCount; c++) {
        if (c === 6) {
          tmpBtnData.push({
            index,
            color: 'red',
            code: 'KORN',
            reason: 'PRED',
            count: r
          });
        } else if (c === 7) {
          tmpBtnData.push({
            index,
            color: 'green-9',
            code: 'SABL',
            reason: 'RET',
            count: 0
          });
        } else if (c === 5) {
          tmpBtnData.push({ index, blank: true });
        } else {
          tmpBtnData.push({
            index,
            color: 'green-3',
            'text-color': 'black',
            code: 'PHLB',
            reason: 'MKT',
            count: 0
          });
        }
        index++;
      }
    }
    newState.tallyRecord.buttonData = tmpBtnData;
    // TODO keep track of current ID?
    pouchService.db.post(pouchService.userDBName, newState.tallyRecord).then( (result: any) => {
      console.log('POSTED NEW DATA!', result);
      newState.tallyRecord._id = result.id;
    });
  },
  connectDB(newState: any) {
    console.log('TODO Connect Database to Tally');

  },
  updateButton(newState: any, button: TallyButtonData) {
    if (button.index === undefined) {
      console.log('[Tally Module] Button has no index, cannot update.', button);
      return;
    }
    newState.buttonData[button.index] = button;
  }
};

const getters: GetterTree<TallyState, RootState> = {
  horizButtonCount(getState: TallyState) {
    return getState.tallyRecord.horizButtonCount;
  },
  vertButtonCount(getState: TallyState) {
    return getState.tallyRecord.vertButtonCount;
  }

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
