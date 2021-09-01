<template>
  <div v-bind:style="{ minWidth: columns.length * 100 + 'px' }">
        <h6 style="margin: 10px" class="row" v-if="tripDetails">
          <span class="col">Trip #: {{ tripDetails.tripNum }} - {{ tripDetails.fishery }}</span>
          <br>
          <span class="col" style="text-align: center">{{ tripDetails.vesselName }} ({{ tripDetails.vesselId }})</span>
          <br>
          <span class="col" style="text-align: right">{{ formatDateTime(tripDetails.departureDate) }} - {{ formatDate(tripDetails.returnDate) }}</span>
          <br>
          &nbsp;&nbsp;
          <span style="color: #007EC6; cursor: pointer" @click="evalTripCatch(tripDetails.tripNum)">RE-CALCULATE</span>
        </h6>

      <DataTable
        v-if="!loading"
        :value="myResults"
        :filters="filters"
        :resizableColumns="true"
        columnResizeMode="expand"
        :tableStyle="{'table-layout':'auto'}"
        sortMode="multiple"
        data-key="_id"
        selectionMode="single"
    >
        <template #header>
            <div style="text-align:left; float:left">
                <MultiSelect
                    v-model="columns"
                    :options="columnOptions"
                    optionLabel="header"
                    placeholder="Select Columns"
                    style="width: 20em;"
                >
                    <template #value="slotProps">
                        <div>Display Columns</div>
                    </template>
                </MultiSelect>
            </div>

            <div style="text-align: right">
                <i class="pi pi-search" style="margin: 4px 4px 0px 0px;"></i>
                <InputText
                    v-model="filters['global']"
                    placeholder="Global Search"
                    onfocus="this.placeholder = ''"
                    onblur="this.placeholder = 'Global Search'"
                    class="global-search"
                />
            </div>
        </template>

        <Column
            v-for="col of columns"
            :field="col.field"
            :header="col.header"
            :key="col.field"
            :sortable="true"
            filterMatchMode="contains"
        >
            <template #filter>
                <br>
                <InputText type="text" v-model="filters[col.field]" class="p-column-filter" placeholder="" />
            </template>
            <template #body="slotProps">
                <div>
                    {{ getVal(slotProps.data, col.field, col.header) }}
                </div>
            </template>

        </Column>
    </DataTable>

    <q-spinner v-if="loading" color="primary" size="15em" class="fixed-center"></q-spinner>
  </div>
</template>

<script lang="ts">

import DataTable from 'primevue/datatable';
Vue.component('DataTable', DataTable);
import Column from 'primevue/column';
Vue.component('Column', Column);
import InputText from 'primevue/inputtext';
Vue.component('InputText', InputText);
import MultiSelect from 'primevue/multiselect';
Vue.component('MultiSelect', MultiSelect);

import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';

import { Vue, Watch } from 'vue-property-decorator';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import { Notify } from 'quasar';
import moment from 'moment';
import { get, set } from 'lodash';
import _ from 'lodash';

import { getTripsApiTrip, getCatchApiCatch, evalCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {

    const tripNum: any = ref(context.root.$route.params.id ? parseInt(context.root.$route.params.id, 10) : 0);
    const tripDetails: any = ref({});
    const columns: any = [
        {field: 'section', header: 'Section'},
        {field: 'ifqGrouping', header: 'IFQ Grouping'},
        {field: 'fishingArea', header: 'Fishing Area'},
        {field: 'pacfinSpeciesCode', header: 'Pacfin Code'},
        {field: 'wcgopSpeciesCode', header: 'Wcgop Code'},
        {field: 'disposition', header: 'Disposition'},
        {field: 'haulNum', header: 'Haul #'},
        {field: 'comments', header: 'Comments'},
        {field: 'calcWeightType', header: 'Calc Weight Type'},
        {field: 'speciesWeight', header: 'Weight'},
        {field: 'speciesCount', header: 'Count'},
        {field: 'startLatitude', header: 'Start Lat'},
        {field: 'startLongitude', header: 'Start Long'},
        {field: 'startDepth', header: 'Start Depth'},
        {field: 'endLatitude', header: 'End Lat'},
        {field: 'endLongitude', header: 'End Long'},
        {field: 'endDepth', header: 'End Depth'},
        {field: 'gearType', header: 'Gear Type'}
    ];

    const myResults: any[] = reactive([]);

    const filters: any = reactive({});
    const columnOptions = [...columns];
    let cellVal: string = '';
    const selected: any = [];

    const loading = ref(false);

    const onCellEditInit = (event: any) => {
        cellVal = get(event.data, event.field);
    };

    const onRowSelect = (event: any) => {
        // if (event.data.source === 'logbook') {
        //     context.root.$router.push({path: 'e-logbook/' + event.data.tripNum});
        // } else if (event.data.source === 'thirdParty') {
        //     context.root.$router.push({path: 'em-review/' + event.data.tripNum});
        // }
        // context.emit('onRowSelect', event);
    };

    const onRowUnselect = (event: any) => {
        // context.emit('onRowUnselect', event);
    };


    const getVal = (rowData: any, field: any, header: any) => {
        if (field === 'speciesWeight') {
            return rowData[field] ? Math.round(rowData[field]) : '';
        } else {
            return rowData[field] ? rowData[field] : '';
        }
    };

    const getResults = async () => {
        loading.value = true;
        const masterDb: Client<any> = couchService.masterDB;

        const results: any = await masterDb.view(
            'TripsApi',
            'expansion_results',
            {reduce: false, include_docs: true, key: tripNum.value} as any
        );

        for (const row of results.rows) {
            const logbookCatch = row.doc.logbookCatch;
            logbookCatch.forEach( (result: any) => result.section = 'Logbook');
            const thirdPartyReviewCatch = row.doc.thirdPartyReviewCatch;
            thirdPartyReviewCatch.forEach( (result: any) => result.section = 'Review');
            const nwfscAuditCatch = row.doc.nwfscAuditCatch;
            nwfscAuditCatch.forEach( (result: any) => result.section = 'Audit');
            const ifqLogbookCatchHaulLevel = row.doc.ifqLogbookCatchHaulLevel;
            ifqLogbookCatchHaulLevel.forEach( (result: any) => result.section = 'IFQ Logbook Haul');
            const ifqThirdPartyReviewCatchHaulLevel = row.doc.ifqThirdPartyReviewCatchHaulLevel;
            ifqThirdPartyReviewCatchHaulLevel.forEach( (result: any) => result.section = 'IFQ Review Haul');
            const ifqNwfscAuditHaulLevel = row.doc.ifqNwfscAuditHaulLevel;
            ifqNwfscAuditHaulLevel.forEach( (result: any) => result.section = 'IFQ Audit Haul');
            const ifqLogbookTripLevel = row.doc.ifqLogbookTripLevel;
            ifqLogbookTripLevel.forEach( (result: any) => result.section = 'IFQ Logbook Trip');
            const ifqThirdPartyReviewTripLevel = row.doc.ifqThirdPartyReviewTripLevel;
            ifqThirdPartyReviewTripLevel.forEach( (result: any) => result.section = 'IFQ Review Trip');
            const ifqNwfscAuditTripLevel = row.doc.ifqNwfscAuditTripLevel;
            ifqNwfscAuditTripLevel.forEach( (result: any) => result.section = 'IFQ Audit Trip');
            const ifqTripReporting = row.doc.ifqTripReporting;
            ifqTripReporting.forEach( (result: any) => result.section = 'IFQ Reporting');

            myResults.push.apply(myResults, logbookCatch);
            myResults.push.apply(myResults, thirdPartyReviewCatch);
            myResults.push.apply(myResults, nwfscAuditCatch);
            myResults.push.apply(myResults, ifqLogbookCatchHaulLevel);
            myResults.push.apply(myResults, ifqThirdPartyReviewCatchHaulLevel);
            myResults.push.apply(myResults, ifqNwfscAuditHaulLevel);
            myResults.push.apply(myResults, ifqLogbookTripLevel);
            myResults.push.apply(myResults, ifqThirdPartyReviewTripLevel);
            myResults.push.apply(myResults, ifqNwfscAuditTripLevel);
            myResults.push.apply(myResults, ifqTripReporting);

            for (const result of myResults) {
                result._id = Math.random();
            }
        }
        loading.value = false;
    };

    const evalTripCatch = async (tripNumber: number) => {
        await evalCatch(tripNumber);
        console.log('catch re-evaluated');
        Notify.create(
            {
                message: 'Catch re-evaluated  - manually refresh page after about a minute',
                position: 'top-right',
                color: 'grey',
                timeout: 5000,
                multiLine: true
            }
        );
    };

    const formatDateTime = (date: any) => {
        return moment(date).format('MMM DD, YYYY HH:mm');
    };

    const formatDate = (date: any) => {
        return moment(date).format('MMM DD, YYYY');
    };


    onMounted( async () => {
        tripDetails.value = await getTripsApiTrip(tripNum.value);
        getResults();
    });

    return {
        cellVal,
        columns,
        columnOptions,
        evalTripCatch,
        filters,
        formatDate,
        formatDateTime,
        getVal,
        loading,
        onCellEditInit,
        onRowSelect,
        onRowUnselect,
        myResults,
        selected,
        tripDetails,
        tripNum
    };
  }
});
</script>

<style scoped>
    .p-inputtext {
        background-color: white !important;
        padding: 5px !important;
        border: 1px solid rgb(170, 169, 169) !important;
        border-radius: 3px !important;
        width: 100%
    }

    .global-search {
        width: auto !important;
    }

    .table-title {
        margin: 10px;
        text-transform: uppercase;
    }
</style>
