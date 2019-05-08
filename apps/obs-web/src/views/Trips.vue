<template>
  <div class="q-pa-md q-gutter-md">

    <div class="centered-page-item">
      <q-btn class="bg-primary text-white q-ma-md"  v-if="openTrips.length < 2" color="primary" @click="newTrip">New Trip</q-btn>
      <q-btn v-else color="blue-grey-2" class="q-ma-md" @click="alert = true">New Trip</q-btn>
    </div>

      <div v-if="openTrips.length > 0" class="centered-page-item">Active Trips</div>
  <div class=" row items-start" >
      <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-primary text-white" v-if="trip.is_open"> -->

      <q-card v-for="(trip, i) in openTrips" :key="trip.tripNum" class="my-card bg-primary text-white" style="margin: 10px">
        <q-card-section>
          <div class="text-h6">{{ trip.tripNum }}
            <span v-if="trip.fishery">{{ trip.fishery.name }}</span>
          </div>
          <span v-if="trip.departureDate">{{ formatDate(trip.departureDate.split(" ")[0]) }}</span> -
          <span v-if="trip.returnDate">{{ formatDate(trip.returnDate.split(" ")[0]) }}</span>
          <div style="float:right">
            <q-icon v-if="trip.isSelected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat @click="getTripDetails(trip)">Edit</q-btn>
          <q-btn flat @click="closeTrip(trip)">Close</q-btn>
        </q-card-actions>
    </q-card>
    </div>
    <div v-if="closedTrips.length > 0" class="centered-page-item">Closed Trips</div>
    <div class=" row items-start">
    <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-blue-grey-3 text-white" v-if="!trip.is_open"> -->

    <q-card v-for="(trip, i) in closedTrips" :key="trip.tripNum" class="my-card bg-blue-grey-3 text-white" style="margin: 10px">

      <q-card-section>
        <div class="text-h6">{{ trip.tripNum }}
          <span v-if="trip.fishery">{{ trip.fishery.name }}</span>
        </div>
          <span v-if="trip.departureDate">{{ formatDate(trip.departureDate.split(" ")[0]) }}</span> -
          <span v-if="trip.returnDate">{{ formatDate(trip.returnDate.split(" ")[0]) }}</span>
        <div style="float:right">
          <q-icon v-if="trip.isSelected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
        </div>
      </q-card-section>
      <q-card-actions style="float:right">
        <q-btn flat @click="reOpenTrip(trip)">Reopen</q-btn>
      </q-card-actions>

    </q-card>

    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Only 2 active trips are permitted.  Please close a trip.</div>
          <q-btn color="primary" size="md" style="float: right" @click="alert = false">OK</q-btn>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
  </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TripState, VesselState, UserState, WcgopAppState } from '../_store/types/types';

import moment from 'moment';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';

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

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

@Component({
  pouch: {
    userTrips() { // Also declared in class
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
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('appState') private appState!: WcgopAppState;
    @State('pouchState') private pouchState!: PouchDBState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

  private userTrips!: any;

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

    private get openTrips() {
      return this.userDBTrips.filter(
        (trip: any) => {
          if (trip.vessel) {
            return trip.tripStatus.description === 'open' &&
            trip.vessel.vesselName === this.vessel.activeVessel.vesselName;
          } else {
            return [];
          }
          }
        );
    }

    private get closedTrips() {
      return this.userDBTrips.filter(
        (trip: any) => {
          if (trip.vessel) {
            return trip.tripStatus.description !== 'open' &&
            trip.vessel.vesselName === this.vessel.activeVessel.vesselName;
          } else {
            return [];
          }
        }
      );
    }

    private alert = false;

    constructor() {
        super();
    }

    // private get trips() {
    //     return this.$store.getters.trips;
    // }

    // private set trips(value) {
    //     this.$store.dispatch('updateTrips', value);
    // }

    // private get openTrips() {
    //   return this.$store.getters.openTrips;
    // }

    // private set openTrips(value) {
    //   this.$store.dispatch('updateTrips', value);
    // }

    // private get closedTrips() {
    //   return this.$store.getters.closedTrips;
    // }

    // private set closedTrips(value) {
    //   this.$store.dispatch('updateTrips', value);
    // }

    private created() {
      // this.$store.dispatch('updateActiveTrip', '');
    }

    private closeTrip(trip: any) {
      trip.tripStatus.description = 'closed';
      pouchService.db.put(pouchService.userDBName, trip);
      }

    private reOpenTrip(trip: any) {
        if (this.openTrips.length < 2) {
          trip.tripStatus.description = 'open';
          pouchService.db.put(pouchService.userDBName, trip);
        } else {
          this.alert = true;
        }
      }

    private getTripDetails(trip: any) {
        // this.$store.dispatch('updateActiveTrip', trip);
        // this.$store.state.activeTrip = this.trips[i];
        this.trip.activeTrip = trip;
        this.trip.newTrip = false;
        this.$router.push({path: '/trips/' + trip.tripNum});
      }

    private newTrip() {
        const newTripNum = this.userDBTrips[0].tripNum + 1;
        const newTrip: WcgopTrip = {
                              type: 'wcgop-trip',
                              tripNum: newTripNum,
                              vessel: this.vessel.activeVessel,
                              // permits: [],
                              // messages: [],
                              departureDate: moment().format(),
                              departurePort: this.user.activeUser.homeport,
                              returnDate: moment().format(),
                              returnPort: {name: 'same as start'},
                              isSelected: false,
                              fishery: {name: 'unknown'},
                              tripStatus: {
                                description: 'open'
                              }
                              };
        // this.$store.state.trips.push({
        //                               type: 'trip',
        //                               tripNum: newTripNum,
        //                               tripStatus: true,
        //                               vessel: {vesselName: this.$store.state.activeVessel},
        //                               permits: [],
        //                               messages: [],
        //                               departurePort: this.$store.state.activeUser.homeport,
        //                               returnPort: 'same as start',
        //                               isSelected: false,
        //                               fishery: {name: 'unknown'},
        //                               _id: 'blah'
        //                               });
        this.trip.activeTrip = newTrip;
        // this.$store.dispatch('updateActiveTrip', this.$store.state.trips[this.$store.state.trips.length - 1]);
        this.trip.newTrip = true;
        // this.$store.state.newTrip = true;
        this.$router.push({path: '/trips/' + newTripNum});
      }

  private formatDate(date: any) {
    return moment(date).format('MMM Do');
  }

}
</script>

<!--
<script>

import Vue from 'vue';
import TripDetails from './TripDetails.vue';

export default{
    data() {
      return {
        alert: false
      }
    },
    computed: {
        trips: {
          get() {
              return this.$store.getters.trips
          },
          set(value) {
              this.$store.dispatch('updateTrips', value)
          }
        },
        openTrips: {
          get() {
            return this.$store.getters.openTrips
          },
          set(value) {
            this.$store.dispatch('updateTrips', value)
          }
        },
        closedTrips: {
          get() {
            return this.$store.getters.closedTrips
          },
          set(value) {
              this.$store.dispatch('updateTrips', value)
          }
        }
    },
    created() {
      this.$store.dispatch('updateActiveTrip', '')
      console.log(this.$store.getters.trips)
    },
    methods: {
      closeTrip(trip) {
        trip.is_open = false;
      },
      reOpenTrip(trip) {
        if (this.openTrips.length < 2) {
          trip.is_open = true;
        } else {
          this.alert = true;
        }
      },
      getTripDetails(trip) {
        this.$store.dispatch('updateActiveTrip', trip)
        // this.$store.state.activeTrip = this.trips[i]
        this.$router.push({path: '/trips/'+ trip.trip_num})
      },
      newTrip() {
        const newTripNum = this.$store.state.trips.length + 1
        this.$store.state.trips.push({type: 'trip', trip_num: newTripNum, vessel: this.$store.state.activeVessel, permits: [], messages: [], start_port: this.$store.state.activeUser.homeport, end_port: 'same as start'})
        this.$store.dispatch('updateActiveTrip', this.$store.state.trips[this.$store.state.trips.length -1])
        console.log(this.$store.state.activeTrip)
        this.$router.push({path: '/trips/' + newTripNum})
      }
    }
};
</script>
-->

<style lang="stylus" scoped>
  .my-card
    width 100%
    max-width 450px
</style>


