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

/* tslint:disable:no-var-requires  */
const defaultTemplate = require('../assets/tally-templates/default.json');

Vue.use(Vuex);

export const state: TallyState = {
  tallyRecord: {
    recordName: 'Default',
    type: TallyRecordTypeName,
    buttonData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  },
  incDecValue: 1
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
  },
  setTallyIncDec({ commit }: any, value: number) {
    commit('setTallyIncDec', value);
  }
  // TODO: Button Data changes (increment, assign discard reasons, etc)
  // setCurrentTrip({ commit }: any, trip: WcgopTrip) {
  //   commit('setCurrentTrip', trip);
  // },
};

function getBtnColor(reason: string): { bg?: string; text?: string } {
  switch (reason) {
    case 'INVIS':
      return {};
      break;
    case 'PRED':
      return { bg: 'red-5', text: 'white' };
      break;
    case 'RET':
      return { bg: 'green-9', text: 'white' };
      break;
    case 'MKT':
      return { bg: 'light-green', text: 'black' };
      break;

    default:
      return { bg: 'blue-5', text: 'black' };
      break;
  }
}

function createDefaultRecord(): TallyRecord {
  const newRecord: TallyRecord = {
    recordName: 'Default',
    type: TallyRecordTypeName,
    buttonData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  };
  const tmpBtnData: TallyButtonData[] = [];
  const template = defaultTemplate.templateData;
  template.forEach((item: TallyButtonData, index: number) => {
    if (item.reason === 'INVIS') {
      tmpBtnData.push({
        index,
        blank: true
      });
    } else {
      tmpBtnData.push({
        index,
        color: getBtnColor(item.reason!).bg,
        'text-color': getBtnColor(item.reason!).text,
        code: item.code,
        reason: item.reason,
        count: 0
      });
    }
  });
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
    if (
      !newState.tallyRecord._id ||
      newState.tallyRecord.buttonData.length === 0
    ) {
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
  },
  setTallyIncDec(newState: any, value: number) {
    newState.incDecValue = value;
  }
};

async function updateRecord(record: TallyRecord) {
  try {
    if (record._id) {
      const result = await pouchService.db.put(pouchService.userDBName, record);
      console.log('[Tally Module] Updated tally record.', result);
      return result;
    } else {
      const result = await pouchService.db.post(
        pouchService.userDBName,
        record
      );
      console.log('[Tally Module] Created new tally record.', result);
      return result;
    }
  } catch (err) {
    if (err.status === 409) {
      try {
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
      } catch (errRetry) {
        if (errRetry.status === 404) {
          delete record._id;
          delete record._rev;
          const result = await pouchService.db.put(
            pouchService.userDBName,
            record
          );
          console.log(
            '[Tally Module] Handled doc deletion, created record',
            result
          );
          return result;
        } else {
          // TODO Alert Module
          throw errRetry;
        }
      }
    } else {
      // TODO Alert Module
      // console.log('ERROR!', err);
      throw err;
    }
  }
}

const getters: GetterTree<TallyState, RootState> = {
  horizButtonCount(getState: TallyState) {
    return getState.tallyRecord.horizButtonCount;
  },
  vertButtonCount(getState: TallyState) {
    return getState.tallyRecord.vertButtonCount;
  },
  incDecValue(getState: TallyState) {
    return getState.incDecValue;
  }
};

export const tallyState: Module<TallyState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
