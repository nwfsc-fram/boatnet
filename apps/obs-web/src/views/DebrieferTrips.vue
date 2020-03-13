<template>
  <div>
    <prime-table
      :value="WcgopTrips"
      :columns="columns"
      :selected="selected"
      :isEditable="true"
      title="Data"
      @onRowSelect="onRowSelect"
      @onRowUnselect="onRowUnSelect"
    />
  </div>
</template>


<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { DebrieferState } from '../_store/types/types';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopCatch,
  WcgopSpecimen,
  Basket
} from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date, colors } from 'quasar';
import { convertToObject } from 'typescript';

import PrimeTable from './PrimeTable.vue';
Vue.component('PrimeTable', PrimeTable);

@Component
export default class DebrieferTrips extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  @Action('addTripId', { namespace: 'debriefer' })
  private addTripId: any;
  @Action('removeTripId', { namespace: 'debriefer' })
  private removeTripId: any;

  private editingCellRows: any = {};
  private editingRows = [];
  private originalRows: any = null;
  private columns = [
    { field: 'tripNum', header: 'Id' },
    {
      field: 'tripStatus.description',
      header: 'Status',
      type: 'toggle',
      list: ['Open', 'Closed']
    },
    { field: 'vessel.vesselName', header: 'Vessel' },
    {
      field: 'program.name',
      header: 'Program',
      type: 'toggle',
      list: ['Catch Shares', 'Open Access']
    },
    {
      field: 'departurePort.name',
      header: 'Departure Port',
      type: 'toggle',
      lookupKey: 'port',
      lookupField: 'name'
    },
    { field: 'departureDate', header: 'Departure Date' },
    {
      field: 'returnPort.name',
      header: 'Return Port',
      type: 'toggle',
      lookupKey: 'port',
      lookupField: 'name'
    },
    { field: 'returnDate', header: 'Return Date' }
  ];

  private WcgopTrips: any[] = [];
  private selected: any = [];

  private onRowSelect(event: any) {
    this.addTripId(event.data._id);
  }

  private onRowUnSelect(event: any) {
    this.removeTripId(event.data._id);
  }

  @Watch('debriefer.evaluationPeriod.tripIds')
  private async onPropertyChanged(value: any, oldValue: any) {
    await this.getTrips();
  }

  private async getTrips() {
    const masterDB: Client<any> = couchService.masterDB;
    this.WcgopTrips = [];
    try {
      const options: ListOptions = {
        keys: this.debriefer.evaluationPeriod.tripIds
      };

      const trips = await masterDB.listWithDocs(options);

      for (const row of trips.rows) {
        this.WcgopTrips.push(row);
      }
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    if (
      this.debriefer.evaluationPeriod &&
      this.debriefer.evaluationPeriod.tripIds &&
      this.debriefer.evaluationPeriod.tripIds.length > 0
    ) {
      this.getTrips();
    }
  }

  private formatDate(inputDate: any) {
    return date.formatDate(inputDate, 'MM/DD/YYYY');
  }
}
</script>