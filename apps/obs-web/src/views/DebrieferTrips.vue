<template>
  <div>
    <prime-table
      :value="trips"
      :columns="columns"
      type="Trips"
      :simple="false"
      uniqueKey="_id"
      @save="save"
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
import { findIndex } from 'lodash';

import PrimeTable from './PrimeTable.vue';
Vue.component('PrimeTable', PrimeTable);

export default createComponent({
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const state: any = context.root.$store.state;
    const debriefer: any = state.debriefer;

    const columns: any = ref([]);
    const trips: any = ref([]);

    const ashopColumns = [
      { field: 'tripNum', header: 'Trip', type: 'number', key: 'ashopTripNum' },
      {
        field: 'crewSize',
        header: 'Crew Size',
        type: 'number',
        key: 'ashopCrewSize'
      },
      {
        field: 'departurePort.name',
        header: 'Departure Port',
        type: 'input',
        key: 'ashopDeparturePort'
      },
      // fish in hold at start?
      {
        field: 'departureDate',
        header: 'Departure Date',
        type: 'date',
        key: 'ashopDepartureDate'
      },
      {
        field: 'returnPort.name',
        header: 'Return Port',
        type: 'input',
        key: 'ashopReturnPort'
      },
      {
        field: 'returnDate',
        header: 'Return Date',
        type: 'date',
        key: 'ashopReturnDate'
      },
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
      {
        field: 'legacy.tripId',
        header: 'Id',
        type: 'number',
        key: 'wcgopId',
        isEditable: false
      },
      {
        field: 'tripStatus.description',
        header: 'Status',
        type: 'toggle',
        lookupKey: 'trip-status',
        lookupField: 'description',
        key: 'wcgopStatus',
        isEditable: true
      },
      {
        field: 'observer.firstName',
        header: 'Obs. First Name',
        type: 'input',
        key: 'wcgopObsFirstName',
        isEditable: false
      },
      {
        field: 'observer.lastName',
        header: 'Obs. Last Name',
        type: 'input',
        key: 'wcgopObsLastName',
        isEditable: false
      },
      {
        field: 'vessel.vesselName',
        header: 'Vessel',
        type: 'input',
        key: 'wcgopVessel',
        isEditable: true
      },
      // permit
      {
        field: 'coastGuardNumber',
        header: 'USCG#',
        type: 'input',
        key: 'wcgopCoastGuard',
        isEditable: true
      },
      // state reg #
      {
        field: 'program.name',
        header: 'Program',
        type: 'toggle',
        list: ['Catch Shares', 'Open Access'],
        key: 'wcgopProgramName',
        isEditable: true
      },
      {
        field: 'fishery.description',
        header: 'Fishery',
        type: 'input',
        key: 'wcgopFishery',
        isEditable: true
      },
      // first receiver
      {
        field: 'firstReceivers',
        header: 'First Receivers',
        type: 'popup',
        key: 'wcgopFR',
        uniqueKey: '_id',
        isEditable: false,

        popupColumns: [
          {
            field: 'dealerName',
            header: 'Dealer Name',
            type: 'input',
            key: 'dealerName'
          },
          {
            field: 'dealerNumber',
            header: 'Dealer Number',
            type: 'input',
            key: 'dealerNumber'
          }
        ]
      },
      {
        field: 'vessel.captains',
        header: 'Skippers',
        type: 'popup',
        key: 'wcgopCaptains',
        uniqueKey: '_id',
        isEditable: false,
        popupColumns: [
          {
            field: 'firstName',
            header: 'First Name',
            type: 'input',
            key: 'firstName'
          },
          {
            field: 'lastName',
            header: 'Last Name',
            type: 'input',
            key: 'lastName'
          }
        ]
      },
      {
        field: 'departureDate',
        header: 'Departure Date',
        type: 'date',
        key: 'wcgopDepartureDate',
        isEditable: true
      },
      {
        field: 'returnDate',
        header: 'Return Date',
        type: 'date',
        key: 'wcgopReturnDate',
        isEditable: true
      },
      {
        field: 'legacy.isNoFishingActivity',
        header: 'No Fishing Activity?',
        type: 'boolean',
        key: 'wcgopFishingActivity',
        isEditable: true
      },
      {
        field: 'isPartialTrip',
        header: 'Partial Trip?',
        type: 'boolean',
        key: 'wcgopPartialTrip',
        isEditable: true
      },
      {
        field: 'isFishProcessed',
        header: 'Fish Processed?',
        type: 'boolean',
        key: 'wcgopFishProcessed',
        isEditable: true
      },
      {
        field: 'logbookType',
        header: 'Logbook type',
        type: 'number',
        key: 'wcgopLogbookType',
        isEditable: true
      },
      {
        field: 'logbookNum',
        header: 'Logbook Num',
        key: 'wcgopLogbookNum',
        isEditable: true
      },
      {
        field: 'observerLogbookNum',
        header: 'Obs Logbook #',
        type: 'number',
        key: 'wcgopObsLog',
        isEditable: true
      },
      {
        field: 'crewSize',
        header: '# Crew',
        type: 'number',
        key: 'wcgopCrewSize',
        isEditable: true
      },
      {
        field: 'departurePort.name',
        header: 'Departure Port',
        type: 'toggle',
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopDeparturePort',
        isEditable: true
      },
      {
        field: 'returnPort.name',
        header: 'Return Port',
        type: 'toggle',
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopReturnPort',
        isEditable: true
      },
      {
        field: 'fishTickets',
        header: 'Fish Tickets',
        type: 'popup',
        key: 'wcgopFishTickets',
        uniqueKey: 'fishTicketNumber',
        isEditable: false,
        popupColumns: [
          {
            field: 'fishTicketNumber',
            header: 'Ticket #',
            type: 'input',
            key: 'ticket'
          },
          {
            field: 'stateAgency',
            header: 'State',
            type: 'toggle',
            key: 'state',
            list: ['C', 'O', 'W']
          },
          { field: 'createdDate', header: 'Date', type: 'date', key: 'date' }
        ]
      },
      {
        field: 'notes',
        header: 'Notes',
        type: 'input',
        key: 'wcgopNotes',
        isEditable: true
      }
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

    function save(data: any) {
      masterDB.put(data._id, data, data._rev).then((response: any) => {
        const index = findIndex(trips.value, { _id: data._id });
        trips.value[index]._rev = response.rev;
      });
    }

    return {
      columns,
      trips,
      save
    };
  }
});
</script>