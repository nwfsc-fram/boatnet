<template>
  <div>
    <DataTable
      :value="data"
      :filters="filters"
      :resizableColumns="true"
      columnResizeMode="expand"
      sortMode="multiple"
      data-key="_id"
      :scrollable="true"
      ref="dt"
    >
      <template #header>
        <span style="text-align:left; float: left">
          <MultiSelect
            v-model="columns"
            :options="columnOptions"
            optionLabel="header"
            placeholder="Select Columns"
            style="width: 20em"
          >
            <template #value="slotProps">
              <div>Display Columns</div>
            </template>
          </MultiSelect>
        </span>

        <span style="float: right">
            <Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" class="p-button" />
        </span>
        <div style="clear:both;"></div>
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

import { Notify } from 'quasar';
import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
//import { sourceType } from '@boatnet/bn-models';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;

    const columns: any = ref([]);
    const columnOptions: any = ref([]);

    const data: any = ref([]);
    const loading: any = ref(false);
    const filters: any = reactive({});

    function exportCSV() {
      //context.root.$refs.exportCSV;
      console.log('export csv')
        }

    init();

    async function init() {
      const tripNum = parseInt(context.root.$route.params.id);
      const results = await masterDB.viewWithDocs('TripsApi', 'all_api_catch', {
        key: tripNum,
      });
      const emReview = results.rows.filter((row: any) => 'thirdParty' === row.doc.source);
      const logbookReview = results.rows.filter((row: any) => 'logbook' === row.doc.source);

      console.log('em review')
      console.log(JSON.stringify(emReview));

      console.log('boththt')
      console.log(results);

      //for (let i = 0; i < emReview.hauls)

      console.log(context.root.$route.params.id);
      data.value = [
        {
          _id: 175771,
          lbHaulId: 1,
          emHaulId: 2,
          match: '1EM: 1LB',
          fishery: 'Bottom Trawl',
          deliveryDate: '2019-02-04',
        },
        {
          _id: 175772,
          lbHaulId: 2,
          emHaulId: 3,
          match: '1EM: 1LB',
          fishery: 'Fixed Gear',
          deliveryDate: '2018-02-04',
        },
      ];

      columns.value = [
        {
          field: 'lbHaulId',
          header: 'Lb Haul Id',
          width: 120
        },
        {
          field: 'emHaulId',
          header: 'Em Fishing Event ID',
          width: 200
        },
        {
          field: 'match',
          header: 'Match',
          width: 100
        },
        {
          field: 'fishery',
          header: 'Fishery',
          width: 100
        },
        {
          field: 'fishTicketNum',
          header: 'Fish Ticket #',
          width: 150
        },
        {
          field: 'deliveryDate',
          header: 'Delivery Date',
          width: 150
        },
        {
          field: 'vesselName',
          header: 'Vessel Name',
          width: 150

        },
        {
          field: 'vesselNum',
          header: 'Vessel #',
          width: 120
        },
        {
          field: 'tripRef',
          header: 'Trip Reference',
          width: 200
        },
        {
          field: 'logbookPgNum',
          header: 'Logbook Page #',
          width: 170
        },
        {
          field: 'emDeptDate',
          header: 'EM Departure Date Time',
          width: 220
        },
        {
          field: 'emReturnDate',
          header: 'EM Return Date Time',
          width: 220
        },
        {
          field: 'emFishingEventNum',
          header: 'EM Fishing Event #',
          width: 220
        },
        {
          field: 'emFishingEventStart',
          header: 'EM FishingEvent Start',
          width: 220
        },
        {
          field: 'emFishingEventEnd',
          header: 'EM Fishing Event End',
          width: 220
        },
        {
          field: 'emFishingEventStartLat',
          header: 'EM Fishing Event Start Latitude',
          width: 220
        },
        {
          field: 'emFishingEventStartLong',
          header: 'EM Fishing Event Start Longitude',
          width: 220
        },
        {
          field: 'emFishingEventEndLat',
          header: 'EM Fishing Event End Latitude',
          width: 220
        },
        {
          field: 'emFishingEventEndLong',
          header: 'EM Fishing Event End Longitude',
          width: 220
        },
        {
          field: 'emPotCount',
          header: 'EM Pot Count',
          width: 140
        },
        {
          field: 'lbDeptDateTime',
          header: 'LB Departure Date Time',
          width: 150
        },
        {
          field: 'lbReturnDateTime',
          header: 'LB Return Date Time',
          width: 150
        },
        {
          field: 'lbHaulNum',
          header: 'LB Haul Num',
          width: 100
        },
        {
          field: 'lbHaulStartDateTime',
          header: 'Lb Haul Start Date Time',
          width: 220
        },
        {
          field: 'lbHaulStartLat',
          header: 'Lb Haul Start Latitude',
          width: 220
        },
        {
          field: 'lbHaulStartLong',
          header: 'Lb Haul Start Longitude',
          width: 220
        },
        {
          field: 'lbHaulEndLat',
          header: 'Lb Haul End Latitude',
          width: 220
        },
        {
          field: 'lbHaulEndLong',
          header: 'Lb Haul End Longitude',
          width: 220
        },
        {
          field: 'lbHaulStartDepth',
          header: 'Lb Haul Start Depth',
          width: 120
        },
        {
          field: 'lbHaulEndDepth',
          header: 'Lb Haul End Depth',
          width: 120
        },
        {
          field: 'lbHaulAvgDepth',
          header: 'Lb Haul Avg Depth',
          width: 120
        },
        {
          field: 'lbPotCount',
          header: 'Lb Pot Count',
          width: 100
        },
        {
          field: 'netType',
          header: 'Net Type',
          width: 120
        },
        {
          field: 'obsSpeciesCode',
          header: 'Observer Species Code',
          width: 150
        },
        {
          field: 'commonName',
          header: 'Common Name',
          width: 100
        },
        {
          field: 'emDiscardWeight',
          header: 'EM Discard Weight',
          width: 150
        },
        {
          field: 'lbDiscardWeight',
          header: 'Lb Discard Weight',
          width: 150
        },
        {
          field: 'lbRetainedWeight',
          header: 'Lb Retained Weight',
          width: 150
        }

      ];
      columnOptions.value = [...columns.value];
    }

    return {
      columns,
      columnOptions,
      filters,
      loading,
      data,
      exportCSV
    };
  },
});
</script>

<style>
</style>