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

export default createComponent({
  setup(props, context) {
    const state = context.root.$store.state;
    const debriefer: any = state.debriefer;
    const WcgopCatches: any = ref([]);
    const expandedKeys: any = ref([]);
    const program = state.debriefer.program;

    const lookupsList: any = ref([]);

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
          expander: true,
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
          type: 'toggle',
          lookupView: 'catch-disposition',
          lookupField: 'abbreviation'
        },
        {
          name: 'weightMethod',
          align: 'left',
          header: 'WM',
          field: 'weightMethod',
          width: '150',
          isEditable: true,
          type: 'toggle-search',
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
          width: '100',
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

    watch(() => state.debriefer.operations, getCatches);

    async function getCatches() {
      const catches: any[] = [];
      
      const masterDB: Client<any> = couchService.masterDB;
      let operationIds: string[] = [];
      const operationHolder = [];

      for (const trip of debriefer.trips) {
        operationIds = operationIds.concat(trip.operationIDs);
      }

      try {
        const options: ListOptions = {
          keys: operationIds
        };
        const operations = await masterDB.listWithDocs(options);
        for (const operation of operations.rows) {
          let catchIndex = 0;
          for (const c of operation.catches) {
            const tripId = operation.legacy.tripId;
            const operationNum = operation.operationNum;
            const operationId = operation._id;
            let disposition = c.disposition ? c.disposition.description : '';
            const wm = c.weightMethod ? c.weightMethod.description : '';
            const weight: any = c.weight ? c.weight.value : null;
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
                    basketCnt,
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
              data: {
                tripId,
                operationNum,
                operationId,
                catchNum: c.catchNum,
                disposition,
                weightMethod: wm,
                name,
                catchContent,
                weight
              },
              children
            });
            catchIndex++;
          }
        }
        WcgopCatches.value = catches;
      } catch (err) {
        console.log('error fetching operations from couch: ' + err);
      }
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
            catches[ids[1]] = updateCatchWeight(catches[ids[1]]);
          } else if (columnName === 'count') {
            catches[ids[1]].children[ids[2]].sampleCount = data.value;
          }
        } else if (ids.length === 4) {
          if (columnName === 'weight') {
            catches[ids[1]].children[ids[2]].baskets[ids[3]][columnName].value =
              data.value;
            catches[ids[1]] = updateCatchWeight(catches[ids[1]]);
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

    return {
      WcgopCatches,
      wcgopCatchTreeSettings,
      expandedKeys,
      program,
      lookupsList,
      save
    };
  }
});
</script>