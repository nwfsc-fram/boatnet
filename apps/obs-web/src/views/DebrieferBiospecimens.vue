<template>
  <div>
    <prime-table
      :value="WcgopBiospecimens"
      :columns="columns"
      type="biospecimens"
      uniqueKey="_id"
      :initialSelection="initialSelection"
      :enableSelection="true"
      :showSelectionBoxes="false"
      :isFullSize="isFullSize"
      @save="save"
    />
  </div>
</template>

<script lang="ts">
import { createComponent, ref, watch, onUnmounted } from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { cloneDeep, filter, findIndex, orderBy, slice } from 'lodash';

export default createComponent({
  props: {
    isFullSize: Boolean
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;
    const debriefer = state.debriefer;
    const WcgopBiospecimens: any = ref([]);

    const jp = require('jsonpath');
    const flatten = require('flat');
    const unflatten = flatten.unflatten;
    const initialSelection: any = ref([]);
    const displayColumns: any = state.debriefer.displayColumns;

    onUnmounted(() => {
      store.dispatch('debriefer/updateSelectedBiospecimens', []);
    });

    const columns = [
      {
        field: 'tripId',
        header: 'Trip #',
        type: 'number',
        key: 'wcgopBioTripId',
        width: '80'
      },
      {
        field: 'operationNum',
        header: 'Haul #',
        type: 'number',
        key: 'wcgopBioHaulNum',
        width: '80'
      },
      {
        field: 'catchNum',
        header: 'Catch #',
        type: 'number',
        key: 'wcgopBioCatchNum',
        width: '80'
      },
      {
        field: 'species',
        header: 'Species',
        type: 'input',
        key: 'wcgopBioSpecies',
        width: '150'
      },
      {
        field: 'received',
        header: 'Received',
        type: 'toggle',
        list: ['Y', 'N'],
        listType: 'template',
        key: 'wcgopBioReceived',
        isEditable: true,
        width: '80'
      },
      {
        field: 'disposition',
        header: 'R/D',
        type: 'input',
        key: 'wcgopBioDisposition',
        width: '60'
      },
      {
        field: 'specimen-biosampleMethod-description',
        header: 'BM',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioBM',
        lookupKey: 'biospecimen-sample-method',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen-sex',
        header: 'Sex',
        type: 'toggle',
        listType: 'template',
        list: ['F', 'M', 'U'],
        key: 'wcgopBioSex',
        isEditable: true,
        width: '60'
      },
      {
        field: 'specimen-length-value',
        header: 'Length',
        type: 'number',
        key: 'wcgopBioLength',
        width: '60',
        isEditable: true
      },
      {
        field: 'specimen-width-value',
        header: 'Width',
        type: 'number',
        key: 'wcgopBioWidth',
        width: '60',
        isEditable: true
      },
      {
        field: 'specimen-viability-description',
        header: 'Viability',
        type: 'toggle',
        lookupKey: 'viability',
        lookupField: 'description',
        isEditable: true,
        listType: 'fetch',
        key: 'wcgopBioVia',
        width: '100'
      },
      {
        field: 'specimen-maturity-description',
        header: 'Maturity',
        type: 'toggle',
        listType: 'fetch',
        isEditable: true,
        lookupKey: 'maturity',
        lookupField: 'description',
        key: 'wcgopBioMaturity',
        width: '100'
      },
      {
        field: 'specimen-adiposePresent',
        header: 'Adi',
        type: 'toggle',
        listTyle: 'template',
        list: ['Y', 'N'],
        isEditable: true,
        key: 'wcgopBioAdi',
        width: '60'
      },
      {
        field: 'specimen-biostructures-0-structureType-description',
        header: 'Type 1',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioType1',
        lookupKey: 'biostructure-type',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen-biostructures-0-label',
        header: '# 1',
        type: 'number',
        key: 'wcgopBioBarcode1',
        width: '80',
        isEditable: true
      },
      {
        field: 'specimen-biostructures-1-structureType-description',
        header: 'Type 2',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioType2',
        lookupKey: 'biostructure-type',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen-biostructures-1-label',
        header: '# 2',
        type: 'number',
        key: 'wcgopBioBarcode2',
        width: '80',
        isEditable: true
      },
      {
        field: 'specimen-biostructures-2-structureType-description',
        header: 'Type 3',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioType3',
        lookupKey: 'biostructure-type',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen-biostructures-2-label',
        header: '# 3',
        type: 'number',
        key: 'wcgopBioBarcode3',
        width: '80',
        isEditable: true
      }
    ];

    watch(() => state.debriefer.selectedOperations, getBiospecimens);

    async function getBiospecimens() {
      let bioSpecimens: any[] = [];
      if (state.debriefer.biospecimens.length > 1) {
        bioSpecimens = state.debriefer.biospecimens;
      } else {
        const operations = state.debriefer.selectedOperations;
        const unflattenedOperations: any[] = [];
        for (const op of operations) {
          unflattenedOperations.push(unflatten(op, { delimiter: '-' }));
        }

        const id: number = 1;
        const specimens = jp.nodes(unflattenedOperations, '$..specimens');

        for (const specimen of specimens) {
          const operationPath = jp.stringify(slice(specimen.path, 0, 2));
          const catchesPath = jp.stringify(slice(specimen.path, 0, 4));
          const childrenPath = jp.stringify(slice(specimen.path, 0, 6));

          const tripId = jp.value(unflattenedOperations, operationPath + '.legacy.tripId');
          const operationNum = jp.value(
            unflattenedOperations,
            operationPath + '.operationNum'
          );
          const operationId = jp.value(unflattenedOperations, operationPath + '._id');
          const operationRev = jp.value(unflattenedOperations, operationPath + '._rev');
          const catchNum = jp.value(unflattenedOperations, catchesPath + '.catchNum');
          let disposition = jp.value(
            unflattenedOperations,
            catchesPath + '.disposition.description'
          );
          disposition = disposition === 'Retained' ? 'R' : 'D';
          const species = jp.value(
            unflattenedOperations,
            childrenPath + '.catchContent.commonNames[0]'
          );

          for (const indivSpecimen of specimen.value) {
            if (indivSpecimen._id) {
              const biospecimen = {
                _id: indivSpecimen._id,
                tripId,
                operationNum,
                catchNum,
                operationId,
                operationRev,
                disposition,
                species,
                specimen: indivSpecimen
              };
              bioSpecimens.push(biospecimen);
            } else {
              console.log('id not found skipping record');
            }
          }
        }
      }
      WcgopBiospecimens.value = orderBy(bioSpecimens, ['tripId', 'operationNum', 'catchNum'], ['asc', 'asc', 'asc']);
      initialSelection.value = filter(WcgopBiospecimens.value, (val: any) => {
        if (debriefer.selectedBiospecimens.includes(val._id)) {
          return val;
        }
      });
    }

    async function save(data: any) {
      const speciesId = data._id;
      const currOperationDoc = await masterDB.get(data.operationId);

      const specimenInfo = jp.paths(currOperationDoc, '$..specimens[?(@._id=="' + speciesId + '")]');
      const path = jp.stringify(specimenInfo[0]);
      jp.apply(currOperationDoc, path, () => data.specimen);

      const result = await masterDB.put(currOperationDoc._id, currOperationDoc, currOperationDoc._rev);
      const currIndex = findIndex(WcgopBiospecimens.value, { _id: speciesId });
      const updatedvalue: any[] = cloneDeep(WcgopBiospecimens.value);
      updatedvalue[currIndex] = data;
      jp.apply(WcgopBiospecimens.value, '$..[?(@.operationId=="' + currOperationDoc._id + '")]', (value: any) => {
        value.operationRev = result.rev;
        return value;
      });
      WcgopBiospecimens.value = updatedvalue;
      store.dispatch('debriefer/updateBiospecimens', WcgopBiospecimens.value);
    }

    return {
      WcgopBiospecimens,
      initialSelection,
      columns,
      save,
      displayColumns
    };
  }
});
</script>
