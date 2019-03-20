<template>
  <div>
  <div class="q-pa-md row items-start q-gutter-md">

    <span style="text-align: center">
      <q-btn v-if="openTrips.length < 2" color="primary" @click="newTrip">New Trip</q-btn>
      <q-btn v-else color="blue-grey-2" @click="alert = true">New Trip</q-btn>
    </span>
      <div v-if="openTrips.length > 0"  class="text-h6"><strong>Active Trips</strong></div>

      <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-primary text-white" v-if="trip.is_open"> -->

      <q-card v-for="(trip, i) in openTrips" :key="trip.trip_num" class="my-card bg-primary text-white">
        <q-card-section>
          <div class="text-h6">{{ trip.trip_num }} 
            <span v-if="trip.permits.length > 0">{{ trip.permits[0].fishery }}</span>
            <span v-if="trip.permits.length > 1">&nbsp;+</span></div>
          {{ trip.start_date.split(" ")[0] }} - {{ trip.end_date.split(" ")[0] }}
          <div style="float:right">
            <q-icon v-if="trip.messages" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
            <q-icon v-if="trip.selected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat @click="getTripDetails(trip)">Edit</q-btn>
          <q-btn flat @click="closeTrip(trip)">Close</q-btn>
        </q-card-actions>
    </q-card>
    
    <div v-if="closedTrips.length > 0"  class="text-h6"><strong>Closed Trips</strong></div>

    <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-blue-grey-3 text-white" v-if="!trip.is_open"> -->

    <q-card v-for="(trip, i) in closedTrips" :key="trip.trip_num" class="my-card bg-blue-grey-3 text-white">

      <q-card-section>
        <div class="text-h6">{{ trip.trip_num }} 
          <span v-if="trip.permits.length > 0">{{ trip.permits[0].fishery }}</span>
          <span v-if="trip.permits.length > 1">&nbsp;+</span></div>
        {{ trip.start_date.split(" ")[0] }} - {{ trip.end_date.split(" ")[0] }}
        <div style="float:right">
          <q-icon v-if="trip.messages.length > 0" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
          <q-icon v-if="trip.selected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
        </div>
      </q-card-section>
      <q-card-actions style="float:right">
        <q-btn flat @click="reOpenTrip(trip)">Reopen</q-btn>
      </q-card-actions>        

    </q-card>

    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div>Only 2 active trips are permitted.  <br>Please close a trip.</div>
          <q-btn flat color="primary" style="float: right" @click="alert = false">OK</q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
 
  </div>
  </div>
</template>

<!--
<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

export default class Trips extends Vue{

    private alert = false

    private get trips() {
        return this.$store.getters.trips
    }

    private set trips(value) {
        this.$store.dispatch('updateTrips', value)
    } 

    private get openTrips() {
      return this.$store.getters.openTrips
    }

    private set openTrips(value) {
      this.$store.dispatch('updateTrips', value)
    }

    private get closedTrips() {
      return this.$store.getters.closedTrips
    }

    private set closedTrips(value) {
      this.$store.dispatch('updateTrips', value)
    }

    private created() {
      this.$store.dispatch('updateActiveTrip', '')
      console.log(this.$store.getters.trips)
    }

    private closeTrip(trip_num:number) {
        this.$store.state.trips[trip_num].is_open = false;
      }

    private reOpenTrip(trip_num:number) {
        if (this.openTrips.length < 2) {
          trip.is_open = true;
        } else {
          this.alert = true
        }
      }

    private getTripDetails(trip_num:number) {
        this.$store.dispatch('updateActiveTrip', this.trips[trip_num])
        // this.$store.state.activeTrip = this.trips[trip_num]
        this.$router.push({path: '/trips/'+ trip_num})
      }

    private newTrip() {
        const newTripNum = this.$store.state.trips.length + 1
        this.$store.state.trips.push({type: 'trip', trip_num: newTripNum, vessel: this.$store.state.activeVessel, permits: [], messages: [], start_port: this.$store.state.activeUser.homeport, end_port: 'same as start'})
        this.$store.dispatch('updateActiveTrip', this.$store.state.trips[this.$store.state.trips.length -1])
        console.log(this.$store.state.activeTrip)
        this.$router.push({path: '/trips/' + newTripNum})
      }

    constructor() {
        super()
    }
}
</script>
-->

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


<style lang="stylus" scoped>
  .my-card
    width 100%
    max-width 450px
</style>


