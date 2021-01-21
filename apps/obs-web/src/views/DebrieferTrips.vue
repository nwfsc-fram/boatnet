<template>
  <div>
    <prime-table
      :value="trips"
      :columns="columns"
      type="Trips"
      :simple="false"
      uniqueKey="_id"
      :enableSelection="true"
      :isFullSize="isFullSize"
      :loading="loading"
      :initialSelection="initialSelection"
      @save="save"
      @selectValues="selectValues"
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
import { cloneDeep, findIndex, get, remove, indexOf } from 'lodash';
import { getTripsByDates } from '../helpers/getFields';
import moment from 'moment';

import PrimeTable from './PrimeTable.vue';
Vue.component('PrimeTable', PrimeTable);

export default createComponent({
  props: {
    isFullSize: Boolean
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state: any = store.state;
    const debriefer: any = state.debriefer;

    const flatten = require('flat');
    const unflatten = flatten.unflatten;

    const columns: any = ref([]);
    const trips: any = ref([]);
    const loading: any = ref(false);
    const initialSelection: any = state.debriefer && state.debriefer.trips ? state.debriefer.trips : [];

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
        width: '100'
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
      // permit
      {
        field: 'coastGuardNumber',
        header: 'USCG#',
        type: 'input',
        key: 'wcgopCoastGuard',
        isEditable: true,
        width: '80'
      },
      // state reg #
      {
        field: 'program-name',
        header: 'Program',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'program',
        lookupField: 'name',
        key: 'wcgopProgramName',
        isEditable: true,
        width: '150'
      },
      {
        field: 'fisherydescription',
        header: 'Fishery',
        type: 'toggle',
        listType: 'fetch',
        search: true,
        lookupKey: 'fishery',
        lookupField: 'description',
        key: 'wcgopFishery',
        isEditable: true,
        width: '250'
      },
      // first receiver
      {
        field: 'firstReceivers-0-dealerName',
        header: 'First Receivers',
        type: 'toggle',
        listType: 'fetch',
        search: true,
        lookupKey: 'first-receiver',
        key: 'wcgopFR',
        uniqueKey: '_id',
        isEditable: false,
        width: '120',
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
        field: 'vessel-captains-0-firstName',
        displayField: [
          'vessel-captains-0-firstName',
          'vessel-captains-0-lastName'
        ],
        header: 'Skipper',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'fishery',
        lookupField: 'description',
        key: 'wcgopCaptains',
        uniqueKey: '-id',
        popupField: 'vessel-captains',
        isEditable: false,
        width: '120'
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
        header: 'Departure Port',
        type: 'toggle',
        listType: 'fetch',
        search: true,
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopDeparturePort',
        isEditable: true,
        width: '200'
      },
      {
        field: 'returnPort-name',
        header: 'Return Port',
        type: 'toggle',
        listType: 'fetch',
        search: true,
        lookupKey: 'port',
        lookupField: 'name',
        key: 'wcgopReturnPort',
        isEditable: true,
        width: '200'
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

    setColumns();
    watch(() => state.debriefer.program, setColumns);

    watch(() => state.debriefer.evaluationPeriod, loadTripsByEvaluationPeriod);
    watch(() => state.debriefer.tripSearchFilters, getTripsBySearchParams);
    watch(() => state.debriefer.tripIds, getTrips);

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

    async function loadTripsByEvaluationPeriod() {
      const observer = state.debriefer.observers;
      const evalPeriod = state.debriefer.evaluationPeriod;

      if (observer && evalPeriod) {
        trips.value = await getTripsByDates(
          new Date(evalPeriod.startDate),
          new Date(evalPeriod.endDate),
          evalPeriod.observer
        );
      }
    }

    async function getTripsBySearchParams() {
      loading.value = true;
      const filters = state.debriefer.tripSearchFilters;
      const views = Object.keys(filters);

      if (views.length === 0) {
        trips.value = [];
        loading.value = false;
        return;
      }

      const queryView = views[0]; // use the first key in the object to query couch, then filter based off the remaining keys
      let keyVals = {};
      if (queryView === 'wcgop_trips_by_date') {
        keyVals = {
          start_key: filters[queryView].val[0],
          end_key: filters[queryView].val[1]
        };
      } else {
        keyVals = { keys: filters[queryView].val };
      }

      try {
        const results = await masterDB
          .viewWithDocs('obs_web', queryView, keyVals)
          .then((response: any) => {
            trips.value = response.rows
              .filter((row: any) => {
                let keep: boolean = true;
                if (views.length > 1) {
                  for (let i = 1; i < views.length; i++) {
                    if (views[i] === 'wcgop_trips_by_date') {
                      if (moment(row.doc.returnDate).isBefore(filters[views[i]].val[0]) ||
                        moment(row.doc.returnDate).isAfter(filters[views[i]].val[1])
                      ) {
                        keep = false;
                      }
                    } else {
                      const rowVal = get(row.doc, filters[views[i]].field);
                      if (indexOf(filters[views[i]].val, rowVal) === -1) {
                        keep = false;
                      }
                    }
                  }
                }
                return keep;
              })
              .map((row: any) => row.doc);
          });
      } catch (error) {
        console.log(error);
        loading.value = false;
      }
      loading.value = false;
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
    }

    function selectValues(data: any) {
      const unflattenData: any[] = [];
      for (const val of data) {
        unflattenData.push(unflatten(val, { delimiter: '-'}));
      }
      store.dispatch('debriefer/updateTrips', unflattenData);
      getOperations();
    }

    async function getOperations() {
      let ops: any[] = [];
      let operationIds: any[] = [];
      for (const trip of state.debriefer.trips) {
        operationIds = operationIds.concat(trip.operationIDs);
      }
      if (operationIds.length > 0) {
        try {
          const operationOptions: ListOptions = { keys: operationIds };
          const operationDocs = await masterDB.listWithDocs(operationOptions);
          ops = operationDocs.rows;
          ops.sort((a: any, b: any) => {
            if (a.legacy.tripId !== b.legacy.tripId) {
              return a.legacy.tripId - b.legacy.tripId;
            } else if (a.legacy.tripId === b.legacy.tripId) {
              return a.operationNum - b.operationNum;
            } else {
              return 0;
            }
          });
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
      initialSelection
    };
  }
});
</script>