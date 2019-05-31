import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { Base } from '@boatnet/bn-models';
import {
  TallyState,
  RootState,
  TallyButtonLayoutData,
  TallyLayoutRecordTypeName,
  TallyLayoutRecord,
  TallyCountData,
  TallyCountWeight,
  TallyDataRecordTypeName,
  TallyDataRecord,
  TallyOperationMode
} from '@/_store/types';

import { pouchService } from '@boatnet/bn-pouch';

import moment from 'moment';
import { authService } from '@boatnet/bn-auth';
import { stringify } from 'querystring';
import { getJSDocTemplateTag } from 'typescript';

/* tslint:disable:no-var-requires  */
const defaultTemplate = require('../assets/tally-templates/default.json');

Vue.use(Vuex);

export const state: TallyState = {
  tallyLayout: {
    recordName: 'Default',
    type: TallyLayoutRecordTypeName,
    layoutData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  },
  tallyDataRec: { type: TallyDataRecordTypeName, data: [] },
  incDecValue: 1,
  operationMode: TallyOperationMode.Tally,
  tempSpeciesCounter: 0,
  lastClickedIndex: -1,
  lastClickedWasInc: true // true for Inc
};

// TODO: Other Color Schemes
const reasonButtonColors: any[] = [
  { name: 'SFTY', color: { bg: 'blue-2', text: 'black' } },
  { name: 'DOCK', color: { bg: 'blue-3', text: 'black' } },
  { name: 'ACCI', color: { bg: 'blue-4', text: 'black' } },
  { name: 'USED', color: { bg: 'blue-5', text: 'black' } },
  { name: 'OTHR', color: { bg: 'blue-6', text: 'white' } },
  { name: 'REG', color: { bg: 'blue-7', text: 'white' } },
  { name: 'DROP', color: { bg: 'blue-8', text: 'white' } },
  { name: 'PRED', color: { bg: 'red-5', text: 'white' } },
  { name: 'MKT', color: { bg: 'light-green', text: 'black' } },
  { name: 'RET', color: { bg: 'green-9', text: 'white' } }
];

// Helper Functions
function getBtnColor(reason: string): { bg?: string; text?: string } {
  const rbcVal: any = reasonButtonColors.filter((rbc: any) => {
    return rbc.name === reason;
  });
  if (rbcVal[0]) {
    return rbcVal[0].color;
  } else {
    console.log('WARNING: no button color for', reason);
    return { bg: 'gray-4', text: 'black' };
  }
}

function createDefaultButtonData(): TallyDataRecord {
  const newData: TallyDataRecord = {
    type: TallyDataRecordTypeName,
    data: []
  };
  const template = defaultTemplate.templateData;
  template.forEach((item: { code?: string; reason: string }, index: number) => {
    if (item.code) {
      const data = {
        // species:  //TODO look up full species record?
        shortCode: item.code,
        reason: item.reason,
        count: 0
      };
      newData.data!.push(data);
    }
  });
  return newData;
}

function createDefaultLayoutRecord(): TallyLayoutRecord {
  const newLayout: TallyLayoutRecord = {
    recordName: 'Default',
    type: TallyLayoutRecordTypeName,
    layoutData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  };
  const template = defaultTemplate.templateData;
  template.forEach((item: { code?: string; reason: string }, index: number) => {
    if (item.reason === 'INVIS') {
      newLayout.layoutData.push({
        index,
        blank: true
      });
    } else {
      newLayout.layoutData.push({
        index,
        color: getBtnColor(item.reason!).bg,
        'text-color': getBtnColor(item.reason!).text,
        labels: {
          shortCode: item.code,
          reason: item.reason
        }
      });
    }
  });
  newLayout.createdDate = moment().format();
  newLayout.createdBy = authService.getCurrentUser()!.username;
  return newLayout;
}

function getHighestTempCounter(
  tallyData: TallyCountData[],
  startCount: number
) {
  let newCount = startCount;
  for (const rec of tallyData) {
    if (rec.shortCode !== undefined && rec.shortCode.startsWith('(TEMP')) {
      const tempCounter = parseInt(
        rec.shortCode.replace('(TEMP', '').replace(')', ''), // extract (TEMP###)
        10
      );
      if (tempCounter > newCount) {
        newCount = tempCounter;
      }
    }
  }
  return newCount;
}

async function updateLayoutDB(
  layout: TallyLayoutRecord
): Promise<TallyLayoutRecord> {
  const result = await updateDB(layout);
  if (result) {
    layout._id = result.id;
    layout._rev = result.rev;
    layout.updatedDate = moment().format();
    layout.updatedBy = authService.getCurrentUser()!.username;
  }
  return layout;
}

async function updateTallyDataDB(
  tallyData: TallyDataRecord
): Promise<TallyDataRecord> {
  const result = await updateDB(tallyData);
  if (result) {
    tallyData._id = result.id;
    tallyData._rev = result.rev;
    tallyData.updatedDate = moment().format();
    tallyData.updatedBy = authService.getCurrentUser()!.username;
  }
  return tallyData;
}

async function updateDB(record: Base) {
  try {
    if (record._id) {
      // console.log('[Tally Module] Updating record.', record.type);
      const result = await pouchService.db.put(pouchService.userDBName, record);
      return result;
    } else {
      const result = await pouchService.db.post(
        pouchService.userDBName,
        record
      );
      console.log('[Tally Module] Created new record.', record.type, result);
      return result;
    }
  } catch (err) {
    // console.log('[Tally Module] First error caught.', err.status);
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
          record.type,
          result
        );
        return result;
      } catch (errRetry) {
        // console.log('[Tally Module] Second error caught.', errRetry.status);
        if (errRetry.status === 404) {
          delete record._id;
          delete record._rev;
          const result = await pouchService.db.put(
            pouchService.userDBName,
            record
          );
          console.log(
            '[Tally Module] Handled doc deletion, created record',
            record.type,
            result
          );
          return result;
        } else {
          // TODO Alert Module
          console.error('[Tally Module] Unknown error', errRetry);
          throw errRetry;
        }
      }
    } else {
      // TODO Alert Module
      // console.log('ERROR!', err);
      console.error('[Tally Module] Unknown error', err);
      throw err;
    }
  }
}

function getButtonFromIndex(getState: TallyState, idx: number) {
  if (idx === undefined || idx < 0) {
    return;
  }
  const button = getState.tallyLayout.layoutData[idx];
  return button;
}

function findDataIndex(
  getState: TallyState,
  shortCode: string,
  reason: string
) {
  // Find matching data field
  const currentDataIdx = getState.tallyDataRec!.data!.findIndex(
    (rec: TallyCountData) => {
      return rec.shortCode === shortCode && rec.reason === reason;
    }
  );
  return currentDataIdx;
}

function getCurrentDataIndex(getState: TallyState) {
  const button = getButtonFromIndex(getState, getState.currentButtonIdx!);
  if (button) {
    return findDataIndex(
      getState,
      button.labels!.shortCode!,
      button.labels!.reason!
    );
  }
}

function calculateTallyValues(rec: TallyCountData) {
  // Roll up values

  if (rec.countWeightData === undefined || rec.countWeightData.length === 0) {
    Vue.delete(rec, 'calculatedTotalWeighedCount');
    Vue.delete(rec, 'calculatedTotalWeighedWeight');
    Vue.delete(rec, 'calculatedAverageWeight');
    return;
  }
  let weighedCount = 0;
  let weighedWeight = 0;
  let avgWeight = 0;
  let totalCount = rec.count ? rec.count : 0;

  for (const data of rec.countWeightData) {
    weighedCount += data.weighedCount ? data.weighedCount : 0;
    weighedWeight += data.weight ? data.weight : 0;

    if (!data.isAddedToTally) {
      totalCount += data.weighedCount!;
      Vue.set(data, 'isAddedToTally', true);
    }
  }
  if (weighedCount > 0) {
    avgWeight = weighedWeight / weighedCount;
  }
  Vue.set(rec, 'calculatedTotalWeighedCount', weighedCount);
  Vue.set(rec, 'calculatedTotalWeighedWeight', weighedWeight);
  Vue.set(rec, 'calculatedAverageWeight', avgWeight);
  Vue.set(rec, 'count', totalCount);
}

// ACTIONS
const actions: ActionTree<TallyState, RootState> = {
  reset({ commit }: any) {
    commit('reset');
    commit('clearLastIncDec');
  },
  connectDB({ commit }: any) {
    commit('initialize');
    commit('clearLastIncDec');
  },
  updateAllDB({ commit }: any) {
    commit('updateAllDB');
  },
  updateButtonData(
    { commit }: any,
    params: {
      button?: TallyButtonLayoutData;
      skipLayoutUpdate: boolean;
      data: TallyCountData;
      skipDataUpdate: boolean;
    }
  ) {
    commit('updateButtonData', params);
  },
  setTallyIncDec({ commit }: any, value: number) {
    commit('setTallyIncDec', value);
  },
  setTallyOpMode({ commit }: any, value: TallyOperationMode) {
    commit('setTallyOpMode', value);
  },
  setCurrentButtonIdx({ commit }: any, index: number) {
    commit('setCurrentButtonIdx', index);
  },
  setCurrentReason({ commit }: any, reason: string) {
    commit('setCurrentReason', reason);
  },
  incTempSpeciesCounter({ commit }: any) {
    commit('incTempSpeciesCounter');
  },
  delTempSpeciesCounter({ commit }: any, counter: number) {
    commit('delTempSpeciesCounter', counter);
  },
  setLastIncDecIndex({ commit }: any, index: number) {
    commit('setLastIncDecIndex', index);
  },
  clearLastIncDec({ commit }: any) {
    commit('clearLastIncDec');
  },
  addTallyCountWeight({ commit }: any, value: TallyCountWeight) {
    commit('addTallyCountWeight', value);
  },
  deleteTallyCountWeight({ commit }: any, index: number) {
    commit('deleteTallyCountWeight', index);
  },
  assignNewButton(
    { commit }: any,
    value: {
      species: any;
      reason: string;
      index: number;
    }
  ) {
    commit('assignNewButton', value);
  },
  swapButtons({ commit }: any, value: { oldButton: any; newIndex: number }) {
    commit('swapButtons', value);
  },
  deleteButton({ commit }: any, button: TallyButtonLayoutData) {
    commit('deleteButton', button);
  },
  reassignSpecies(
    { commit }: any,
    value: { oldSpeciesCode: string; newSpeciesCode: string }
  ) {
    if (value.oldSpeciesCode !== value.newSpeciesCode) {
      commit('reassignSpecies', value);
    }
  }
};

// MUTATIONS
const mutations: MutationTree<TallyState> = {
  async initialize(newState: any) {
    /**
     * Initialize tally data if none exists
     * TODO refactor to combine with reset
     */

    // Tally Layout
    if (!newState.tallyLayout._id) {
      newState.tallyLayout = createDefaultLayoutRecord();
      console.log('[Tally Module] New layout initialized.');
      await updateLayoutDB(newState.tallyLayout); // ignore retval for now
    } else {
      console.log(
        '[Tally Module] Already have tally layout, skip template init. DB ID=',
        newState.tallyLayout._id
      );
      // TODO verify pouchdb vs vuex data
    }

    newState.tempSpeciesCounter = 0;
    // Tally Data
    if (!newState.tallyDataRec._id) {
      newState.tallyDataRec = createDefaultButtonData();
      console.log('[Tally Module] New tally dataset initialized.');
      await updateTallyDataDB(newState.tallyDataRec); // ignore retval for now
    } else {
      console.log(
        '[Tally Module] Already have tally data, skip template init. DB ID=',
        newState.tallyDataRec._id
      );
      // find max temp button counter
      newState.tempSpeciesCounter = getHighestTempCounter(
        newState.tallyDataRec.data,
        newState.tempSpeciesCounter
      );
      // TODO verify pouchdb vs vuex data
    }
  },
  async reset(newState: any, createNewRecord = false) {
    /**
     * Reset data for tally to default template.
     * @param createNewRecord Create a new CouchDB record, otherwise overwrite existing _id
     */
    console.log('[Tally Module] Reset Tally Button Data');
    // Keep old IDs
    const oldIdLayout = newState.tallyLayout._id;
    newState.tempSpeciesCounter = 0;
    newState.tallyLayout = createDefaultLayoutRecord();
    if (!createNewRecord && oldIdLayout) {
      newState.tallyLayout._id = oldIdLayout;
    }

    newState.tallyDataRec = createDefaultButtonData();
    const oldIdData = newState.tallyDataRec._id;
    if (!createNewRecord && oldIdData) {
      newState.tallyDataRec._id = oldIdData;
    }
    delete newState.currentButton;
    updateLayoutDB(newState.tallyLayout);
    updateTallyDataDB(newState.tallyDataRec);
  },
  async updateAllDB(newState: any) {
    updateLayoutDB(newState.tallyLayout);
    updateTallyDataDB(newState.tallyDataRec);
  },
  async updateButtonData(
    newState: any,
    params: {
      button?: TallyButtonLayoutData;
      skipLayoutUpdate?: boolean;
      data: TallyCountData;
      skipDataUpdate?: boolean;
    }
  ) {
    if (params.data.shortCode) {
      const targetRecIdx = newState.tallyDataRec.data.findIndex(
        (rec: TallyCountData) => {
          return (
            rec.shortCode === params.data.shortCode &&
            rec.reason === params.data.reason
          );
        }
      );
      if (targetRecIdx >= 0) {
        newState.tallyDataRec.data.splice(targetRecIdx, 1, params.data);
        // console.log('[Tally Module] Updated', params.data, targetRecIdx);
      } else {
        newState.tallyDataRec.data.push(params.data);
        console.log('[Tally Module] Created new tally data');
      }
    }

    if (params.button && params.button.index !== undefined) {
      newState.tallyLayout.layoutData.splice(
        params.button.index,
        1,
        params.button
      );
    } else {
      console.log(
        '[Tally Module] Button has no index, skipped layoutData update.',
        params.button
      );
    }

    if (!params.skipLayoutUpdate) {
      try {
        updateLayoutDB(newState.tallyLayout);
      } catch (err) {
        console.error('[Tally Module] Layout update error', err);
      }
    }

    if (!params.skipDataUpdate) {
      try {
        // console.log(
        //   '[Tally Module] Updating tally data.',
        //   newState.tallyDataRec
        // );
        updateTallyDataDB(newState.tallyDataRec);
      } catch (err) {
        console.error('[Tally Module] Data update error', err);
      }
    }
  },
  setTallyIncDec(newState: any, value: number) {
    newState.incDecValue = value;
  },
  setTallyOpMode(newState: any, value: TallyOperationMode) {
    newState.operationMode = value;
    // TODO: Set/Reset all button.tempState if "Tally"?
    if (value === TallyOperationMode.Tally) {
      newState.currentButtonIdx = -1;
    }
  },
  setCurrentButtonIdx(newState: any, index: number) {
    newState.currentButtonIdx = index;
  },
  setCurrentReason(newState: any, reason: string) {
    newState.currentReason = reason;
  },
  incTempSpeciesCounter(newState: any) {
    newState.tempSpeciesCounter++;
  },
  delTempSpeciesCounter(newState: any, counter: number) {
    if (counter === newState.tempSpeciesCounter) {
      newState.tempSpeciesCounter--;
    }
  },
  setLastIncDecIndex(newState: any, index: number) {
    newState.lastClickedIndex = index;
    newState.lastClickedWasInc = newState.incDecValue > 0;
  },
  clearLastIncDec(newState: any) {
    newState.lastClickedIndex = -1;
    newState.lastClickedWasInc = true;
  },
  addTallyCountWeight(newState: any, value: TallyCountWeight) {
    const idx = getCurrentDataIndex(newState);
    if (newState.tallyDataRec.data[idx!].countWeightData) {
      newState.tallyDataRec.data[idx!].countWeightData.push(value);
    } else {
      // Create reactive entry
      Vue.set(newState.tallyDataRec.data[idx!], 'countWeightData', [value]);
    }
    calculateTallyValues(newState.tallyDataRec.data[idx!]);
    updateTallyDataDB(newState.tallyDataRec);
  },
  deleteTallyCountWeight(newState: any, index: number) {
    const idx = getCurrentDataIndex(newState);
    console.log(
      '[Tally Module] Deleting CW data',
      newState.tallyDataRec.data[idx!].countWeightData[index]
    );
    const removeCount = newState.tallyDataRec.data[idx!].countWeightData[index].weighedCount;
    const newCount = newState.tallyDataRec.data[idx!].count - removeCount;
    Vue.set(newState.tallyDataRec.data[idx!], 'count', newCount);
    newState.tallyDataRec.data[idx!].countWeightData.splice(index, 1);

    const length = newState.tallyDataRec.data[idx!].countWeightData.length;
    if (length === 0) {
      // Delete reactive entry
      Vue.delete(newState.tallyDataRec.data[idx!], 'countWeightData');
    }
    calculateTallyValues(newState.tallyDataRec.data[idx!]);
    updateTallyDataDB(newState.tallyDataRec);
  },
  async assignNewButton(
    newState: any,
    value: { species: any; reason: string; index: number }
  ) {
    const newColor = getBtnColor(value.reason);
    const newButton: TallyButtonLayoutData = {
      index: value.index,
      color: newColor.bg,
      'text-color': newColor.text,
      labels: {
        shortCode: value.species.shortCode,
        reason: value.reason
      }
    };

    newState.tallyLayout.layoutData.splice(value.index, 1, newButton);
    // Add to tallyDataRec
    const targetRecIdx = newState.tallyDataRec.data.findIndex(
      (rec: TallyCountData) => {
        return (
          rec.shortCode === newButton.labels!.shortCode &&
          rec.reason === newButton.labels!.reason
        );
      }
    );
    if (targetRecIdx >= 0) {
      console.log('[Tally Module] Data already exists in record.');
    } else {
      const newData: TallyCountData = {
        species: value.species,
        shortCode: value.species.shortCode,
        reason: value.reason,
        count: 0
      };
      console.log('[Tally Module] Inserted new tally data', newData);
      newState.tallyDataRec.data.push(newData);
      updateTallyDataDB(newState.tallyDataRec);
    }

    updateLayoutDB(newState.tallyLayout);
  },
  async swapButtons(
    newState: any,
    value: { oldButton: any; newIndex: number }
  ) {
    const target = newState.tallyLayout.layoutData[value.newIndex];

    const oldButton: TallyButtonLayoutData = {
      ...target,
      index: value.oldButton.index
    };
    const newButton: TallyButtonLayoutData = {
      ...value.oldButton,
      index: value.newIndex
    };

    newState.tallyLayout.layoutData.splice(newButton.index, 1, newButton);
    newState.tallyLayout.layoutData.splice(oldButton.index, 1, oldButton);
    updateLayoutDB(newState.tallyLayout);
  },
  async deleteButton(newState: any, button: TallyButtonLayoutData) {
    // If (TEMP#), nuke the data as well
    if (
      button.labels &&
      button.labels.shortCode &&
      button.labels.shortCode.startsWith('(TEMP')
    ) {
      // get a count of duplicate buttons
      const duplicateLayouts = newState.tallyLayout.layoutData.filter(
        (rec: TallyButtonLayoutData) => {
          return (
            rec.labels &&
            rec.labels.shortCode === button.labels!.shortCode &&
            rec.labels.reason === button.labels!.reason
          );
        }
      );

      if (duplicateLayouts.length === 1) {
        // Only delete data if this is the only button of its (TEMP#) type.
        const deleteIdx = findDataIndex(
          newState,
          button.labels!.shortCode,
          button.labels!.reason!
        );

        if (deleteIdx >= 0) {
          newState.tallyDataRec.data.splice(deleteIdx, 1);
        }
        updateTallyDataDB(newState.tallyDataRec);
      }
    }

    const blankRecord: TallyButtonLayoutData = {
      index: button.index,
      blank: true
    };
    newState.tallyLayout.layoutData.splice(button.index, 1, blankRecord);
    updateLayoutDB(newState.tallyLayout);
  },
  reassignSpecies(
    newState: any,
    value: { oldSpeciesCode: string; newSpeciesCode: string }
  ) {
    // Generally oldSpeciesCode === (TEMP#), not sure if we need to reassign other species
    // First build a map of oldSpeciesCode data
    const oldSpeciesDataCountMap = new Map<string, number>(); // reason: count

    for (const layout of newState.tallyLayout.layoutData) {
      if (!layout.blank && layout.labels.shortCode === value.oldSpeciesCode) {
        // combine data - find matching records if they exist
        const sourceRecIdx = findDataIndex(
          newState,
          value.oldSpeciesCode,
          layout.labels.reason
        );
        if (sourceRecIdx) {
          // delete old data
          const sourceRec = newState.tallyDataRec.data[sourceRecIdx];
          oldSpeciesDataCountMap.set(sourceRec.reason, sourceRec.count);
          newState.tallyDataRec.data.splice(sourceRecIdx, 1);
        }
        // Rename this button
        layout.labels.shortCode = value.newSpeciesCode;
      }
    }

    // For data in map, add to existing data
    for (const key of oldSpeciesDataCountMap.keys()) {
      const combineRecIdx = newState.tallyDataRec.data.findIndex(
        (rec: TallyCountData) => {
          return rec.shortCode === value.newSpeciesCode && rec.reason === key;
        }
      );
      if (combineRecIdx >= 0) {
        const targRec = newState.tallyDataRec.data[combineRecIdx];
        targRec.count += oldSpeciesDataCountMap.get(key);
        newState.tallyDataRec.data.splice(combineRecIdx, 1, targRec);
      } else {
        const newData: TallyCountData = {
          // species: value.species, // TODO Full Species
          shortCode: value.newSpeciesCode,
          reason: key,
          count: 0
        };
        console.log('[Tally Module] Created new tally data', newData);
        newState.tallyDataRec.data.push(newData);
      }
    }

    updateLayoutDB(newState.tallyLayout);
    updateTallyDataDB(newState.tallyDataRec);
  }
};

// GETTERS
const getters: GetterTree<TallyState, RootState> = {
  horizButtonCount(getState: TallyState) {
    return getState.tallyLayout.horizButtonCount;
  },
  vertButtonCount(getState: TallyState) {
    return getState.tallyLayout.vertButtonCount;
  },
  incDecValue(getState: TallyState) {
    return getState.incDecValue;
  },
  tallyMode(getState: TallyState) {
    return getState.operationMode;
  },
  reasonButtonColors() {
    return reasonButtonColors;
  },
  currentButtonIdx(getState: TallyState) {
    return getState.currentButtonIdx;
  },
  currentReason(getState: TallyState) {
    return getState.currentReason;
  },
  currentCWData(getState: TallyState) {
    const currentDataIdx = getCurrentDataIndex(getState);
    if (currentDataIdx !== undefined && currentDataIdx >= 0) {
      return getState.tallyDataRec!.data![currentDataIdx].countWeightData;
    }
  },
  currentTallyData(getState: TallyState) {
    const currentDataIdx = getCurrentDataIndex(getState);
    if (currentDataIdx !== undefined && currentDataIdx >= 0) {
      return getState.tallyDataRec!.data![currentDataIdx];
    }
  },
  tempCounter(getState: TallyState) {
    // TODO store
    return getState.tempSpeciesCounter;
  },
  currentTempName(getState: TallyState) {
    return '(TEMP' + getState.tempSpeciesCounter + ')';
  },
  isNameTempEnabled(getState: TallyState) {
    // Check array for (TEMP#) values
    // TODO if this isn't performant, use a Map
    if (getState.tallyDataRec && getState.tallyDataRec.data) {
      let foundTemp = false;
      for (const rec of getState.tallyDataRec.data) {
        if (rec.shortCode !== undefined && rec.shortCode.startsWith('(TEMP')) {
          foundTemp = true;
          break;
        }
      }
      return foundTemp;
    } else {
      return false;
    }
  }
};

export const tallyState: Module<TallyState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
