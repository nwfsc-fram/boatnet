import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import {
  TallyState,
  RootState,
  TallyButtonData,
  TallyRecordTypeName,
  TallyRecord
} from '@/_store/types';

import { pouchService } from '@boatnet/bn-pouch';
import moment from 'moment';
import { authService } from '@boatnet/bn-auth';

Vue.use(Vuex);

export const state: TallyState = {
  tallyRecord: {
    recordName: 'Default',
    type: TallyRecordTypeName,
    buttonData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  }
};

const actions: ActionTree<TallyState, RootState> = {
  reset({ commit }: any) {
    commit('reset');
  },
  connectDB({ commit }: any) {
    commit('initialize');
  },
  updateButton({ commit }: any, button: TallyButtonData) {
    commit('updateButton', button);
  }
  // TODO: Button Data changes (increment, assign discard reasons, etc)
  // setCurrentTrip({ commit }: any, trip: WcgopTrip) {
  //   commit('setCurrentTrip', trip);
  // },
};

function createDefaultRecord(): TallyRecord {
  const newRecord: TallyRecord = {
    recordName: 'Default',
    type: TallyRecordTypeName,
    buttonData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  };
  const tmpBtnData: TallyButtonData[] = [];
  let index = 0;
  for (let r = 0; r < newRecord.vertButtonCount; r++) {
    for (let c = 0; c < newRecord.horizButtonCount; c++) {
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
  newRecord.buttonData = tmpBtnData;
  newRecord.createdDate = moment().format();
  newRecord.createdBy = authService.getCurrentUser()!.username;
  return newRecord;
}

const mutations: MutationTree<TallyState> = {
  async initialize(newState: any) {
    /**
     * Initialize tally data. If tallyRecord is set, do nothing, otherwise create new TallyRecord.
     */
    if (!newState.tallyRecord._id || newState.tallyRecord.buttonData.length === 0) {
      newState.tallyRecord = createDefaultRecord();
      const result = await updateRecord(newState.tallyRecord);
      newState.tallyRecord._id = result.id;
      newState.tallyRecord._rev = result.rev;
    } else {
      console.log(
        '[Tally Module] Already have tally data, skip template init. DB ID=',
        newState.tallyRecord._id
      );
    }
  },
  async reset(newState: any, createNewRecord = false) {
    /**
     * Reset data for tally to default template.
     * @param createNewRecord Create a new CouchDB record, otherwise overwrite existing _id
     */
    console.log('[Tally Module] Reset Tally Button Data', newState);
    // Keep old ID
    const oldId = newState.tallyRecord._id;
    newState.tallyRecord = createDefaultRecord();
    if (!createNewRecord && oldId) {
      newState.tallyRecord._id = oldId;
    }
    const result = await updateRecord(newState.tallyRecord);
    newState.tallyRecord._id = result.id;
    newState.tallyRecord._rev = result.rev;
  },
  async updateButton(newState: any, button: TallyButtonData) {
    if (button.index === undefined) {
      console.log('[Tally Module] Button has no index, cannot update.', button);
      return;
    }
    newState.tallyRecord.buttonData[button.index] = button;
    const result = await updateRecord(newState.tallyRecord);
    if (result) {
      newState.tallyRecord._rev = result.rev;
      newState.tallyRecord.modifiedDate = moment().format();
      newState.tallyRecord.modifiedBy = authService.getCurrentUser()!.username;
    }
  }
};

async function updateRecord(record: TallyRecord) {
  try {
    if (record._id) {
      const result = await pouchService.db.put(
        pouchService.userDBName,
        record
      );
      console.log('Updated tally record.', result);
      return result;
    } else {
      const result = await pouchService.db
      .post(pouchService.userDBName, record);
      console.log('Created new tally record.', result);
      return result;
    }

  } catch (err) {
    if (err.status === 409) {

      const newerDoc = await pouchService.db.get(
        pouchService.userDBName,
        record._id
      );
      record._rev = newerDoc._rev;
      const result = await pouchService.db.put(
        pouchService.userDBName,
        record
      );
      console.log(
        '[Tally Module] Handled doc conflict, updated record',
        result
      );
      return result;
    } else {
      // TODO Alert Module
      console.log('ERROR!', err);
    }
  }
}

const getters: GetterTree<TallyState, RootState> = {
  horizButtonCount(getState: TallyState) {
    return getState.tallyRecord.horizButtonCount;
  },
  vertButtonCount(getState: TallyState) {
    return getState.tallyRecord.vertButtonCount;
  }
};

export const tallyState: Module<TallyState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
