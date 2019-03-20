<template>
  <div class="q-pa-md row items-start q-gutter-md">

      <div><strong>Active Trips</strong></div>

      <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-primary text-white" v-if="trip.is_open"> -->

      <q-card v-for="(trip, i) in openTrips" :key="trip.trip_num" class="my-card bg-primary text-white">
        <q-card-section>
          <div class="text-h6">{{ trip.trip_num }} {{ trip.permits[0].fishery }}<span v-if="trip.permits.length > 1">&nbsp;+</span></div>
          {{ trip.start_date.split(" ")[0] }} - {{ trip.end_date.split(" ")[0] }}
          <div style="float:right">
            <q-icon v-if="trip.messages" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
            <q-icon v-if="trip.selected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat @click="getTripDetails(trip.trip_num)">Edit</q-btn>
          <q-btn flat @click="closeTrip(trip.trip_num)">Close</q-btn>
        </q-card-actions>
    </q-card>
    
    <div><strong>Closed Trips</strong></div>

    <!-- <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-blue-grey-3 text-white" v-if="!trip.is_open"> -->

    <q-card v-for="(trip, i) in closedTrips" :key="trip.trip_num" class="my-card bg-blue-grey-3 text-white">

      <q-card-section>
        <div class="text-h6">{{ trip.trip_num }} {{ trip.permits[0].fishery }}<span v-if="trip.permits.length > 1">&nbsp;+</span></div>
        {{ trip.start_date.split(" ")[0] }} - {{ trip.end_date.split(" ")[0] }}
        <div style="float:right">
          <q-icon v-if="trip.messages" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
          <q-icon v-if="trip.selected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
        </div>
      </q-card-section>
      <q-card-actions style="float:right">
        <q-btn flat @click="reOpenTrip(trip.trip_num)">Reopen</q-btn>
      </q-card-actions>        

    </q-card>

  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

export default class Trips extends Vue{

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

    private closeTrip(i:number) {
        this.$store.state.trips[i].is_open = false;
      }

    private reOpenTrip(i:number) {
        this.$store.state.trips[i].is_open = true;
      }

    private getTripDetails(i:number) {
        this.$store.dispatch('updateActiveTrip', this.trips[i])
        // this.$store.state.activeTrip = this.trips[i]
        this.$router.push({path: '/trips/'+ i})
      }

    constructor() {
        super()
    }
}
</script>

<style lang="stylus" scoped>
  .my-card
    width 100%
    max-width 450px
</style>


<!--
<script>

import Vue from 'vue';
import TripDetails from './TripDetails.vue';

export default{
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
      closeTrip(i) {
        this.$store.state.trips[i].is_open = false;
      },
      reOpenTrip(i) {
        this.$store.state.trips[i].is_open = true;
      },
      getTripDetails(i) {
        this.$store.dispatch('updateActiveTrip', this.trips[i])
        // this.$store.state.activeTrip = this.trips[i]
        this.$router.push({path: '/trips/'+ i})
      }
    }
};
</script>
-->