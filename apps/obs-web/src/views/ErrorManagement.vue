<template>

  <div v-bind:style="{ minWidth: columns.length * 100 + 'px' }">
      <DataTable
        v-if="!loading"
        :value="data"
        :filters="filters"
        :resizableColumns="true"
        columnResizeMode="expand"
        :tableStyle="{'table-layout':'auto'}"
        :paginator="true"
        :rows="20"
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
                    debounce="2000"
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
                <q-btn-toggle
                    toggle-color="primary"
                    dense
                    :options="[
                        {label: 'T', value: true},
                        {label: 'F', value: false},
                        {label: '/', value: null}
                        ]"
                    v-model="filters[col.field]"
                    v-if="toggleFields.includes(col.field)"
                    ></q-btn-toggle>
                <InputText type="text" v-else v-model="filters[col.field]" class="p-column-filter" placeholder="" debounce="2000"/>
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
import { Vue } from 'vue-property-decorator';

import { Notify } from 'quasar';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import { get, set } from 'lodash';
import _ from 'lodash';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
    setup(props, context) {
        const columns: any = [
            {field: 'name', header: 'Name' },
            {field: 'description', header: 'Description'},
            {field: 'program', header: 'Program'},
            {field: 'isActive', header: 'Active?'},
            {field: 'onEntry', header: 'On Entry?'},
            {field: 'tripCheck', header: 'Trip Check?'},
            {field: 'createdBy', header: 'Created By'},
            {field: 'createdDate', header: 'Created Date'},
            {field: 'updatedBy', header: 'Updated By'},
            {field: 'updatedDate', header: 'Updated Date'},
        ];

        const toggleFields: string[] = [
                        'isActive',
                        'onEntry',
                        'tripCheck',
                        ];

        const data: any[] = reactive([]);
        const loading: any = ref(false);

        const filters: any = reactive({
                        isActive: null,
                        onEntry: null,
                        tripCheck: null,
                        });
        const columnOptions = [...columns];
        let cellVal: string = '';
        const selected: any = [];

        const onCellEditInit = (event: any) => {
            cellVal = get(event.data, event.field);
        };

        const onRowSelect = (event: any) => {
            // context.root.$router.push({path: '/species-detail/' + event.data._id});
            // context.emit('onRowSelect', event);
        };

        const onRowUnselect = (event: any) => {
            context.emit('onRowUnselect', event);
        };


        const getVal = (rowData: any, field: any, header: any) => {
            if (field === 'createdDate' || field === 'updatedDate') {
                return moment(rowData).format('MM/DD/YYYY');
            } else {
                return rowData[field];
            }
        };

        const getErrorTypes = async () => {
            loading.value = true;
            const masterDb: Client<any> = couchService.masterDB;
            const errorTypes: any = await masterDb.view(
                'obs_web',
                'all_doc_types',
                {reduce: false, include_docs: true, key: 'error-type'} as any
            );
            data.push.apply(data, errorTypes.rows.map( (row: any) => row.doc ));
            data.sort( (a: any, b: any) => {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                } else {
                    return 0;
                }
            });
            loading.value = false;
        };

        onMounted( () => {
            getErrorTypes();
        });

        return {
            data, filters, columns, columnOptions, cellVal, selected, onCellEditInit, onRowSelect, onRowUnselect, getVal, loading, toggleFields
        };

    }

});

</script>

<style>
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