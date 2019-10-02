<template>
  <span>
    <q-page>
      <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
          <q-btn flat label="Dismiss" @click="clear"/>
        </template>
      </q-banner>
      <boatnet-summary
        currentScreen="Trip"
        :current="currentTrip"
        :selectionId="currentTrip ? currentTrip.tripNum : 0"
        @add="handleAddTrip"
        @edit="handleEditTrip"
        @end="handleEndTrip"
        @delete="handleDeleteTrip"
        @goTo="handleGoToHauls"
      >
        <template v-slot:table>
          <boatnet-table
            :data="userDBTrips"
            :settings="wcgopTripsSettings"
            @select="handleSelectTrip"
          >
            <template v-slot:default="rowVals">
              <q-td key="tripNum">{{rowVals.row.tripNum}}</q-td>
              <q-td key="vesselName">{{ rowVals.row.vessel.vesselName }}</q-td>
              <q-td key="departurePort">{{ rowVals.row.departurePort.name }}</q-td>
              <q-td key="departureDate">{{ formatDate(rowVals.row.departureDate) }}</q-td>
              <q-td key="returnPort">{{ rowVals.row.returnPort.name }}</q-td>
              <q-td key="returnDate">{{ formatDate(rowVals.row.returnDate) }}</q-td>
              <q-td key="errors">{{ rowVals.row.errors }}</q-td>
            </template>
          </boatnet-table>
        </template>
      </boatnet-summary>
    </q-page>
  </span>
</template>


<script lang="ts">
import { Point } from 'geojson';
import { Client, CouchDoc } from 'davenport';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { TripState } from '@boatnet/bn-common';
import { AlertState } from '@boatnet/bn-common';
import BoatnetSummary, { BoatnetTripsSettings } from '@boatnet/bn-common';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import {
  WcgopTrip,
  WcgopTripTypeName,
  Port,
  PortTypeName,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  Vessel,
  VesselTypeName
} from '@boatnet/bn-models';
import moment from 'moment';

Vue.component(BoatnetSummary);

@Component({
  pouch: {
    userTrips() {
      // Also declared in class
      return {
        database: pouchService.userDBName,
        selector: { type: 'wcgop-trip' },
        sort: [{ tripNum: 'desc' }]
        // limit: 5 // this.resultsPerPage,
      };
    }
  }
})
export default class Trips extends Vue {
  public message = '';
  @State('alert') private alert!: AlertState;
  @State('tripsState') private tripState!: TripState;
  @State('pouchState') private pouchState!: PouchDBState;
  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;
  @Action('setCurrentTrip', { namespace: 'tripsState' })
  private setCurrentTrip: any;
  @Getter('currentTrip', { namespace: 'tripsState' })
  private currentTrip!: WcgopTrip;
  @Action('addTest', { namespace: 'pouchState' })
  private addTest: any;

  private wcgopTripsSettings: BoatnetTripsSettings;

  private myStuff: any = {};
  private myPouchDB: any;
  private tempEmptyData: any[] = [];

  private userTrips!: any;
  constructor() {
    super();

    this.wcgopTripsSettings = {
      rowKey: '_id',
      columns: [
        {
          name: 'tripNum',
          required: true,
          label: 'Trip #',
          align: 'left',
          field: 'tripNum',
          sortable: true
        },
        {
          name: 'vesselName',
          align: 'center',
          label: 'Vessel Name',
          field: (row: any) => row.vessel.vesselName,
          sortable: true
        },
        {
          name: 'departurePort',
          align: 'center',
          label: 'Departure Port',
          field: (row: any) => row.departurePort.name,
          sortable: true
        },
        {
          name: 'departureDate',
          align: 'center',
          label: 'Departure Date',
          field: (row: any) => moment(row.departureDate).format('MM/DD/YY'),
          sortable: true
        },
        {
          name: 'returnPort',
          align: 'center',
          label: 'Return Port',
          field: (row: any) => row.departurePort.name,
          sortable: true
        },
        {
          name: 'returnDate',
          align: 'center',
          label: 'Return Date',
          field: (row: any) => moment(row.departureDate).format('MM/DD/YY'),
          sortable: true
        },
        {
          name: 'errors',
          align: 'center',
          label: 'Errors',
          field: (row: any) => 2, // TODO Error calc
          sortable: true
        }
      ]
    };
  }

  private formatDate(date: string) {
    return moment(date).format('MM/DD/YY');
  }

  private handleGoToHauls() {
    this.$router.push({ path: '/hauls/' });
  }

  private handleSelectTrip(trip: any) {
    if (trip) {
      delete trip.__index;
      this.setCurrentTrip(trip);
    } else {
      this.setCurrentTrip(null);
    }
  }

  private handleAddTrip() {
    let tripNum = 1;
    if (this.userDBTrips[0]) {
      tripNum = this.userDBTrips[0].tripNum + 1;
    }
    const trip: WcgopTrip = { tripNum };
    this.setCurrentTrip(trip);
    this.$router.push({ path: '/tripdetails/' + trip.tripNum });
  }

  private handleEditTrip() {
    this.$router.push({ path: '/tripdetails/' + this.currentTrip.tripNum });
  }

  private handleEndTrip() {
    console.log('TODO End', this.currentTrip.tripNum);
  }

  private handleDeleteTrip() {
    pouchService.db.remove(pouchService.userDBName, this.currentTrip);
    this.setCurrentTrip(undefined);
  }

  public get userDBTrips() {
    // TODO: This seems to block the UI - handle asyn
    // console.log('Called userDBTrips');
    if (this.userTrips) {
      return this.userTrips;
    } else {
      return [];
    }
  }
  private get currentReadonlyDB(): string {
    if (!this.pouchState.credentials) {
      console.warn('WARNING: current RO db is undefined');
      return '';
    } else {
      return this.pouchState.credentials.dbInfo.lookupsDB;
    }
  }

  private get currentUserDB(): string {
    if (!this.pouchState.credentials) {
      console.warn('WARNING: current User db is undefined');
      return '';
    } else {
      return this.pouchState.credentials.dbInfo.userDB;
    }
  }

  private get lookupsDB() {
    // @ts-ignore
    return this[this.selectedDBName];
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
