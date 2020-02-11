<template>
    <div>
        <DataTable
            :value="data"
            :filters="filters"
            :resizableColumns="true"
            columnResizeMode="expand"
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
                    <InputText v-model="filters['global']" placeholder="Global Search" size="50" />
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
    </div>
</template>

<script lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';

import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import _ from 'lodash';
import { get, set } from 'lodash';
import moment from 'moment';

Vue.component('DataTable', DataTable);
Vue.component('Column', Column);
Vue.component('InputText', InputText);
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

import { getTripsApiTrip, getCatchApiCatch } from '../helpers/trips-api';

export default createComponent({
  setup(props, context) {
        const columns: any = [
            {field: 'tripNum', header: 'Trip #'},
            {field: 'vessel.vesselName', header: 'Vessel Name'},
            {field: 'vessel.vesselId', header: 'Vessel ID'},
            {field: 'tripStatus.description', header: 'Status'},
            {field: 'fishery.description', header: 'Fishery'},
            {field: 'departureDate', header: 'Start Date'},
            {field: 'departureTime', header: 'Start Time'},
            {field: 'departurePort.name', header: 'Start Port'},
            {field: 'returnDate', header: 'End Date'},
            {field: 'returnPort.name', header: 'End Port'},
            {field: 'isSelected', header: 'Selected'},
            {field: 'observer', header: 'Observer'}
        ];

        const data: any[] = [];

        const filters: any = reactive({});
        let columnOptions = [...columns];
        let cellVal: string = '';
        const selected: any = [];

        const onCellEditInit = (event: any) => {
            cellVal = get(event.data, event.field);
        };

        const onRowSelect = (event: any) => {
            context.emit('onRowSelect', event);
        };

        const onRowUnselect = (event: any) => {
            context.emit('onRowUnselect', event);
        };

        const getVal = (rowData: any, field: any, header: any) => {
            if (field.indexOf('.') > -1) {
                if (field.indexOf('fishery') > -1) {
                    const fishery = _.get(rowData, field);
                    if (fishery === 'Electronic Monitoring EFP') {
                        return 'EM EFP';
                    } else {
                        return fishery;
                    }
                } else {
                    return _.get(rowData, field);
                }
            } else if (header.indexOf('Time') > -1) {
                const departureDate: any = 'departureDate';
                return moment(rowData[departureDate]).format('HH:mm');  // hard coded attribute to aviod duplicate keys in columns.
            } else if (field.indexOf('Date') > -1) {
            return moment(rowData[field]).format('MMM D, YYYY');
            } else {
                if (rowData[field] === true) {
                    return 'Yes';
                } else if (rowData[field] === false) {
                    return 'No';
                } else {
                    return rowData[field];
                }
            }
        };

        const getTrips = async () => {

            const masterDB: Client<any> = couchService.masterDB;

            const otsTrips = await masterDB.viewWithDocs<any>(
                'obs_web',
                'ots_trips_by_vesselId'
            );

            for (const row of otsTrips.rows) {
                const trip = row.doc;
                if (typeof trip.createdBy === 'string') {
                    trip.vessel.vesselId = trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber;
                    if (trip.permits) {
                        trip.tripPermits = trip.permits.map( (permit: any) => permit.permitNumber );
                    }
                    data.push(trip);
                }
            }

            columnOptions = [...columns];
        };

        onMounted(() => {
            getTrips();
        });

        return {
            cellVal,
            columnOptions,
            columns,
            data,
            filters,
            getTrips,
            getVal,
            onCellEditInit,
            onRowSelect,
            onRowUnselect,
            selected
        };
  }
});
</script>

<style scoped>
  .p-inputtext {
    background-color: inherit !important;
  }
</style>
