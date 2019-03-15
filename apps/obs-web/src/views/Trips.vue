<template>
  <div class="q-pa-md row items-start q-gutter-md">

      <div class="subheading">Active Trips</div>

      <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-primary text-white" v-if="trip.is_open">

        <q-card-section>
          <div class="text-h6">{{ trip.trip_num }} {{ trip.permits[0].fishery }}<span v-if="trip.permits.length > 1">&nbsp;+</span></div>
          {{ trip.start_date.split(" ")[0] }} - {{ trip.end_date.split(" ")[0] }}
          <div style="float:right">
            <q-icon v-if="trip.messages" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
            <q-icon v-if="trip.selected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
          </div>
        </q-card-section>
        <q-card-actions>
        <router-link :to="{ name: 'Trip Detail', params: { id: trip.trip_num }}">
          <q-btn flat>Edit</q-btn>
        </router-link>
          <q-btn flat @click="closeTrip(trip.trip_num)">Close</q-btn>
        </q-card-actions>
    </q-card>
    
    <div class="subheading">Closed Trips</div>

    <q-card v-for="(trip, i) in trips.filter(trip => trip.vessel == this.$store.state.activeVessel.name)" :key="trip.trip_num" class="my-card bg-blue-grey-3 text-white" v-if="!trip.is_open">

      <q-card-section>
        <div class="text-h6">{{ trip.trip_num }} {{ trip.permits[0].fishery }}<span v-if="trip.permits.length > 1">&nbsp;+</span></div>
        {{ trip.start_date.split(" ")[0] }} - {{ trip.end_date.split(" ")[0] }}
        <div style="float:right">
          <q-icon v-if="trip.messages" name="chat" class="text-white" style="font-size: 32px"></q-icon>&nbsp;
          <q-icon v-if="trip.selected" name="check_circle" class="text-white" style="font-size: 32px"></q-icon>
        </div>
      </q-card-section>
      <q-card-actions style="float:right">
        <q-btn flat>Reopen</q-btn>
      </q-card-actions>        

    </q-card>

  </div>
</template>

<script>

  const trips = [{type: 'trip', trip_num: '3', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares', },]}, 
    {type: 'trip', trip_num: '2', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '1', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '5', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '4', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: 'active', selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '2', vessel: 'Ms Julie', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '1', vessel: 'Ms Julie', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '3', vessel: 'Ms Julie', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '4', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '3', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: 'active', selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '2', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '1', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '4', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '5', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '3', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '2', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '1', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
  ]

import Vue from 'vue';
import TripDetail from './TripDetail.vue';

export default{
    computed: {
        trips: {
            get() {
                return this.$store.getters.trips
            },
            set(value) {
                this.$store.dispatch('updateTrips', value)
            }
        }
    },
    created() {
      this.$store.dispatch('updateTrips', trips)
      console.log(this.$store.getters.trips)
    },
    methods: {
      closeTrip() 
    }
};
</script>


<style lang="stylus" scoped>
.my-card
  width 100%
  max-width 450px

</style>