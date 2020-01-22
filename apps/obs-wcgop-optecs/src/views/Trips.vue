<template>
  <span>
    <q-page>
      <q-banner
        v-show="!!alert.message"
        rounded
        inline-actions
        class="bg-red text-white"
      >
        {{ alert.message }}
        <template v-slot:action>
          <q-btn
            flat
            label="Dismiss"
            @click="clear"
          />
        </template>
      </q-banner>
      <boatnet-summary
        current-screen="Trip"
        :current="currentTrip"
        :selection-id="currentTrip ? currentTrip.tripNum : 0"
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
              <q-td key="tripNum">{{ rowVals.row.tripNum }}</q-td>
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
  Vessel,
  VesselTypeName
} from '@boatnet/bn-models';
import moment from 'moment';

Vue.component(BoatnetSummary);

@Component({
  pouch: {
    /**
     * In pouch-vue library, this will create a reactive binding to the user trips,
     * e.g. all docs of type wcgop-trip (using the selector below)
     */
    userTrips() {
      // Note: userTrips must also be declared in Vue class (below)
      return {
        database: pouchService.userDBName,  // Database name, set in bn-pouch
        selector: { type: 'wcgop-trip' }, // Couch/Pouch selector syntax, select docs with type wcgop-trip
        sort: [{ tripNum: 'desc' }]  // Sort descending by "friendly" tripNum
        // limit: 5 // this.resultsPerPage,  // optionally limit results for pagination
      };
    }
  }
})

/**
 * Trips Vue
 * Display a selectable list of WCGOP Trips,
 * the trips are loaded from PouchDB and are fully reactive
 */

export default class Trips extends Vue {
  public message = ''; // Message used for Alert service from bn-common
  // Vuex States:
  @State('alert') private alert!: AlertState;
  @State('tripsState') private tripState!: TripState;
  @State('pouchState') private pouchState!: PouchDBState;

  // Alert (show an alert in the UI) state actions:
  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  // Trip Vuex State functionality:
  @Action('setCurrentTrip', { namespace: 'tripsState' })
  private setCurrentTrip: any; // from Trips vuex state
  @Getter('currentTrip', { namespace: 'tripsState' })
  private currentTrip!: WcgopTrip; // from Trips vuex state
  @Action('addTest', { namespace: 'pouchState' })
  private addTest: any;  // just a test function

  private wcgopTripsSettings: BoatnetTripsSettings;  // Settings for boatnet-table

  private userTrips!: any;  // Reactive binding to pouch-vue, declared in @Component
  constructor() {
    super();

    // Declare boatnet-table settings for display of trips:
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
          field: (row: any) => 2, // TODO Calculate # of Trip Errors
          sortable: true
        }
      ]
    };
  }

  /**
   * Simple date formatter using the moment lib
   */
  private formatDate(date: string) {
    return moment(date).format('MM/DD/YY');
  }

  /**
   * Navigate to a selected Haul (boatnet-summary)
   */
  private handleGoToHauls() {
    this.$router.push({ path: '/hauls/' });
  }

  /**
   * boatnet-table handler for when a trip is selected
   */
  private handleSelectTrip(trip: any) {
    if (trip) {
      delete trip.__index;
      this.setCurrentTrip(trip);
    } else {
      this.setCurrentTrip(null);
    }
  }

  /**
   * boatnet-summary override: handle add trip + navigation to Trip Details
   */
  private handleAddTrip() {
    let tripNum = 1; // friendly trip #
    if (this.userDBTrips[0]) { // If trip exists, start counting up from that tripNum, otherwise just use 1
      tripNum = this.userDBTrips[0].tripNum + 1;
    }
    const trip: WcgopTrip = { tripNum }; // Create empty trip doc
    this.setCurrentTrip(trip);
    this.$router.push({ path: '/tripdetails/' + trip.tripNum });
  }

  /**
   * boatnet-summary override: handle edit trip + navigation to Trip Details
   */
  private handleEditTrip() {
    this.$router.push({ path: '/tripdetails/' + this.currentTrip.tripNum });
  }

  /**
   * boatnet-summary override:
   * TODO handle end trip
   */
  private handleEndTrip() {
    console.log('TODO End', this.currentTrip.tripNum);
  }

  /**
   * boatnet-summary override: handle trip deletion (removes from PouchDB and reactively updates the boatnet-table)
   * Clears currently selected trip
   */
  private handleDeleteTrip() {
    pouchService.db.remove(this.currentTrip, {}, pouchService.userDBName);
    this.setCurrentTrip(undefined);
  }

  /**
   * boatnet-table: data for table (wrap pouchdb if available)
   */
  public get userDBTrips() {
    if (this.userTrips) {
      return this.userTrips;
    } else {
      return [];
    }
  }

  /**
   * Get name of read-only (Lookups) database from PouchDB - usually lookups-dev
   */
  private get currentReadonlyDB(): string {
    if (!this.pouchState.credentials) {
      console.warn('WARNING: current RO db is undefined');
      return '';
    } else {
      return this.pouchState.credentials.dbInfo.lookupsDB;
    }
  }

  /**
   * Get name of user database from PouchDB - usually userdb-xyz with base64 encoded username
   */
  private get currentUserDB(): string {
    if (!this.pouchState.credentials) {
      console.warn('WARNING: current User db is undefined');
      return '';
    } else {
      return this.pouchState.credentials.dbInfo.userDB;
    }
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
