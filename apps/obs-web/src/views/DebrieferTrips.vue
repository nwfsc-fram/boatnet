<template>
  <div>
    <prime-table
      :value="trips"
      :columns="columns"
      :isEditable="true"
      type="Trips"
    />
  </div>
</template>


<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch
} from '@vue/composition-api';
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { DebrieferState } from '../_store/types/types';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopCatch,
  WcgopSpecimen,
  Basket
} from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date, colors } from 'quasar';
import { convertToObject } from 'typescript';

import PrimeTable from './PrimeTable.vue';
Vue.component('PrimeTable', PrimeTable);

export default createComponent({
  setup(props, context) {
    const state: any = context.root.$store.state;
    const debriefer: any = state.debriefer;

    const columns: any = ref([]);
    const trips: any = ref([]);

    const ashopColumns = [
      { field: 'tripNum', header: 'Trip', type: 'number', key: 'ashopTripNum' },
      { field: 'crewSize', header: 'Crew Size', type: 'number', key: 'ashopCrewSize' },
      { field: 'departurePort.name', header: 'Departure Port', type: 'input', key: 'ashopDeparturePort' },
      // fish in hold at start?
      { field: 'departureDate', header: 'Departure Date', type: 'date', key: 'ashopDepartureDate' },
      { field: 'returnPort.name', header: 'Return Port', type: 'input', key: 'ashopReturnPort' },
      { field: 'returnDate', header: 'Return Date', type: 'date', key: 'ashopReturnDate' },
      {
        field: 'didFishingOccur',
        header: 'Did Fishing Occur?',
        type: 'boolean',
        key: 'ashopFishingOccur'
      },
      // bait used
       { field: 'notes', header: 'Comments', type: 'input', key: 'ashopNotes' }
    ];

    const wcgopColumns = [
      { field: 'legacy.tripId', header: 'Id', type: 'number', key: 'wcgopId' },
      {
        field: 'tripStatus.description',
        header: 'Status',
        type: 'toggle',
        lookupKey: 'trip-status',
        lookupField: 'description',
        key: 'wcgopStatus'
      },
      { field: 'observer.firstName', header: 'Obs. First Name', type: 'input', key: 'wcgopObsFirstName' },
      { field: 'observer.lastName', header: 'Obs. Last Name', type: 'input', key: 'wcgopObsLastName' },
      { field: 'vessel.vesselName', header: 'Vessel', type: 'input', key: 'wcgopVessel' },
      // permit
      { field: 'coastGuardNumber', header: 'USCG#', type: 'input', key: 'wcgopCoastGuard' },
      // state reg #
      {
        field: 'program.name',
        header: 'Program',
        type: 'toggle',
        list: ['Catch Shares', 'Open Access'], key: 'wcgopProgramName'
      },
      {
        field: 'fishery.description',
        header: 'Fishery',
        type: 'input', key: 'wcgopFishery'
      },
      // first receiver
      // skipper

      { field: 'departureDate', header: 'Departure Date', type: 'date', key: 'wcgopDepartureDate' },
      { field: 'returnDate', header: 'Return Date', type: 'date', key: 'wcgopReturnDate' },
      {
        field: 'legacy.isNoFishingActivity',
        header: 'No Fishing Activity?',
        type: 'boolean',
        key: 'wcgopFishingActivity'
      },
      { field: 'isPartialTrip', header: 'Partial Trip?', type: 'boolean', key: 'wcgopPartialTrip' },
      { field: 'isFishProcessed', header: 'Fish Processed?', type: 'boolean', key: 'wcgopFishProcessed' },
      { field: 'logbookType', header: 'Logbook type', type: 'number', key: 'wcgopLogbookType' },
      { field: 'logbookNum', header: 'Logbook Num', key: 'wcgopLogbookNum' },
      { field: 'observerLogbookNum', header: 'Obs Logbook #', type: 'number', key: 'wcgopObsLog' },

      { field: 'crewSize', header: '# Crew', type: 'number', key: 'wcgopCrewSize' },
      {
        field: 'departurePort.name',
        header: 'Departure Port',
        type: 'toggle',
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopDeparturePort'
      },
      {
        field: 'returnPort.name',
        header: 'Return Port',
        type: 'toggle',
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopReturnPort'
      },
      // FT#
      // state
      // date
      { field: 'notes', header: 'Notes', type: 'input', key: 'wcgopNotes' }
    ];

    setColumns();
    watch(() => state.debriefer.program, setColumns);
    watch(() => state.debriefer.tripIds, getTrips);

    function setColumns() {
      const program = state.debriefer.program;
      columns.value = [];
      if (program === 'ashop') {
        columns.value = ashopColumns;
      } else {
        columns.value = wcgopColumns;
      }
    }

    async function getTrips() {
      const masterDB: Client<any> = couchService.masterDB;
      const tripsHolder = [];
      try {
        const options: ListOptions = {
          keys: state.debriefer.tripIds
        };
        const result = await masterDB.listWithDocs(options);
        for (const row of result.rows) {
          tripsHolder.push(row);
        }
        trips.value = tripsHolder;
      } catch (err) {
        console.log('error');
      }
    }

    return {
      columns,
      trips
    };
  }
});
</script>