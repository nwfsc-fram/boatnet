<template>
  <div class="q-pa-md q-gutter-md">
    <q-input
        v-model="tripNum"
        dense
        outlined
        label="tripNum"
        debounce="1000"
    ></q-input>

  <p>
  <span>Vessel Name: <b>{{ footageDoc.vesselName ? footageDoc.vesselName : '--none--' }}</b>,&nbsp;&nbsp;</span>
  <span>Vessel Id: <b>{{ footageDoc.vesselId ? footageDoc.vesselId : '--none--' }}</b>,&nbsp;&nbsp;</span>
  <span>Trip Start: <b>{{ footageDoc.tripStart ? formatDate(footageDoc.tripStart) : '--none--' }}</b>,&nbsp;&nbsp;</span>
  <span>Trip End: <b>{{ footageDoc.tripEnd ? formatDate(footageDoc.tripEnd) : '--none--' }}</b></span>
  </p>

  <p>Date Footage Transferred: <b>{{ footageDoc.dateAdded !== '' ? formatDate(footageDoc.dateAdded) : ''}}</b></p>

    <q-input
        v-model="footageDoc.filesLocation"
        dense
        outlined
        label="Files Location"
    ></q-input>

    <q-btn
      dense
      color="primary"
      label="submit"
    ></q-btn>

  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';

import { Vue, Watch } from 'vue-property-decorator';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import { WatchOptions } from 'vue';

import { Notify } from 'quasar';
import moment from 'moment';

import { getTripsApiTrip, getCatchApiCatch, getTripsApiTrips } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const tripNum: any = ref(null);

    const footageDoc: any = reactive({vesselName: '', vesselId: '', tripStart: '', tripEnd: '', dateAdded: '', filesLocation: ''});

    const formatDate: any = (dateVal: any) => {
      return moment(dateVal).format('MMM DD, YYYY HH:mm');
    };

    const loadTripsApiTrip: any = async (tripNumber: number) => {
          const trip: any = await getTripsApiTrip(tripNumber);
          if (typeof trip === 'object') {
            footageDoc.vesselName = trip!.vesselName;
            footageDoc.vesselId = trip!.vesselId;
            footageDoc.tripStart = trip!.departureDate;
            footageDoc.tripEnd = trip!.returnDate;
          }
    };

    onMounted( () => {
        tripNum.value = context.root.$route.params.id ? context.root.$route.params.id : '';
        loadTripsApiTrip(tripNum.value);
    });

    const watcherOptions: WatchOptions = {
      immediate: false, deep: true
    };

    watch(
      () => tripNum.value,
      (newVal, oldVal) => {
        if (newVal) {
          loadTripsApiTrip(newVal);
        }
      },
      watcherOptions
    );

    return {
        footageDoc, tripNum, formatDate
    };
  }
});
</script>

<style>
.red {
  color: red;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: rgb(238, 238, 238);
}
</style>
