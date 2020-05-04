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
    >
    </boatnet-tree-table>
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
          label: 'Trip #',
          align: 'left',
          field: 'tripId',
          width: '150',
          expander: true,
          isEditable: false
        },
        {
          name: 'operationNum',
          required: true,
          label: 'Haul #',
          align: 'left',
          field: 'operationNum',
          width: '80',
          isEditable: false
        },
        {
          name: 'disposition',
          required: true,
          label: 'R/D',
          align: 'left',
          field: 'disposition',
          width: '60',
          isEditable: true,
          type: 'toggle',
          lookupView: 'catch-disposition',
          lookupField: 'description'
        },
        {
          name: 'weightMethod',
          align: 'left',
          label: 'WM',
          field: 'weightMethod',
          width: '150',
          isEditable: true,
          type: 'toggle',
          lookupView: 'weight-method',
          lookupField: 'description'
        },
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name',
          width: '150',
          isEditable: true,
          type: 'toggle',
          lookupView: 'taxonomy-alias',
          lookupField: 'displayName'
        },
        {
          name: 'discardReason',
          align: 'left',
          label: 'Discard Reason',
          field: 'discardReason',
          width: '100',
          isEditable: true,
          type: 'toggle',
          lookupView: 'discard-reason',
          lookupField: 'description'
        },
        {
          name: 'weight',
          align: 'left',
          label: 'Weight (lbs)',
          field: 'weight',
          width: '100',
          isEditable: true
        },
        {
          name: 'count',
          align: 'left',
          label: 'Count',
          field: 'count',
          width: '100',
          isEditable: true
        }
      ]
    };

    watch(() => state.debriefer.operations, getCatches);

    function getCatches() {
      const catches: any[] = [];
      let catchIndex = 0;

      for (const operation of debriefer.operations) {
        for (const c of operation.catches) {
          const tripId = operation.legacy.tripId;
          const operationNum = operation.operationNum;
          const operationId = operation._id;
          let disposition = c.disposition ? c.disposition.description : '';
          const wm = c.weightMethod ? c.weightMethod.description : '';
          let weight: any = c.weight ? c.weight.value : null;
          weight = weight && weight % 1 !== 0 ? weight.toFixed(2) : weight;
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
              const discardReason = child.discardReason ? child.discardReason.description : '';
              const catchContents = child.catchContent;
              const catchName = catchContents ? catchContents.commonNames[0] : '';
              let childWeight = child.weight ? child.weight.value : null;
              childWeight =
                childWeight && childWeight % 1 !== 0
                  ? childWeight.toFixed(2)
                  : childWeight;
              const units = child.weight ? child.weight.units : '';
              const childCount = child.sampleCount;
              children.push({
                key: key + '_' + childIndex,
                data: {
                  discardReason,
                  catchName,
                  catchContents,
                  weight: childWeight,
                  count: childCount
                }
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
          if (columnName === 'weightMethod' || columnName === 'discardReason' || columnName === 'disposition') {
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
          if (columnName === 'weightMethod' || columnName === 'discardReason' || columnName === 'disposition') {
            catches[ids[1]].children[ids[2]][columnName] = {
              description: data.value.description,
              _id: data.value._id
            };
          } else if (columnName === 'name') {
            catches[ids[1]].children[ids[2]].catchContent = data.value;
          } else if (columnName === 'weight') {
            catches[ids[1]].children[ids[2]][columnName].value = data.value;
          } else if (columnName === 'count') {
            catches[ids[1]].children[ids[2]].sampleCount = data.value;
          }
        }
        operationRecord.catches = catches;
        await masterDB.put(operationRecord._id, operationRecord, operationRecord._rev);
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