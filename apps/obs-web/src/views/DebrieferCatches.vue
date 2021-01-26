<template>
  <div>
    <boatnet-tree-table
      :nodes.sync="WcgopCatches"
      :settings="wcgopCatchTreeSettings"
      :expanded-keys="expandedKeys"
      p-scrollable-body
      :isEditable="true"
      :program="program"
      @save="save"
      @selected="select"
    ></boatnet-tree-table>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, computed, watch } from '@vue/composition-api';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { getOptions } from '@boatnet/bn-common/src/helpers/getLookupsInfo';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { updateCatchWeight } from '@boatnet/bn-expansions';
import { BaseCatch, BaseOperation } from '@boatnet/bn-models/lib';

export default createComponent({
  props: {
    isFullSize: Boolean
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const debriefer: any = state.debriefer;
    const WcgopCatches: any = ref([]);
    const expandedKeys: any = ref([]);
    const program = state.debriefer.program;

    const lookupsList: any = ref([]);

    const flatten = require('flat');
    const unflatten = flatten.unflatten;

    const wcgopCatchTreeSettings = {
      rowKey: 'name',
      columns: [
        {
          name: 'tripId',
          required: true,
          header: 'Trip #',
          align: 'left',
          field: 'tripId',
          width: '150',
          isEditable: false
        },
        {
          name: 'operationNum',
          required: true,
          header: 'Haul #',
          align: 'left',
          field: 'operationNum',
          width: '80',
          isEditable: false
        },
        {
          name: 'disposition',
          required: true,
          header: 'D',
          align: 'left',
          field: 'disposition',
          width: '60',
          isEditable: true,
          type: 'toggle-search',
          lookupView: 'catch-disposition',
          lookupField: 'legacy.lookupVal'
        },
        {
          name: 'weightMethod',
          align: 'left',
          header: 'WM',
          field: 'weightMethod',
          width: '150',
          isEditable: true,
          type: 'toggle-search',
          expander: true,
          lookupView: 'weight-method',
          lookupField: 'description'
        },
        {
          name: 'name',
          align: 'left',
          header: 'Name',
          field: 'name',
          width: '150',
          isEditable: true,
          type: 'toggle-search',
          lookupView: 'taxonomy-alias',
          lookupField: 'displayName'
        },
        {
          name: 'discardReason',
          align: 'left',
          header: 'Discard Reason',
          field: 'discardReason',
          width: '150',
          isEditable: true,
          type: 'toggle-search',
          lookupView: 'discard-reason',
          lookupField: 'description'
        },
        {
          name: 'basketCnt',
          align: 'left',
          header: 'Basket Cnt',
          field: 'basketCnt',
          type: 'double',
          width: '70',
          isEditable: false
        },
        {
          name: 'specimensCnt',
          align: 'left',
          header: 'Specimens Cnt',
          field: 'specimensCnt',
          type: 'link',
          to: '/observer-web/table/biospecimens',
          highlightIds: 'specimenIds',
          tooltipLabel: 'toolTipInfo',
          width: '70',
          isEditable: false
        },
        {
          name: 'weight',
          align: 'left',
          header: 'Weight (lbs)',
          field: 'weight',
          type: 'double',
          width: '100',
          isEditable: true
        },
        {
          name: 'avgWt',
          align: 'left',
          header: 'Avg Wt (lbs)',
          field: 'avgWt',
          type: 'double',
          width: '100',
          isEditable: false
        },
        {
          name: 'count',
          align: 'left',
          header: 'Count',
          field: 'count',
          width: '100',
          isEditable: true
        }
      ]
    };

    watch(() => state.debriefer.trips, getCatches);
    watch(() => state.debriefer.selectedOperations, getCatches);

    function select(item: string[]) {
      store.dispatch('debriefer/updateSpecimens', item);
      context.emit('changeTab', 'biospecimens');
    }

    async function getCatches() {
      const catches: any[] = [];
      let color = '#344B5F';

      for (const operation of state.debriefer.selectedOperations) {
        const unflattenedOperation = unflatten(operation, { delimiter: '-' })
        let catchIndex = 0;
        color = color === '#FFFFFF' ? '#344B5F' : '#FFFFFF';
        for (const c of unflattenedOperation.catches) {
          const tripId = unflattenedOperation.legacy.tripId;
          const operationNum = unflattenedOperation.operationNum;
          const operationId = unflattenedOperation._id;
          let disposition = c.disposition ? c.disposition.description : '';
          const wm = c.weightMethod ? c.weightMethod.description : '';
          let weight: any = c.weight ? c.weight.value : null;
          const sampleWeight: any = c.sampleWeight
            ? c.sampleWeight.value
            : null;
          weight = weight ? weight : sampleWeight;
          const count = c.count;
          const catchContent = c.catchContent;
          const name = catchContent ? catchContent.name : '';
          const children: any[] = [];
          let childIndex = 0;
          const key = operationId + '_' + catchIndex;

          if (disposition === 'Retained') {
            disposition = 'R';
          } else if (disposition === 'Discarded') {
            disposition = 'D';
          }

          if (c.children) {
            for (const child of c.children) {
              const discardReason = child.discardReason
                ? child.discardReason.description
                : '';
              const catchContents = child.catchContent;
              const catchName = catchContents
                ? catchContents.commonNames[0]
                : '';
              const childWeight = child.weight ? child.weight.value : null;
              const units = child.weight ? child.weight.units : '';
              const childCount = child.sampleCount;
              let basketCnt;
              let specimensCnt;
              let specimenType = '';
              let lengths: string = '';
              const specimenIds: string[] = [];

              if (child.specimens) {
                specimensCnt = child.specimens.length;
                for (const specimen of child.specimens) {
                  specimenIds.push(specimen._id);
                  if (specimen.length && specimen.length.value) {
                    lengths = lengths + specimen.length.value + ',';
                  }
                  if (specimen.biostructures) {
                    for (const biostructures of specimen.biostructures) {
                      if (biostructures.structureType) {
                        specimenType += biostructures.structureType
                          ? biostructures.structureType.description
                          : '';
                      }
                    }
                  }
                }
              }
              lengths = lengths.slice(0, -1);
              let toolTipInfo =
                specimenType !== '' ? 'types: ' + specimenType : '';
              toolTipInfo += ' ';
              toolTipInfo += lengths !== '' ? 'lengths: ' + lengths : '';

              const baskets: any[] = [];
              if (child.baskets) {
                basketCnt = child.baskets.length;
                let basketCount = 1;
                for (const basket of child.baskets) {
                  baskets.push({
                    key: key + '_' + childIndex + '_' + basketCount,
                    data: {
                      name: 'Basket ' + basketCount,
                      weight: basket.weight.value,
                      count: basket.count,
                      avgWt: basket.weight.value / basket.count
                    }
                  });
                  basketCount++;
                }
              }

              children.push({
                key: key + '_' + childIndex,
                data: {
                  specimensCnt,
                  specimenType,
                  specimenIds,
                  basketCnt,
                  toolTipInfo,
                  discardReason,
                  name: catchName,
                  catchContent: catchContents,
                  weight: childWeight,
                  count: childCount
                },
                children: baskets
              });
              childIndex++;
            }
          }

          catches.push({
            key,
            style: color === '#FFFFFF' ? 'background: #FFFFFF' : 'background: #E9ECEF', // f4f4f4
            data: {
              tripId,
              operationNum,
              operationId,
              catchNum: c.catchNum,
              disposition,
              weightMethod: wm,
              name,
              catchContent,
              weight,
              count
            },
            children
          });
          catchIndex++;
        }
      }
      WcgopCatches.value = catches;
    }
    getCatches();

    async function save(data: any) {
      const masterDB: Client<any> = couchService.masterDB;
      const ids = data.key.split('_');
      const columnName = data.column;

      try {
        const operationRecord = await masterDB.get(ids[0]);
        const catches = operationRecord.catches;

        if (ids.length === 2) {
          if (
            columnName === 'weightMethod' ||
            columnName === 'discardReason' ||
            columnName === 'disposition'
          ) {
            catches[ids[1]][columnName] = {
              description: data.value.description,
              _id: data.value._id
            };
          } else if (columnName === 'name') {
            catches[ids[1]].catchContent = data.value;
          } else if (columnName === 'weight') {
            catches[ids[1]][columnName].value = data.value;
          }
        } else if (ids.length === 3) {
          if (
            columnName === 'weightMethod' ||
            columnName === 'discardReason' ||
            columnName === 'disposition'
          ) {
            catches[ids[1]].children[ids[2]][columnName] = {
              description: data.value.description,
              _id: data.value._id
            };
          } else if (columnName === 'name') {
            catches[ids[1]].children[ids[2]].catchContent = data.value;
          } else if (columnName === 'weight') {
            catches[ids[1]].children[ids[2]][columnName].value = data.value;
            const wm: number = getWeightMethodNum(
              catches[ids[1]].weightMethod.description
            );
            catches[ids[1]] = updateCatchWeight(wm, catches[ids[1]]);
          } else if (columnName === 'count') {
            catches[ids[1]].children[ids[2]].sampleCount = data.value;
          }
        } else if (ids.length === 4) {
          if (columnName === 'weight') {
            catches[ids[1]].children[ids[2]].baskets[ids[3]][columnName].value =
              data.value;
            const wm: number = getWeightMethodNum(
              catches[ids[1]].weightMethod.description
            );
            catches[ids[1]] = updateCatchWeight(wm, catches[ids[1]]);
          } else if (columnName === 'count') {
            catches[ids[1]].children[ids[2]].baskets[ids[3]][columnName] =
              data.value;
          }
        }
        operationRecord.catches = catches;
        await masterDB.put(
          operationRecord._id,
          operationRecord,
          operationRecord._rev
        );
        await getCatches();
      } catch (err) {
        console.log(err);
      }
    }

    function getWeightMethodNum(weightMethod: string) {
      if (weightMethod === 'Actual weight') {
        return 1;
      } else if (weightMethod === 'Bin/trawl alley estimate') {
        return 2;
      } else if (weightMethod === 'Basket weight determination') {
        return 3;
      } else if (weightMethod === 'Visual estimate') {
        return 4;
      } else if (weightMethod === '"OTC - retained') {
        return 5;
      } else if (weightMethod === 'Other') {
        return 6;
      } else if (weightMethod === 'Vessel estimate') {
        return 7;
      } else if (weightMethod === 'Extrapolation (LL)') {
        return 8;
      } else if (weightMethod === 'Length/weight') {
        return 9;
      } else if (weightMethod === 'Codend') {
        return 10;
      } else if (weightMethod === 'Retained + Discard') {
        return 11;
      } else if (weightMethod === 'Delivery weights') {
        return 12;
      } else if (weightMethod === 'Tally sample') {
        return 13;
      } else if (weightMethod === 'Visual Experience') {
        return 14;
      } else if (weightMethod === 'PHLB length weight extrapolation') {
        return 19;
      } else if (weightMethod === 'Actual Weight  - Whole Haul') {
        return 20;
      } else if (weightMethod === 'Actual Weight - Subsample') {
        return 21;
      } else {
        return -1;
      }
    }

    return {
      WcgopCatches,
      wcgopCatchTreeSettings,
      expandedKeys,
      program,
      lookupsList,
      save,
      select
    };
  }
});
</script>