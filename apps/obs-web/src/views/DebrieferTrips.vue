<template>
  <div>
    <div class="text-h6">Trips</div>
    <prime-table
      :value="WcgopTrips"
      :columns="columns"
      :selected="selected"
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
  private value: string = 'hello';

  private columns = [
    { field: 'key', header: 'Id' },
    { field: 'tripStatus.description', header: 'Status' },
    { field: 'vessel.vesselName', header: 'Vessel' },
    { field: 'program.name', header: 'Program' },
    { field: 'departurePort.name', header: 'Departure Port' },
    { field: 'departureDate', header: 'Departure Date' },
    { field: 'returnPort.name', header: 'Return Port' },
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

  private async getTrips() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
      const options: ListOptions = {
        limit: 20
      };

      const trips = await masterDB.viewWithDocs<any>(
        'MainDocs',
        'all-trips',
        options
      );

      for (const row of trips.rows) {
        const trip = row.doc;
        trip.key = row.key;
        this.WcgopTrips.push(trip);
        if (this.debriefer.tripIds.indexOf(trip._id) !== -1) {
          this.selected.push(trip);
        }
      }
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.getTrips();
  }

  private formatDate(inputDate: any) {
    return date.formatDate(inputDate, 'MM/DD/YYYY');
  }
}
</script>