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
            {field: 'name', header: 'Name'},
            {field: 'scientificName', header: 'Scientific Name'},
            {field: 'type', header: 'Doc. Type'},
            {field: 'wcgopSpeciesCode', header: 'WCGOP Code'},
            {field: 'pacfinSpeciesCode', header: 'Pacfin Code'},
            {field: 'speciesCategory', header: 'Category'},
            {field: 'speciesSubCategory', header: 'Sub Category'},
            {field: 'hasWcgopCode', header: 'Has WCGOP Code'},
            {field: 'hasPacfinCode', header: 'Has Pacfin Code'},
            {field: 'hasSpeciesCategory', header: 'Has Category'},
            {field: 'hasSpeciesSubCategory', header: 'Has Sub Category'},
            {field: 'isEm', header: 'EM ?'},
            {field: 'isActive', header: 'Active ?'},
            {field: 'isProtected', header: 'Protected ?'},
            {field: 'isWcgopEmPriority', header: 'EM Priority ?'},
            {field: 'isEmExpandable', header: 'EM Expandable'},
            {field: 'isTargetStrategy', header: 'Target Strategy?'}
        ];

        const toggleFields: string[] = [
                        'hasWcgopCode',
                        'hasPacfinCode',
                        'hasSpeciesCategory',
                        'hasSpeciesSubCategory',
                        'isEm',
                        'isActive',
                        'isProtected',
                        'isWcgopEmPriority',
                        'isEmExpandable',
                        'isTargetStrategy'
                        ];

        const activeTasks: any = reactive([]);

        const data: any[] = [];
        const loading: any = ref(false);

        const filters: any = reactive({
                        hasWcgopCode: null,
                        hasPacfinCode: null,
                        hasSpeciesCategory: null,
                        hasSpeciesSubCategory: null,
                        isEm: null,
                        isActive: null,
                        isProtected: null,
                        isWcgopEmPriority: null,
                        isEmExpandable: null,
                        isTargetStrategy: null
                        });
        const columnOptions = [...columns];
        let cellVal: string = '';
        const selected: any = [];

        const onCellEditInit = (event: any) => {
            cellVal = get(event.data, event.field);
        };

        const onRowSelect = (event: any) => {
            context.root.$router.push({path: '/species-detail/' + event.data._id});
            context.emit('onRowSelect', event);
        };

        const onRowUnselect = (event: any) => {
            context.emit('onRowUnselect', event);
        };


        const getVal = (rowData: any, field: any, header: any) => {
            if (field === 'commonNames') {
                return rowData[field];
            } else {
                return rowData[field];
            }
        };

        const getSpecies = async () => {
            loading.value = true;
            const masterDb: Client<any> = couchService.masterDB;
            const species: any = await masterDb.view(
                'obs_web',
                'species_viewer',
                {reduce: false, include_docs: false} as any
            );

            for (const row of species.rows) {
                data.push({
                    _id: row.id,
                    type: row.key,
                    name: row.value[10] ? row.value[10] : row.value[9] ? row.value[9] : '',
                    scientificName: row.value[11],
                    speciesCategory: row.value[6],
                    speciesSubCategory: row.value[7],
                    wcgopSpeciesCode: row.value[0],
                    pacfinSpeciesCode: row.value[1],
                    hasWcgopCode: row.value[0] ? true : false,
                    hasPacfinCode: row.value[1] ? true : false,
                    hasSpeciesCategory: row.value[6] ? true : false,
                    hasSpeciesSubCategory: row.value[7] ? true : false,
                    isProtected: row.value[2] ? true : false,
                    isWcgopEmPriority: row.value[3] ? true : false,
                    isEm: row.value[4] ? true : false,
                    isActive: row.value[5] ? true : false,
                    isEmExpandable: row.value[8] ? true : false,
                    isTargetStrategy: row.value[12] ? true : false
                });
            }
            data.sort( (a: any, b: any) => {
                if (a.name.length > 0 && b.name.length > 0) {
                    if (a.name > b.name) {
                        return 1;
                    } else if (a.name < b.name) {
                        return -1;
                    } else {
                         return 0;
                    }
                } else {
                    if (a.scientificName > b.scientificName) {
                        return 1;
                    } else if (a.scientificName < b.scientificName) {
                        return -1;
                    } else {
                         return 0;
                    }
                }
                });
            loading.value = false;
        };



        onMounted( () => {
            getSpecies();
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