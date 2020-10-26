<template>
  <div>
    <DataTable
      :value="data"
      :filters="filters"
      :resizableColumns="true"
      columnResizeMode="expand"
      sortMode="multiple"
      data-key="id"
      :scrollable="true"
      :reorderableColumns="true"
      ref="emReviewTable"
    >
      <template #header>
        <span style="text-align: left; float: left">
          <q-input
            v-model="tripNumVal"
            label="Trip #"
            @input="inputTripNum"
            :loading="loadingState"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </span>

        <span style="float: right; text-align: left">
          <MultiSelect
            v-model="columns"
            :options="columnOptions"
            optionLabel="header"
            placeholder="Select Columns"
            style="width: 20em; margin: 10px"
          >
            <template #value="slotProps">
              <div>Display Columns</div>
            </template>
          </MultiSelect>
          <Button
            icon="pi pi-external-link"
            label="Export"
            @click="exportCSV($event)"
            class="p-button"
            style="height: 35px; width: 100px; margin: 10px"
          />
        </span>
        <div style="clear: both"></div>
      </template>
      <Column
        v-for="col of columns"
        :field="col.field"
        :header="col.header"
        :key="col.field"
        :sortable="true"
        :headerStyle="'width: ' + col.width + 'px'"
        filterMatchMode="contains"
      >
        <template #filter>
          <InputText
            type="text"
            v-model="filters[col.field]"
            class="p-column-filter"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';

import { createComponent, ref, reactive } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';

import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import { Catches } from '@boatnet/bn-models';
import { get } from 'lodash';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;

    const columns: any = ref([]);
    const columnOptions: any = ref([]);

    const data: any = ref([]);
    const filters: any = reactive({});

    const emReviewTable: any = ref();
    const tripNumVal: any = ref('');
    const loadingState: any = ref(false);

    init();

    async function init() {
      const tripNum = parseInt(context.root.$route.params.id, 10);
      await populateTripInfo(tripNum);

      columns.value = [
        {
          field: 'tripNum',
          header: 'Trip #',
          width: 120,
        },
        {
          field: 'vesselName',
          header: 'Vessel Name',
          width: 150,
        },
        {
          field: 'vesselNumber',
          header: 'Vessel #',
          width: 120,
        },
        {
          field: 'haulNum',
          header: 'Haul #',
          width: 100,
        },
        // catch
        {
          field: 'catchId',
          header: 'Catch Id',
          width: 120,
        },
        {
          field: 'disposition',
          header: 'Disposition',
          width: 150,
        },
        {
          field: 'fate',
          header: 'Fate',
          width: 200,
        },
        {
          field: 'speciesName',
          header: 'Species Name',
          width: 140,
        },
        {
          field: 'speciesCode',
          header: 'Species Code',
          width: 140,
        },
        {
          field: 'weight',
          header: 'Weight',
          width: 100,
        },
        {
          field: 'length',
          header: 'Length',
          width: 100,
        },
        {
          field: 'fisherySector',
          header: 'Fishery',
          width: 100,
        },
        {
          field: 'year',
          header: 'Year',
          width: 80,
        },
        {
          field: 'permitNumber',
          header: 'Permit #',
          width: 120,
        },
        {
          field: 'isEFPTrip',
          header: 'EFP Trip',
          width: 110,
        },
        {
          field: 'isObserved',
          header: 'Observed',
          width: 120,
        },
        {
          field: 'crewSize',
          header: 'Crew Size',
          width: 120,
        },
        {
          field: 'departureDateTime',
          header: 'Departure Date Time',
          width: 220,
        },
        {
          field: 'departureState',
          header: 'Departure State',
          width: 220,
        },
        {
          field: 'departurePortCode',
          header: 'Departure Port Code',
          width: 220,
        },
        {
          field: 'returnDateTime',
          header: 'Return Date Time',
          width: 220,
        },
        {
          field: 'returnState',
          header: 'Return State',
          width: 220,
        },
        {
          field: 'returnPortCode',
          header: 'Return Port Code',
          width: 220,
        },
        // buyers?
        // fish tickets
        {
          field: 'skipperName',
          header: 'Skipper Name',
          width: 220,
        },
        {
          field: 'comment',
          header: 'Comment',
          width: 220,
        },
        {
          field: 'resubmission',
          header: 'Resubmission',
          width: 150,
        },
        {
          field: 'provider',
          header: 'Provider',
          width: 120,
        },
        {
          field: 'reviewerName',
          header: 'Reviewer Name',
          width: 170,
        },
        {
          field: 'totalReviewTime',
          header: 'Total Review Time',
          width: 200,
        },
        // haul
        {
          field: 'deliveryDate',
          header: 'Delivery Date',
          width: 150,
        },
        {
          field: 'gearTypeCode',
          header: 'Gear Type Code',
          width: 170,
        },
        {
          field: 'startDateTime',
          header: 'Start Date Time',
          width: 170,
        },
        {
          field: 'startDepth',
          header: 'Start Depth',
          width: 150,
        },
        {
          field: 'startLatitude',
          header: 'Start Long',
          width: 150,
        },
        {
          field: 'startLongitude',
          header: 'Start Lat',
          width: 150,
        },
        {
          field: 'endDateTime',
          header: 'End Date Time',
          width: 150,
        },
        {
          field: 'endDepth',
          header: 'End Depth',
          width: 150,
        },
        {
          field: 'endLatitude',
          header: 'End Lat',
          width: 150,
        },
        {
          field: 'endLongitude',
          header: 'End Long',
          width: 150,
        },
        {
          field: 'codendCapacity',
          header: 'Codend Capacity',
          width: 170,
        },
        {
          field: 'isCodendLost',
          header: 'Codend Lost',
          width: 150,
        },
        {
          field: 'haulComments',
          header: 'Haul Comments',
          width: 170,
        },
        {
          field: 'targetStrategy',
          header: 'Target Strategy',
          width: 170,
        },
        {
          field: 'systemPerformance',
          header: 'System Perf',
          width: 150,
        },
        {
          field: 'catchHandlingPerformance',
          header: 'Catch Handling Perf',
          width: 200,
        },
      ];
      columnOptions.value = [...columns.value];
    }

    async function populateTripInfo(tripNum: number) {
      data.value = [];
      const options = { key: tripNum };
      const results = await masterDB.viewWithDocs(
        'TripsApi',
        'all_api_catch',
        options
      );

      const emDoc: any = results.rows.filter(
        (row: any) => 'thirdParty' === row.doc.source
      );
      const emReview: Catches = get(emDoc, '.rows[0].doc', {});

      const hauls = get(emReview, 'hauls', []);
      for (let i = 0; i < hauls.length; i++) {
        const catches = get(emReview, 'hauls[' + i + '].catch', []);
        for (let j = 0; j < catches.length; j++) {
          const tripId = get(emReview, 'tripNum');
          const haulId = get(emReview, 'hauls[i].haulNum');
          const catchId = get(emReview, 'hauls[' + i + '].catch[' + j + '].catchId');
          const id = tripId + haulId + catchId;

          const currHaul = get(emReview, 'hauls[' + i + ']', {});
          const currCatch = get(emReview, 'hauls[' + i + '].catch[' + j + ']', {});

          // given species code query view to get species name
          const lookupOptions = { key: currCatch.speciesCode, include_docs: true };
          let lookupInfo: any = await masterDB.view('em-views', 'wcgopCode-to-pacfinCode-map', lookupOptions);
          lookupInfo = get(lookupInfo, 'rows[0].doc', {});
          let speciesName = '';
          if (lookupInfo.type === 'catch-grouping') {
            speciesName = lookupInfo.name;
          } else {
            speciesName = get(lookupInfo, 'commonNames[0]', '');
          }

          data.value.push({
            id,
            tripNum: tripId,
            fisherySector: emReview.fisherySector,
            year: emReview.year,
            vesselName: emReview.vesselName,
            vesselNumber: emReview.vesselNumber,
            permitNumber: emReview.permitNumber,
            isEFPTrip: emReview.isEFPTrip,
            isObserved: emReview.isObserved,
            crewSize: emReview.crewSize,
            departureDateTime: emReview.departureDateTime,
            departureState: emReview.departureState,
            departurePortCode: emReview.departurePortCode,
            returnDateTime: emReview.returnDateTime,
            returnPortState: emReview.returnPortState,
            returnPortCode: emReview.returnPortCode,
            skipperName: emReview.skipperName,
            comment: emReview.comment,
            // fishTickets
            // buyer

            // haul attributes
            haulNum: haulId,
            deliveryDate: currHaul.deliveryDate,
            gearTypeCode: currHaul.gearTypeCode,
            gearPerSet: currHaul.gearPerSet,
            gearLost: currHaul.gearLost,
            startDateTime: currHaul.startDateTime,
            startDepth: currHaul.startDepth,
            startLatitude: currHaul.startLatitude,
            startLongitude: currHaul.startLongitude,
            endDateTime: currHaul.endDateTime,
            endDepth: currHaul.endDepth,
            endLatitude: currHaul.endLatitude,
            endLongitude: currHaul.endLongitude,
            codendCapacity: currHaul.codendCapacity,
            isCodendLost: currHaul.isCodendLost,
            haulComments: currHaul.comments,
            targetStrategy: currHaul.targetStrategy,
            systemPerformance: currHaul.systemPerformance,
            catchHandlingPerformance: currHaul.catchHandlingPerformance,

            // catch attributes
            catchId: currCatch.catchId,
            disposition: currCatch.disposition,
            fate: currCatch.fate,
            speciesCode: currCatch.speciesCode,
            speciesName,
            weight: currCatch.weight,
            length: get(currCatch, 'lenght', 0),
          });
        }
      }
    }

    async function inputTripNum() {
      loadingState.value = true;
      await populateTripInfo(parseInt(tripNumVal.value, 10));
      loadingState.value = false;
    }

    function exportCSV() {
      const tableValue = get(emReviewTable, 'value', {});
      tableValue.exportCSV();
    }

    return {
      columns,
      columnOptions,
      filters,
      data,
      exportCSV,
      emReviewTable,
      tripNumVal,
      loadingState,
      inputTripNum,
    };
  },
});
</script>

<style>
</style>