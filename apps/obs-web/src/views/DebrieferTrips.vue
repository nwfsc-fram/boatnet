<template>
  <div>
    <prime-table
      :value="trips"
      :columns="columns"
      type="Trips"
      :simple="false"
      uniqueKey="_id"
      :enableSelection="true"
      :showSelectionBoxes="true"
      :isFullSize="isFullSize"
      :loading="loading"
      :initialSelection="initialSelection"
      :lookupsMap="lookupsMap"
      @save="save"
      @selectValues="selectValues"
    />
  </div>
</template>


<script lang="ts">
import {
  createComponent,
  ref,
  watch,
  onBeforeMount,
  onMounted
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { cloneDeep, findIndex } from 'lodash';
import { getTripsByDates, getTripsByObserverId } from '../helpers/getFields';

import PrimeTable from './PrimeTable.vue';
Vue.component('PrimeTable', PrimeTable);

export default createComponent({
  props: {
    isFullSize: Boolean,
    lookupsMap: Array
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state: any = store.state;
    const displayColumns: any = state.debriefer.displayColumns;

    const flatten = require('flat');
    const unflatten = flatten.unflatten;

    const columns: any = ref([]);
    const trips: any = ref([]);
    const loading: any = ref(false);
    const initialSelection: any = state.debriefer && state.debriefer.selectedTrips ? state.debriefer.selectedTrips : [];

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
        field: 'legacy-tripId',
        header: 'Id',
        type: 'number',
        key: 'wcgopId',
        isEditable: false,
        width: '70'
      },
      {
        field: 'tripStatus-description',
        header: 'Status',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'trip-status',
        lookupField: 'description',
        key: 'wcgopStatus',
        isEditable: true,
        width: '100',
        codeWidth: '70'
      },
      {
        field: 'tripScore',
        header: 'Score',
        type: 'toggle',
        listType: 'template',
        list: ['Pass', 'Fail'],
        key: 'wcgopTripScore',
        isEditable: true,
        width: '90'
      },
      {
        field: 'observer-firstName',
        displayField: ['observer-firstName', 'observer-lastName'],
        header: 'Observer',
        type: 'input',
        key: 'wcgopObsFirstName',
        isEditable: false,
        width: '120'
      },
      {
        field: 'vessel-vesselName',
        header: 'Vessel',
        type: 'input',
        key: 'wcgopVessel',
        isEditable: true,
        width: '120'
      },
      {
        field: 'certificate-0-certificateNumber',
        header: 'Permit',
        type: 'input',
        key: 'wcgopPermit',
        isEditable: true,
        width: '120'
      },
      {
        field: 'vessel-coastGuardNumber',
        header: 'USCG#',
        type: 'input',
        key: 'wcgopCoastGuard',
        isEditable: false,
        width: '80'
      },
      {
        field: 'vessel-stateRegulationNumber',
        header: 'State Reg',
        type: 'input',
        key: 'wcgopStateReg',
        isEditable: false,
        width: '100'
      },
      {
        field: 'program-name',
        header: 'Program',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'program',
        lookupField: 'name',
        key: 'wcgopProgramName',
        isEditable: true,
        width: '150',
        codeWidth: '80'
      },
      {
        field: 'fishery-description',
        header: 'Fishery',
        type: 'toggle',
        listType: 'fetch',
        search: true,
        lookupKey: 'fishery',
        lookupField: 'description',
        key: 'wcgopFishery',
        isEditable: true,
        width: '250',
        codeWidth: '80'
      },
      {
        field: 'firstReceivers-0-dealerName',
        header: 'First Receivers',
        type: 'input',
        key: 'wcgopFR',
        isEditable: false,
        width: '120'
      },
      {
        field: 'vessel-captains-0-firstName',
        displayField: [
          'vessel-captains-0-firstName',
          'vessel-captains-0-lastName'
        ],
        header: 'Skipper',
        type: 'input',
        listType: 'fetch',
        lookupKey: 'fishery',
        lookupField: 'description',
        key: 'wcgopCaptains',
        uniqueKey: '-id',
        popupField: 'vessel-captains',
        isEditable: false,
        width: '160'
      },
      {
        field: 'departureDate',
        header: 'Departure Date',
        type: 'date',
        key: 'wcgopDepartureDate',
        isEditable: true,
        width: '150'
      },
      {
        field: 'returnDate',
        header: 'Return Date',
        type: 'date',
        key: 'wcgopReturnDate',
        isEditable: true,
        width: '150'
      },
      {
        field: 'legacy-isNoFishingActivity',
        header: 'Fishing Activity?',
        type: 'toggle',
        listType: 'boolean',
        key: 'wcgopFishingActivity',
        isEditable: true,
        width: '120'
      },
      {
        field: 'isPartialTrip',
        header: 'Partial Trip?',
        type: 'toggle',
        listType: 'boolean',
        key: 'wcgopPartialTrip',
        isEditable: true,
        width: '120'
      },
      {
        field: 'isFishProcessed',
        header: 'Fish Processed?',
        type: 'toggle',
        listType: 'boolean',
        key: 'wcgopFishProcessed',
        isEditable: true,
        width: '120'
      },
      {
        field: 'logbookType',
        header: 'Logbook type',
        type: 'number',
        key: 'wcgopLogbookType',
        isEditable: true,
        width: '80'
      },
      {
        field: 'logbookNum',
        header: 'Logbook Num',
        key: 'wcgopLogbookNum',
        isEditable: true,
        width: '80'
      },
      {
        field: 'observerLogbookNum',
        header: 'Obs Logbook #',
        type: 'number',
        key: 'wcgopObsLog',
        isEditable: true,
        width: '80'
      },
      {
        field: 'crewSize',
        header: '# Crew',
        type: 'number',
        key: 'wcgopCrewSize',
        isEditable: true,
        width: '80'
      },
      {
        field: 'departurePort-name',
        header: 'Dept Port',
        type: 'toggle',
        listType: 'fetch',
        search: true,
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopDeparturePort',
        isEditable: true,
        width: '200',
        codeWidth: '90'
      },
      {
        field: 'returnPort-name',
        header: 'Ret Port',
        type: 'toggle',
        listType: 'fetch',
        search: true,
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopReturnPort',
        isEditable: true,
        width: '200',
        codeWidth: '80'
      },
      {
        field: 'fishTickets-0-fishTicketNumber',
        header: 'FT #',
        type: 'popup',
        key: 'wcgopFT',
        isEditable: true,
        uniqueKey: 'fishTicketNumber',
        popupField: 'fishTickets',
        width: '150',
        popupColumns: [
          {
            field: 'fishTicketNumber',
            header: 'Ticket #',
            type: 'input',
            key: 'ticket',
            isEditable: true
          },
          {
            field: 'stateAgency',
            header: 'State',
            type: 'toggle',
            key: 'state',
            list: ['C', 'O', 'W'],
            isEditable: true
          },
          {
            field: 'createdDate',
            header: 'Date',
            type: 'date',
            key: 'date',
            isEditable: true
          }
        ]
      },
      {
        field: 'fishTickets-0-stateAgency',
        header: 'State',
        type: 'toggle',
        key: 'wcgopState',
        isEditable: true,
        listType: 'template',
        list: ['C', 'O', 'W'],
        width: '80'
      },
      {
        field: 'fishTickets-0-fishTicketDate',
        header: 'Date',
        type: 'date',
        key: 'wcgopDate',
        isEditable: true,
        width: '150'
      },
      {
        field: 'notes',
        header: 'Notes',
        type: 'textArea',
        key: 'wcgopNotes',
        isEditable: true,
        width: '300'
      }
    ];

    let mounted = true;

    onBeforeMount(() => {
      mounted = false;
      if (state.debriefer.trips.length > 0) {
          trips.value = state.debriefer.trips;
        }

    });

    setColumns();
    watch(() => state.debriefer.program, setColumns);

    watch(() => state.debriefer.observer, async () => {
      populateTrips('observer');
    });
    watch(() => state.debriefer.evaluationPeriod, () => {
      populateTrips('evalPeriod');
    });
    watch(() => state.debriefer.tripIds, async () => {
      populateTrips('tripIds');
    });

    async function populateTrips(type: string) {
      loading.value = true;
      if (!mounted) {
        if (type === 'observer') {
          trips.value = [];
        } else if (type === 'evalPeriod') {
          const evalPeriod = state.debriefer.evaluationPeriod;
          const observer = state.debriefer.observer;
          trips.value = await getTripsByDates(new Date(evalPeriod.startDate),
                                              new Date(evalPeriod.endDate),
                                              observer);
        } else if (type === 'tripIds') {
          await getTrips();
        }
        store.dispatch('debriefer/updateTrips', trips.value);
      }
      loading.value = false;
    }

    async function getTrips() {
      try {
        const options: ListOptions = {
          keys: state.debriefer.tripIds
        };
        const result = await masterDB.listWithDocs(options);
        trips.value = result.rows;
      } catch (err) {
        console.log('error');
      }
    }

    function setColumns() {
      const program = state.debriefer.program;
      columns.value = [];
      if (program === 'ashop') {
        columns.value = ashopColumns;
      } else {
        columns.value = wcgopColumns;
      }
    }

    async function save(data: any) {
      const result = await masterDB.put(data._id, data, data._rev);
      const index = findIndex(trips.value, { _id: data._id });
      const updatedvalue: any[] = cloneDeep(trips.value);
      updatedvalue[index] = data;
      updatedvalue[index]._rev = result.rev;
      trips.value = updatedvalue;
      store.dispatch('debriefer/updateTrips', trips.value);
    }

    function selectValues(data: any) {
      store.dispatch('debriefer/updateSelectedTrips', data);
      getOperations();
    }

    async function getOperations() {
      let ops: any[] = [];
      let operationIds: any[] = [];
      for (const trip of state.debriefer.selectedTrips) {
        const unflattenedTrip = unflatten(trip, { delimiter: '-' });
        operationIds = operationIds.concat(unflattenedTrip.operationIDs);
      }
      if (operationIds.length > 0) {
        try {
          const operationOptions: ListOptions = { keys: operationIds };
          const operationDocs = await masterDB.listWithDocs(operationOptions);
          ops = operationDocs.rows;
        } catch (err) {
          console.log('cannot fetch operation docs ' + err);
        }
      }
      store.dispatch('debriefer/updateOperations', ops);
    }

    return {
      columns,
      trips,
      save,
      loading,
      selectValues,
      initialSelection,
      displayColumns
    };
  }
});
</script>