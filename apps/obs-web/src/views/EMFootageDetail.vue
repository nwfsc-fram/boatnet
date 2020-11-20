<template>
  <div class="q-pa-md q-gutter-md">
    <q-input
        v-model="tripNum"
        dense
        outlined
        label="tripNum"
        debounce="1000"
        :rules="[val => val.length === 6 || 'tripNum is 6 digits.']"
        :hint="!tripNumValid ? 'Invalid Trip Number' : ''"
    >
    <template v-slot:append>
      <q-spinner
        v-if="loading"
        color="primary"
        size="1em"
      />
    </template>
    </q-input>
  <p>
  <span>Vessel Name: <b>{{ footageDoc.vesselName ? footageDoc.vesselName : '--none--' }}</b>,&nbsp;&nbsp;</span>
  <span>Vessel Id: <b>{{ footageDoc.vesselId ? footageDoc.vesselId : '--none--' }}</b>,&nbsp;&nbsp;</span>
  <span>Trip Start: <b>{{ footageDoc.tripStart ? formatDate(footageDoc.tripStart) : '--none--' }}</b>,&nbsp;&nbsp;</span>
  <span>Trip End: <b>{{ footageDoc.tripEnd ? formatDate(footageDoc.tripEnd) : '--none--' }}</b></span>
  </p>

  <p>Date Footage Added: <b>{{ footageDoc.footageAdded !== '' ? formatDate(footageDoc.footageAdded) : ''}}</b></p>

    <q-input
        v-model="footageDoc.filesLocation"
        dense
        outlined
        label="Files Location"
    ></q-input>

    <q-btn
      color="primary"
      label="submit"
      @click="submit"
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
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const tripNum: any = ref(null);
    const loading: any = ref(false);
    const tripNumValid: any = ref(false);

    const masterDB: Client<any> = couchService.masterDB;
    const queryOptions = {
        reduce: false,
        include_docs: true
    };

    const footageDoc: any = reactive({tripNum: '', vesselName: '', vesselId: '', tripStart: null, tripEnd: null, footageAdded: '', filesLocation: ''});

    const formatDate: any = (dateVal: any) => {
      return moment(dateVal).format('MMM DD, YYYY HH:mm');
    };

    const loadTripsApiTrip: any = async (tripNumber: number) => {
          loading.value = true;
          const trip: any = await getTripsApiTrip(tripNumber);
          loading.value = false;
          if (typeof trip === 'object') {
            footageDoc.vesselName = trip!.vesselName;
            footageDoc.vesselId = trip!.vesselId;
            footageDoc.tripStart = trip!.departureDate;
            footageDoc.tripEnd = trip!.returnDate;
            footageDoc.tripNum = tripNumber;
            tripNumValid.value = true;
          } else {
            Notify.create({
              message: '<b>Trip with tripNum: ' + tripNumber + ' could not be found.</b>',
              position: 'center',
              color: 'red',
              timeout: 3000,
              icon: 'warning',
              html: true,
              multiLine: true
            });
            tripNumValid.value = false;
          }
    };

    const loadFootageDetails: any = async (tripNumber: number) => {
      loading.value = true;
      const footageQuery: any = await masterDB.view(
        'TripsApi',
        'all_footage_location',
        {reduce: false, include_docs: true, key: tripNumber} as any
      );
      loading.value = false;
      if (footageQuery.rows.length > 0) {
        footageDoc.tripNum = tripNumber;
        for (const attrib of Object.keys(footageQuery.rows[0].doc)) {
          footageDoc[attrib] = footageQuery.rows[0].doc[attrib];
        }
        tripNumValid.value = true;
      } else {
        loadTripsApiTrip(tripNumber);
      }
    };

    const submit = async () => {
      if (footageDoc.tripNum === '' || footageDoc.filesLocation === '' && tripNumValid.value) {
        Notify.create({
          message: '<b>submission requires a valid tripNum and a Files Location</b>',
              position: 'center',
              color: 'red',
              timeout: 3000,
              icon: 'warning',
              html: true,
              multiLine: true
        });
      } else {
        if (!footageDoc.footageAdded) {
          footageDoc.footageAdded = moment().format();
        }
        if (footageDoc._id) {
          footageDoc.updatedBy = authService.getCurrentUser()!.username;
          footageDoc.updatedDate = moment().format();
          await masterDB.put(
            footageDoc._id,
            footageDoc,
            footageDoc._rev
          ).then( () => {
            Notify.create({
                message: '<b>Files location successfully updated</b>',
                position: 'center',
                color: 'blue',
                timeout: 3000,
                icon: 'done',
                html: true,
                multiLine: true
            });
            context.root.$router.push({path: '/em-footage-manager'});
          });
        } else {
          footageDoc.type = 'footage-location';
          footageDoc.createdBy = authService.getCurrentUser()!.username;
          footageDoc.createdDated = moment().format();
          await masterDB.post(
            footageDoc
          ).then( () => {
            Notify.create({
                message: '<b>Files location successfully stored</b>',
                position: 'center',
                color: 'blue',
                timeout: 3000,
                icon: 'done',
                html: true,
                multiLine: true
            });
          });
          context.root.$router.push({path: '/em-footage-manager'});
        }
      }
    };

    onMounted( () => {
      tripNum.value = context.root.$route.params.id !== 'new' ? context.root.$route.params.id : '';
      if (tripNum.value.length === 6) {
        loadFootageDetails(tripNum.value);
      }
    });

    const watcherOptions: WatchOptions = {
      immediate: false, deep: true
    };

    watch(
      () => tripNum.value,
      (newVal, oldVal) => {
        if (newVal && newVal.length === 6) {
          Object.keys(footageDoc).forEach( (key: any) => footageDoc[key] = '' );
          if (Object.keys(footageDoc).includes('_id')) { delete footageDoc._id; }
          if (Object.keys(footageDoc).includes('_rev')) { delete footageDoc._rev; }
          loadFootageDetails(newVal);
        }
      },
      watcherOptions
    );

    return {
        footageDoc, tripNum, formatDate, submit, loading, tripNumValid
    };
  }
});
</script>

<style scoped>

* >>> .q-field__messages {
  color: red !important
}
</style>
