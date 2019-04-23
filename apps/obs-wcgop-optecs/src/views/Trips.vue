<template>
  <span>
    <q-page padding>
      <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
          <q-btn flat label="Dismiss" @click="clear"/>
        </template>
      </q-banner>
      <!-- <div v-if="currentTrip">{{currentTrip}}</div> -->
      <boatnet-trips
        :tripsSettings="wcgopTripsSettings"
        :tripsData="userDBTrips"
        :currentTrip="currentTrip"
        @selectedTrip="handleSelectTrip"
        @addTrip="handleAddTrip"
        @editTrip="handleEditTrip"
        @endTrip="handleEndTrip"
        @deleteTrip="handleDeleteTrip"
        @displayKeyboard="displayKeyboard"
      />
    </q-page>
  </span>
</template>


<script lang="ts">
import { Point } from 'geojson';
import { Client, CouchDoc } from 'davenport';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { WcgopAppState } from '../_store/types/types';
import { AlertState } from '../_store/types/types';
import BoatnetTrips, { BoatnetTripsSettings } from '@boatnet/bn-common';
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

Vue.component(BoatnetTrips);

@Component({
  pouch: {
    vessels() {
      // Example
      return {
        database: pouchService.lookupsDBName,
        selector: { type: 'vessel' },
        sort: [{ vesselName: 'asc' }]
      };
    },
    userTrips() {
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
  @State('appState') private appState!: WcgopAppState;
  @State('pouchState') private pouchState!: PouchDBState;
  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;
  @Action('setCurrentTrip', { namespace: 'appState' })
  private setCurrentTrip: any;
  @Getter('currentTrip', { namespace: 'appState' })
  private currentTrip!: WcgopTrip;
  @Action('addTest', { namespace: 'pouchState' })
  private addTest: any;

  private wcgopTripsSettings: BoatnetTripsSettings;
  private testingTrip: WcgopTrip;

  private myStuff: any = {};
  private myPouchDB: any;
  private vesselViewData: any;

  private userTrips!: any;
  constructor() {
    super();

    // this.myPouchDB = pouchService.getDB(this.selectedDBName);
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
    const examplePort: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      name: 'Oxnard'
    };
    const examplePort2: Port = {
      _id: 'asdf2',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      name: 'Port Townsend'
    };
    const exampleVessel: Vessel = {
      _id: '1',
      type: VesselTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      vesselName: 'Sadie K'
    };
    const exampleVessel2: Vessel = {
      _id: '2',
      type: VesselTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      vesselName: 'Pickle Pelican'
    };
    const exampleTrip = {
      tripNum: 1,
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      // program: 'Catch Shares',
      departurePort: examplePort,
      departureDate: moment().format(),
      returnPort: examplePort2,
      returnDate: moment()
        .add(1, 'days')
        .format(),
      vessel: exampleVessel,
      // ... other data
      legacy: {
        tripId: 123
      }
    };
    this.testingTrip = exampleTrip;
  }

  private handleSelectTrip(trip: WcgopTrip) {
    this.setCurrentTrip(trip);
  }

  private handleAddTrip() {
    console.log('TODO: Create trip logic'); // TODO Temporary Add Logic
    const trip: WcgopTrip = { ...this.testingTrip }; // Clone
    if (this.userDBTrips[0]) {
      trip.tripNum = this.userDBTrips[0].tripNum + 1;
    }
    pouchService.db.post(pouchService.userDBName, trip);
    // this.$router.push({ path: '/tripdetails/' + 1 });
  }

  private handleEditTrip(trip: WcgopTrip) {
    if (trip) {
      console.log('[TODO Vuex] Edit', trip.tripNum);
      this.$router.push({ path: '/tripdetails/' + trip.tripNum });
    }
  }

  private handleEndTrip(trip: WcgopTrip) {
    console.log('TODO End', trip.tripNum);
  }

  private handleDeleteTrip(trip: WcgopTrip) {
    console.log('TODO Prompt User to Delete');
    pouchService.db.remove(pouchService.userDBName, trip);
    this.setCurrentTrip(undefined);
  }

  public get userDBTrips() {
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
      return this.pouchState.credentials.dbInfo.readonlyDB;
    }
  }

  private get currentUserDB(): string {
    if (!this.pouchState.credentials) {
      console.warn('WARNING: current User db is undefined');
      return '';
    } else {
      return this.pouchState.credentials.dbInfo.readonlyDB;
    }
  }

  private get lookupsDB() {
    // @ts-ignore
    return this[this.selectedDBName];
  }

  private get vesselView() {
    // console.log('vessel view checked');
    return this.vesselViewData;
  }

  private displayKeyboard(e: any) {
    this.$emit('displayKeyboard', e);
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
