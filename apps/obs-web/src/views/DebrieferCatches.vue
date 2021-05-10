<template>
  <div>
    <boatnet-tree-table
      :nodes.sync="WcgopCatches"
      :columns="wcgopColumns"
      p-scrollable-body
      :isEditable="true"
      :program="program"
      type="catch"
      :isFullSize="isFullSize"
      :lookupsMap="lookupsMap"
      @save="save"
      @selected="select"
      :initExpandedKeys="expandedKeys"
      @expand="addNode"
      @collapse="removeNode"
    ></boatnet-tree-table>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, watch } from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { updateCatchWeight } from '@boatnet/bn-expansions';
import { merge, get, orderBy } from 'lodash';

export default createComponent({
  props: {
    isFullSize: Boolean,
    lookupsMap: Array
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const WcgopCatches: any = ref([]);
    const program = state.debriefer.program;

    const lookupsList: any = ref([]);

    const flatten = require('flat');
    const unflatten = flatten.unflatten;
    const jp = require('jsonpath');
    const expandedKeys: any = state.debriefer.expandedCatch ? state.debriefer.expandedCatch : {};

    const wcgopColumns = [
        {
          name: 'tripId',
          required: true,
          header: 'Trip',
          align: 'left',
          field: 'tripId',
          width: '150',
          expander: true,
          isEditable: false,
          order: 1
        },
        {
          name: 'operationNum',
          required: true,
          header: 'Haul',
          align: 'left',
          field: 'operationNum',
          width: '80',
          isEditable: false,
          order: 2
        },
        {
          name: 'catchNum',
          required: true,
          header: 'Catch',
          align: 'left',
          field: 'catchNum',
          width: '80',
          isEditable: false,
          order: 3
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
          lookupField: 'legacy.lookupVal',
          order: 4
        },
        {
          name: 'weightMethod',
          align: 'left',
          header: 'WM',
          field: 'weightMethod',
          width: '200',
          codeWidth: '70',
          isEditable: true,
          type: 'toggle-search',
          lookupView: 'weight-method',
          lookupField: 'description',
          order: 5
        },
        {
          name: 'name',
          align: 'left',
          header: 'Name',
          field: 'name',
          width: '200',
          codeWidth: '100',
          isEditable: true,
          type: 'toggle-search',
          lookupView: 'taxonomy-alias',
          lookupField: 'displayName',
          order: 6
        },
        {
          name: 'count',
          align: 'left',
          header: 'Count',
          field: 'count',
          width: '100',
          type: 'number',
          isEditable: true,
          order: 7
        },
        {
          name: 'weight',
          align: 'left',
          header: 'Weight (lbs)',
          field: 'weight',
          type: 'double',
          width: '100',
          isEditable: true,
          order: 8
        },
        {
          name: 'basketCnt',
          align: 'left',
          header: 'Basket Cnt',
          field: 'basketCnt',
          type: 'double',
          width: '70',
          isEditable: false,
          order: 9
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
          isEditable: false,
          order: 10
        },
        {
          name: 'avgWt',
          align: 'left',
          header: 'Avg Wt (lbs)',
          field: 'avgWt',
          type: 'double',
          width: '100',
          isEditable: false,
          order: 11
        },
        {
          name: 'discardReason',
          align: 'left',
          header: 'Discard Reason',
          field: 'discardReason',
          width: '200',
          codeWidth: '100',
          isEditable: true,
          type: 'toggle-search',
          lookupView: 'discard-reason',
          lookupField: 'description',
          order: 12
        },
        {
          name: 'raio',
          align: 'left',
          header: 'Ratio',
          field: 'ratio',
          type: 'double',
          width: '100',
          isEditable: true,
          order: 13
        },
    ];

    watch(() => state.debriefer.selectedTrips, getCatches);
    watch(() => state.debriefer.selectedOperations, getCatches);

    function select(item: string[]) {
      store.dispatch('debriefer/updateSelectedBiospecimens', item);
      context.emit('changeTab', 'biospecimens');
    }

    function addNode(currExpandedKeys: any) {
      store.dispatch('debriefer/updateExpandedCatch', currExpandedKeys);
    }
    function removeNode(currExpandedKeys: any) {
      store.dispatch('debriefer/updateExpandedCatch', currExpandedKeys);
    }

    async function getCatches() {
      let catches: any[] = [];
      let color = '#344B5F';
      if (state.debriefer.catches.length > 1) {
       catches = state.debriefer.catches;
      } else {
        for (const operation of state.debriefer.selectedOperations) {
          const unflattenedOperation = unflatten(operation, { delimiter: '-' });
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
                const discardReason =  jp.query(child, '$..discardReason.description')[0];

                const catchContents = child.catchContent;
                const catchName = catchContents
                  ? catchContents.commonNames[0]
                  : '';
                const childWeight = jp.query(child, 'weight.value')[0];
                const childCount = child.sampleCount;
                let toolTipInfo: string = '';

                const specimenIds: string[] = jp.query(child, '$..specimens[*]._id');
                const specimensCnt: number = child.specimens ? child.specimens.length : 0;

                const lengths: number[] = jp.query(child, '$..specimens[*].length.value');
                toolTipInfo += lengths.length > 0 ? 'lengths: ' + lengths.join(', ') : '';

                const specimenType: string[] = jp.query(child, '$..specimens[*].biostructures[*].structureType.description');
                toolTipInfo += specimenType.length > 0 ? ' specimen types: ' + specimenType.join(', ') : '';

                const sex: string[] = jp.query(child, '$..specimens[*].sex');
                toolTipInfo += sex.length > 0 ? ' sex: ' + sex.join(', ') : '';

                const viability: string[] = jp.query(child, '$..specimens[*].viability.description');
                toolTipInfo += viability.length > 0 ? ' viability: ' + viability.join(', ') : '';

                const baskets: any[] = [];
                let basketCnt;
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
                        avgWt: basket.weight.value / basket.count,
                        disposition,
                        weightMethod: wm,
                        operationNum,
                        catchNum: c.catchNum,
                        type: 'basket'
                      }
                    });
                    basketCount++;
                  }
                }
                const newChild: any = {
                  key: key + '_' + childIndex,
                  data: {
                    specimensCnt,
                    specimenIds,
                    basketCnt,
                    toolTipInfo,
                    discardReason,
                    name: catchName,
                    catchContent: catchContents,
                    weight: childWeight,
                    count: childCount,
                    disposition,
                    weightMethod: wm,
                    operationNum,
                    catchNum: c.catchNum,
                    type: 'child'
                  }
                };
                // if there is only one basket do not show dropdown row
                // instead, merge info with top level item
                if (baskets.length === 1) {
                  const combined = merge(newChild, baskets[0]);
                  combined.data.type = 'child';
                  combined.data.name = catchName;
                  children.push(combined);
                } else {
                  newChild.children = baskets;
                  children.push(newChild);
                }
                childIndex++;
              }
            }

            const newCatchItem: any = {
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
                count,
                type: 'topLevel'
              }
            };
            // if there is only one basket do not show dropdown row
            // instead, merge info with top level item
            if (children.length === 1) {
              const combined = merge(newCatchItem, children[0]);
              combined.data.type = 'topLevel';
              catches.push(combined);
            } else {
              newCatchItem.children = children;
              catches.push(newCatchItem);
            }
            catchIndex++;
          }
        }
      }
      catches = orderBy(catches, ['data.tripId', 'data.operationNum', 'data.catchNum'], ['asc', 'asc', 'asc']);
      WcgopCatches.value = catches;
    }
    getCatches();

    async function save(newRecord: any) {
      store.dispatch('debriefer/updateCatches', WcgopCatches.value);
      const masterDB: Client<any> = couchService.masterDB;

      const columnInfo = newRecord.data.column;
      const recordInfo = newRecord.data.node;
      const recordData = recordInfo.data;

      const ids = recordInfo.key.split('_');
      const columnName = columnInfo.field;
      const newValue = get(recordData, columnName);
      const newId = get(newRecord.event.value, '_id');

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
              description: newValue,
              _id: newId
            };
          } else if (columnName === 'name') {
            catches[ids[1]].catchContent = newRecord.event.value;
          } else if (columnName === 'weight') {
            catches[ids[1]][columnName].value = newValue;
          }
        } else if (ids.length === 3) {
          if (
            columnName === 'weightMethod' ||
            columnName === 'discardReason' ||
            columnName === 'disposition'
          ) {
            catches[ids[1]].children[ids[2]][columnName] = {
              description: newValue,
              _id: newId
            };
          } else if (columnName === 'name') {
            catches[ids[1]].children[ids[2]].catchContent = newRecord.event.value;
          } else if (columnName === 'weight') {
            catches[ids[1]].children[ids[2]][columnName].value = newValue;
            const wm: number = getWeightMethodNum(
              catches[ids[1]].weightMethod.description
            );
            catches[ids[1]] = updateCatchWeight(wm, catches[ids[1]]);
          } else if (columnName === 'count') {
            catches[ids[1]].children[ids[2]].sampleCount = newValue;
          }
        } else if (ids.length === 4) {
          if (columnName === 'weight') {
            catches[ids[1]].children[ids[2]].baskets[ids[3]][columnName].value =
              newValue;
            const wm: number = getWeightMethodNum(
              catches[ids[1]].weightMethod.description
            );
            catches[ids[1]] = updateCatchWeight(wm, catches[ids[1]]);
          } else if (columnName === 'count') {
            catches[ids[1]].children[ids[2]].baskets[ids[3]][columnName] =
              newValue;
          }
        }
        operationRecord.catches = catches;
        await masterDB.put(
          operationRecord._id,
          operationRecord,
          operationRecord._rev
        );
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
      addNode,
      removeNode,
      WcgopCatches,
      wcgopColumns,
      program,
      lookupsList,
      expandedKeys,
      save,
      select
    };
  }
});
</script>