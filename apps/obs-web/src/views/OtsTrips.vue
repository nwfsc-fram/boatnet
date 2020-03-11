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
      >
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { get, set } from 'lodash';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';

import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import _ from 'lodash';
import moment from 'moment';

Vue.component('DataTable', DataTable);
Vue.component('Column', Column);
Vue.component('InputText', InputText);
Vue.component('MultiSelect', MultiSelect);

@Component
export default class OtsTrips extends Vue {
    private columns: any[] = [];
    private data: any[] = [];

  private filters: any = {};
  private columnOptions = [...this.columns];
  private cellVal: string = '';
  private selected: any = [];

  private onCellEditInit(event: any) {
    this.cellVal = get(event.data, event.field);
  }

  private onRowSelect(event: any) {
    this.$emit('onRowSelect', event);
    console.log(this.selected);
    this.$router.push({path: '/ots-trip-history/' + this.selected._id});
  }

  private onRowUnselect(event: any) {
    this.$emit('onRowUnselect', event);
  }

  private getVal(data: any, field: any, header: any) {
    if (field.indexOf('.') > -1) {
        if (field.indexOf('fishery') > -1) {
          return 'EM EFP';
        } else {
          return _.get(data, field);
        }
    } else if (header.indexOf('Time') > -1) {
        return moment(data[field]).format('HH:mm A');
    } else if (field.indexOf('Date') > -1) {
      return moment(data[field]).format('MMM D, YYYY');
    } else {
      return data[field];
    }
  }

  private async getTrips() {

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
          this.data.push(trip);
        }
    }

    this.columns = [
        {field: 'createdDate', header: 'Created Date'},
        {field: 'createdBy', header: 'Created By'},
        {field: 'vessel.vesselName', header: 'Vessel Name'},
        {field: 'vessel.vesselId', header: 'Vessel ID'},
        {field: 'tripStatus.description', header: 'Status'},
        {field: 'fishery.description', header: 'Fishery'},
        {field: 'departureDate', header: 'Start Date'},
        {field: 'departureDate', header: 'Start Time'},
        {field: 'departurePort.name', header: 'Start Port'},
        {field: 'returnDate', header: 'End Date'},
        {field: 'returnPort.name', header: 'End Port'}
        // {field: 'notes', header: 'Notes'},
    ];

    this.columnOptions = [...this.columns];

  }

  private created() {
      this.getTrips();
  }
}

</script>

<style scoped>
  .p-inputtext {
    background-color: inherit !important;
  }
</style>