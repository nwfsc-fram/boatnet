<template>
  <div>
    <prime-table
      :value="bios"
      :columns="columns"
      type="biospecimens"
      uniqueKey="_id"
      :initialSelection="initialSelection"
      :enableSelection="true"
      :showSelectionBoxes="false"
      :isFullSize="isFullSize"
      :lookupsMap="lookupsMap"
      :totalRecords="totalRecords"
      @save="save"
      @paginate="paginate"
    />
  </div>
</template>

<script lang="ts">
import { createComponent, ref, watch, onUnmounted } from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { cloneDeep, filter, findIndex, flattenDeep, orderBy, slice } from 'lodash';

export default createComponent({
  props: {
    isFullSize: Boolean,
    lookupsMap: Array
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;
    const debriefer = state.debriefer;
    const bios: any = ref([]);

    const jp = require('jsonpath');
    const flatten = require('flat');
    const unflatten = flatten.unflatten;
    const initialSelection: any = ref([]);
    const columns: any = ref([]);
    const displayColumns: any = state.debriefer.displayColumns;

    const totalRecords: any = ref(0);

    onUnmounted(() => {
      store.dispatch('debriefer/updateSelectedBiospecimens', []);
    });

    const wcgopColumns = [
      {
        field: 'tripId',
        header: 'Trip',
        type: 'number',
        key: 'wcgopBioTripId',
        width: '80'
      },
      {
        field: 'operationNum',
        header: 'Haul',
        type: 'number',
        key: 'wcgopBioHaulNum',
        width: '80'
      },
      {
        field: 'catchNum',
        header: 'Catch',
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
        width: '200',
        codeWidth: '70'
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
        width: '80',
        isEditable: true
      },
      {
        field: 'specimen-width-value',
        header: 'Width',
        type: 'number',
        key: 'wcgopBioWidth',
        width: '80',
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
        width: '200',
        codeWidth: '100'
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
        width: '200',
        codeWidth: '100'
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
        width: '200',
        codeWidth: '100'
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

    const ashopColumns = [
      {
        field: 'haulNum',
        header: 'Haul',
        type: 'number',
        key: 'ashopBioHaulNum',
        width: '80'
      },
      {
        field: 'sampleNum',
        header: 'Sample',
        type: 'number',
        key: 'ashopBioSampleNum',
        width: '80'
      },
      {
        field: 'speciesCode',
        header: 'Species Code',
        type: 'number',
        key: 'ashopBioSpeciesCode',
        width: '80'
      },
      {
        field: 'speciesName',
        header: 'Species Name',
        type: 'input',
        key: 'ashopBioSpeciesName',
        width: '150'
      },
      {
        field: 'sampleDesign',
        header: 'Sample Design',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'ashop-sample-system',
        lookupField: 'description',
        isEditable: true,
        key: 'ashopBioSampleDesign',
        width: '120'
      },
      {
        field: 'frequency',
        header: 'Frequency',
        type: 'input',
        key: 'ashopBioFrequency',
        width: '80'
      },
    ];

    function setColumns() {
      const program = state.debriefer.program;
      columns.value = [];
      if (program === 'ashop') {
          columns.value = ashopColumns;
      } else {
          columns.value = wcgopColumns;
      }
    }
    setColumns();

    watch(() => state.debriefer.operations, () => {
      if (state.debriefer.program === 'ashop') {
        getAshopBios(0, state.debriefer.pageSize);
      } else {
        getWcgopBios();
      }
    });

    function getAshopBios(start: number, rowCount: number) {
      bios.value = [];
      const currOps = state.debriefer.operations;

      let specimens: any[] = jp.query(currOps, '$[*]..specimens');
      specimens = flattenDeep(specimens);
      totalRecords.value = specimens.length;
      const currSpecimens = slice(specimens, start, start + rowCount);

      for (const spec of currSpecimens) {
        const path = '$[*]..specimens[?(@._id=="' + spec._id + '")]';
        let info: any = jp.nodes(currOps, path);
        info = info[0];

        const haulPath = jp.stringify(slice(info.path, 0, 2));
        const haulNum = jp.value(currOps, haulPath + '.haulNum');

        const samplePath = jp.stringify(slice(info.path, 0, 4));
        const sampleNum = jp.value(currOps, samplePath + '.sampleNum');

        const catchContentPath = jp.stringify(slice(info.path, 0, 6));
        const speciesCode = jp.value(currOps, catchContentPath + '.catchContent.taxonomy.legacy.ashopSpeciesId');
        const speciesName = jp.value(currOps, catchContentPath + '.catchContent.commonNames[0]');

        const specimenPath = jp.stringify(info.path);
        const sampleDesign = jp.value(currOps, specimenPath + '.sampleSystem.description');
        const sex = jp.value(currOps, specimenPath + '.sex');
        const frequency = jp.value(currOps, specimenPath + '.frequency');

        bios.value.push({
          haulNum,
          sampleNum,
          speciesCode,
          speciesName,
          sampleDesign,
          sex,
          frequency
        });
      }
    }

    function getWcgopBios() {
      let bioSpecimens: any[] = [];
      if (state.debriefer.biospecimens.length > 1) {
        bioSpecimens = state.debriefer.biospecimens;
      } else {
        const operations = state.debriefer.operations;
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
      bios.value = orderBy(bioSpecimens, ['tripId', 'operationNum', 'catchNum'], ['asc', 'asc', 'asc']);
      initialSelection.value = filter(bios.value, (val: any) => {
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
      const currIndex = findIndex(bios.value, { _id: speciesId });
      const updatedvalue: any[] = cloneDeep(bios.value);
      updatedvalue[currIndex] = data;
      jp.apply(bios.value, '$..[?(@.operationId=="' + currOperationDoc._id + '")]', (value: any) => {
        value.operationRev = result.rev;
        return value;
      });
      bios.value = updatedvalue;
      store.dispatch('debriefer/updateBiospecimens', bios.value);
    }

    function paginate(event: any) {
      getAshopBios(event.first, event.rows);
    }

    return {
      bios,
      initialSelection,
      columns,
      save,
      displayColumns,
      totalRecords,
      paginate
    };
  }
});
</script>
