<template>
  <div v-bind:style="{ minWidth: columns.length * 100 + 'px' }">
      <DataTable
        v-if="!loading"
        :value="data"
        :filters="filters"
        :autoLayout="true"
        :tableStyle="{'table-layout':'auto'}"
        sortMode="multiple"
        :selection.sync="selected"
        selectionMode="single"
        @row-select="onRowSelect"
        @row-unselect="onRowUnselect"
        @cell-edit-init="onCellEditInit"
        data-key="_id"
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

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const columns: any = [
        {field: 'tripNum', header: 'Trip #'},
        {field: 'vesselName', header: 'Vessel Name'},
        {field: 'vesselId', header: 'Vessel #'},
        {field: 'source', header: 'Catch Type'},
        {field: 'provider', header: 'EM Provider'},
        {field: 'revision', header: 'Revision #'},
        {field: 'reviewerName', header: 'Reviewer'},
        {field: 'totalReviewTime', header: 'Total Review Time'},
        {field: 'errorType', header: 'Error Type'},
        {field: 'errorField', header: 'Error Field'},
        {field: 'errorMessage', header: 'Error Message'},
        {field: 'errorHaulNum', header: 'Haul Num'},
        {field: 'errorCatchId', header: 'Catch Id'},
    ];

    const data: any[] = [];

    const filters: any = reactive({});
    const columnOptions = [...columns];
    let cellVal: string = '';
    const selected: any = [];

    const loading = ref(false);

    const onCellEditInit = (event: any) => {
        cellVal = get(event.data, event.field);
    };

    const onRowSelect = (event: any) => {
        if (event.data.source === 'logbook') {
            context.root.$router.push({path: 'e-logbook/' + event.data.tripNum});
        } else if (event.data.source === 'thirdParty') {
            context.root.$router.push({path: 'em-review/' + event.data.tripNum});
        }
        context.emit('onRowSelect', event);
    };

    const onRowUnselect = (event: any) => {
        context.emit('onRowUnselect', event);
    };


    const getVal = (rowData: any, field: any, header: any) => {
        return rowData[field];
    };

    const getErrors = async () => {
        loading.value = true;
        const masterDb: Client<any> = couchService.masterDB;
        const errors: any = await masterDb.view(
            'TripsApi',
            'all_api_catch_errors',
            {reduce: false, include_docs: false} as any
        );

        for (const row of errors.rows) {
            data.push({
                _id: row.id + '.' + Math.random(),
                tripNum: row.key,
                vesselName: row.value[0],
                vesselId: row.value[1],
                source: row.value[2],
                provider: row.value[3],
                revision: row.value[4],
                reviewerName: row.value[5],
                totalReviewTime: row.value[6],
                errorType: row.value[7].type,
                errorField: row.value[7].field,
                errorMessage: row.value[7].message,
                errorHaulNum: row.value[7].HaulNum,
                errorCatchId: row.value[7].CatchId
            });
        }
        loading.value = false;
    };

    onMounted( () => {
        getErrors();
    });

    return { data, filters, columns, columnOptions, cellVal, selected, onCellEditInit, onRowSelect, onRowUnselect, getVal, loading};
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
</style>
