<template>
  <div class="q-pa-md q-gutter-md">
    <div class="centered-page-item">
      <q-btn v-if="openTrips.length < 2" color="primary" @click="newTrip">New Trip</q-btn>
      <q-btn v-else color="blue-grey-2" @click="alert = true">New Trip</q-btn>
    </div>
      <div v-if="openTrips.length > 0" class="centered-page-item">Active Trips</div>
  <div class=" row items-start" >
      <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-primary text-white" v-if="trip.is_open"> -->

      <q-card v-for="(trip, i) in openTrips" :key="trip.tripNum" class="my-card bg-primary text-white" style="margin: 10px">
        <q-card-section>
          <div class="text-h6">{{ trip.tripNum }} 
            <span v-if="trip.fishery">{{ trip.fishery.name }}</span>
          </div>
          <span v-if="trip.departureDate">{{ trip.departureDate.split(" ")[0] }}</span> - 
          <span v-if="trip.returnDate">{{ trip.returnDate.split(" ")[0] }}</span>
          <div style="float:right">
            <q-icon v-if="trip.messages.length > 0" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
            <q-icon v-if="trip.isSelected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat @click="getTripDetails(trip)">Edit</q-btn>
          <q-btn flat @click="closeTrip(trip)">Close</q-btn>
        </q-card-actions>
    </q-card>
    </div>
    <div v-if="closedTrips.length > 0" style="text-align: center" class="centered-page-item">Closed Trips</div>
    <div class=" row items-start"> 
    <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-blue-grey-3 text-white" v-if="!trip.is_open"> -->

    <q-card v-for="(trip, i) in closedTrips" :key="trip.tripNum" class="my-card bg-blue-grey-3 text-white" style="margin: 10px">

      <q-card-section>
        <div class="text-h6">{{ trip.tripNum }} 
          <span v-if="trip.fishery">{{ trip.fishery.name }}</span>
        </div>
          <span v-if="trip.departureDate">{{ trip.departureDate.split(" ")[0] }}</span> - 
          <span v-if="trip.returnDate">{{ trip.returnDate.split(" ")[0] }}</span>
        <div style="float:right">
          <q-icon v-if="trip.messages.length > 0" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
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
import { TripState, VesselState, UserState } from '../_store/types/types';

@Component
export default class Trips extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;

    private get openTrips() {
      return this.trip.trips.filter(
        (trip) => {
          return trip.tripStatus &&
          trip.vessel.vesselName === this.vessel.activeVessel.vesselName;
          }
        );
    }

    private get closedTrips() {
      return this.trip.trips.filter(
        (trip) => {
          return !trip.tripStatus &&
          trip.vessel.vesselName === this.vessel.activeVessel.vesselName;
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
        trip.tripStatus = false;
      }

    private reOpenTrip(trip: any) {
        if (this.openTrips.length < 2) {
          trip.tripStatus = true;
        } else {
          this.alert = true;
        }
      }

    private getTripDetails(trip: any) {
        // this.$store.dispatch('updateActiveTrip', trip);
        // this.$store.state.activeTrip = this.trips[i];
        this.trip.activeTrip = trip;
        this.$router.push({path: '/trips/' + trip.tripNum});
      }

    private newTrip() {
        const newTripNum = this.trip.trips.length + 1;
        this.trip.trips.push({
                              type: 'trip',
                              tripNum: newTripNum,
                              tripStatus: true,
                              vessel: { vesselName: this.vessel.activeVessel.vesselName },
                              permits: [],
                              messages: [],
                              departurePort: this.user.activeUser.homeport,
                              returnPort: {name: 'same as start'},
                              isSelected: false,
                              fishery: {name: 'unknown'},
                              _id: 'blah'
                              });
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
        this.trip.activeTrip = this.trip.trips[this.trip.trips.length - 1];
        // this.$store.dispatch('updateActiveTrip', this.$store.state.trips[this.$store.state.trips.length - 1]);
        this.trip.newTrip = true;
        // this.$store.state.newTrip = true;
        this.$router.push({path: '/trips/' + newTripNum});
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


