<template>
  <span>
    <q-page padding>
      <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
        {{alert.message}}
        <template v-slot:action>
          <q-btn flat label="Dismiss" @click="clear"/>
        </template>
      </q-banner>

      <div>
        <!-- <input v-model="message" placeholder="New Test String"> -->
        <!-- <button @click="$pouch.post(selectedDBName, {type: 'test', message: message});message=''">Save</button> -->
        <div v-for="v in vessels" :key="v._id">
          <!-- <input v-model="todo.vessel_name" @change="$pouch.put(selectedDBName, todo)">
          <button @click="$pouch.remove(selectedDBName, todo)">Remove</button>-->
          <input v-model="v.vesselName">
        </div>
      </div>
      <boatnet-trips
        v-bind:tripsSettings="wcgopTripsSettings"
        v-bind:tripsData="wcgopTripsData"
        @selectedTrip="handleSelectTrip"
        @addAFakeTrip="handleAddTrip"
      />
    </q-page>
  </span>
</template>


<script lang="ts">
import { Point } from 'geojson';
import { Client, CouchDoc } from 'davenport';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
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

//   vesselsInLookups() {
//       return {
//         database: this.selectedDatabase, // you can pass a database string or a pouchdb instance
//         // selector: {type: "person"},
//         // sort: [{name: "asc"}],
//         // limit: this.resultsPerPage,
//         // skip: this.resultsPerPage * (this.currentPage - 1)
//       }
//     }

// {
//   pouch: {
//     selectedDB: {}
//   }
// })
@Component({
  pouch: {
    vessels() {
      return {
        database: 'lookups-dev',
        selector: { type: 'vessel' },
        limit: 5
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
  @Action('addTest', { namespace: 'pouchState' }) private addTest: any;

  private selectedDBName = 'lookups-dev';
  private wcgopTripsSettings: BoatnetTripsSettings;
  private wcgopTripsData: any[];

  private myStuff: any = {};
  private myPouchDB: any;
  constructor() {
    super();

    this.myPouchDB = pouchService.getDB(this.selectedDBName);
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
      _id: '1',
      tripNum: 1,
      type: 'test', // WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      program: 'Catch Shares',
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

    const exampleTrip2 = {
      _id: '2',
      tripNum: 2,
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      program: 'Catch Shares',
      departurePort: examplePort2,
      departureDate: moment()
        .subtract(1, 'days')
        .format(),
      returnPort: examplePort,
      returnDate: moment().format(),
      vessel: exampleVessel2
      // ... other data
    };

    this.wcgopTripsData = [exampleTrip, exampleTrip2];
  }

  private handleSelectTrip(trip: WcgopTrip) {
    this.setCurrentTrip(trip);
    console.log('TODO: handleSelectTrip', trip); // TODO
    if (trip) {
      this.$router.push({ path: '/tripdetails/' + 1 });
    }
  }

  private handleAddTrip(tmp: any) {
    console.log('TODO: Create trip', tmp); // TODO
    this.$router.push({ path: '/tripdetails/' + 1 });
    // this.selectedDatabase = this.currentReadonlyDB;
    // console.log('ADD', this.selectedDatabase);
    // this.addTest(tmp);
    // this.setCurrentTrip(trip);
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
  // private async myFatPouch() {
  //   const haha = await this.$pouch.allDocs(this.selectedDBName);
  //   console.log(haha.rows);
  //   return haha.rows;
  // }
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
