<template>

  <div v-bind:style="{ minWidth: columns.length * 100 + 'px' }">
      <DataTable
        v-if="!loading"
        :value="errorTypes"
        :filters="filters"
        :autoLayout="true"
        :tableStyle="{'table-layout':'auto'}"
        :paginator="true"
        :rows="30"
        sortMode="multiple"
        :selection="[]"
        selectionMode="single"
        editMode="cell"
        @row-select="onRowSelect"
        @row-unselect="onRowUnselect"
        @cell-edit-init="onCellEditInit"
        data-key="_id"
    >
        <template #header>
            <div style="text-align:left; float:left">
                <MultiSelect
                    v-model="displayColumns"
                    :options="columnOptions"
                    optionLabel="header"
                    placeholder="Select Columns"
                    style="width: 20em;"
                >
                    <template #value="slotProps">
                        <div>Display Columns</div>
                    </template>
                </MultiSelect>

                <q-btn size="sm" dense color="primary" icon="add" style="margin-left: 10px; padding-right: 5px" @click="addRow">New Error Type</q-btn>
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
            v-for="col of displayColumns"
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
            <template v-if="col.isEditable" #editor="slotProps">
                <div>
                    <InputText
                        type="text"
                        v-model="cellVal"
                        @change="onCellEdit($event.target.value, slotProps, col.type)"
                    ></InputText>
                </div>
            </template>
            <template #body="slotProps" v-else>
                <div v-if="toggleFields.includes(col.field)" style="text-align: center">
                    <q-checkbox v-model="slotProps.data[col.field]" dense
                     @input="save(slotProps.data)"></q-checkbox>
                </div>
                <div v-else-if="col.field === 'checkType'">
                    <q-select v-model="slotProps.data[col.field]" dense options-dense
                    @input="save(slotProps.data)"
                    :options="['Warning', 'Error']"></q-select>
                </div>
                <div v-else style="text-align: center">
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
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
    setup(props, context) {
        const masterDB: Client<any> = couchService.masterDB;
        const columns: any = [
            {field: 'name', header: 'Name', isEditable: true },
            {field: 'description', header: 'Description', isEditable: true },
            {field: 'checkType', header: 'Type' },
            {field: 'isActive', header: 'Active' },
            {field: 'isWcgop', header: 'WCGOP' },
            {field: 'isAshop', header: 'ASHOP' },
            {field: 'isEm', header: 'EM'},
            {field: 'onEntry', header: 'On Entry' },
            {field: 'tripCheck', header: 'Trip Check'},
            {field: 'createdBy', header: 'Created By'},
            {field: 'createdDate', header: 'Created Date'},
            {field: 'updatedBy', header: 'Updated By'},
            {field: 'updatedDate', header: 'Updated Date'},
        ];

        const displayColumns: any = [...columns.slice(0, 8)];

        const toggleFields: string[] = [
                        'isActive',
                        'isAshop',
                        'isWcgop',
                        'isEm',
                        'onEntry',
                        'tripCheck',
                        ];

        const errorTypes: any = ref([]);
        const loading: any = ref(false);

        const filters: any = reactive({
                        isActive: null,
                        isAshop: null,
                        isWcgop: null,
                        isEm: null,
                        onEntry: null,
                        tripCheck: null,
                        checkType: null
                        });
        const columnOptions = [...columns];
        const cellVal: any = ref('');
        const selected: any = [];

        function onCellEditInit(event: any) {
            cellVal.value = event.data[event.field] ? event.data[event.field].toString() : '';
        }

        function onCellEdit(newValue: any, slotProps: any, type: string) {
            const fields: string = slotProps.column.field;
            const editingCellRow: any = slotProps.data;

            set(editingCellRow, fields, newValue);
            save(editingCellRow);
        }

        const onRowSelect = (event: any) => {
            return;
        };

        const onRowUnselect = (event: any) => {
            context.emit('onRowUnselect', event);
        };

        const getVal = (rowData: any, field: any, header: any) => {
            if ((field === 'createdDate' || field === 'updatedDate') && rowData[field]) {
                return moment(rowData[field]).format('M/DD/YY h:mm');
            } else {
                return rowData[field];
            }
        };

        const addRow = () => {
            errorTypes.value.unshift(
                {
                    createdDate: moment().format(),
                    createdBy: authService.getCurrentUser()!.username,
                    isActive: true,
                    isWcgop: false,
                    isAshop: false,
                    isEm: false,
                    onEntry: false,
                    tripCheck: false,
                    type: 'error-type',
                    name: '',
                    description: ''
                }
            );
        };

        const getErrorTypes = async () => {
            loading.value = true;
            const masterDb: Client<any> = couchService.masterDB;
            const errorTypesQuery: any = await masterDb.view(
                'obs_web',
                'all_doc_types',
                {reduce: false, include_docs: true, key: 'error-type'} as any
            );
            errorTypes.value.push.apply(errorTypes.value, errorTypesQuery.rows.map( (row: any) => row.doc ));
            errorTypes.value.sort( (a: any, b: any) => {
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

        const save = async (rowData: any) => {
            const user = authService.getCurrentUser()!.username;
            rowData.updatedBy = user;
            rowData.updatedDate = moment().format();
            if (rowData._id) {
                const response: any = await masterDB.put(rowData._id, rowData, rowData._rev);
                const editedRow = errorTypes.value.find( (row: any) => row._id === response.id );
                editedRow._rev = response.rev;
            } else {
                const response = await masterDB.post(rowData);
                const editedRow = errorTypes.value.find ((row: any) => !row._id);
                editedRow._id = response.id;
                editedRow._rev = response.rev;
            }
        };

        onMounted( () => {
            getErrorTypes();
        });

        return {
            addRow, displayColumns, errorTypes, filters, columns, columnOptions, cellVal, selected, onCellEdit, onCellEditInit, onRowSelect, onRowUnselect, getVal, loading, toggleFields, save
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
</style>
