<template>
    <q-dialog v-model="showDialog">
      <q-card style="width: 700px; max-width: 80vw; height: 800px">
        <q-card-section>
          <div class="text-h6" style="text-align: center">Evaluation Period</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            style="max-width: 200px"
            v-model="evalType"
            :options="defaultEvaluationPeriods"
            label="Type"
          />
          <div class="text-subtitle2" style="color: #027be3">Start/End Date:</div>
          <pCalendar
            v-model="dates"
            @date-select="getTrips"
            selectionMode="range"
          />

          <q-table
            class="q-mt-md"
            dense
            :data="trips"
            :columns="columns"
            :row-key="row => row.legacy.tripId"
            selection="multiple"
            :selected.sync="selected"
            :pagination.sync="pagination"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Save" @click="save" />
          <q-btn flat label="Close" @click="closeDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  onMounted,
  toRefs
} from '@vue/composition-api';
import Vue from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useAsync } from 'vue-async-function';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import moment from 'moment';
import { get } from 'lodash';

export default createComponent({
  props: {
    showDialog: Boolean
  },

  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;
    const currEvalPeriod: any = ref(state.debriefer.evaluationPeriod);

    const observerId = state.debriefer.observers;
    const evalType: any = ref('');
    const dates: any = ref([]);
    const selected: any = ref([]);
    const trips: any = ref([]);

    const defaultEvaluationPeriods: any = ref([]);
    const pagination = { rowsPerPage: 15 };
    const columns = [
      {
        name: 'tripNum',
        label: 'Trip #',
        align: 'left',
        sortable: true,
        field: (row: any) => row.legacy.tripId
      },
      {
        name: 'vessel',
        label: 'Vessel',
        align: 'left',
        sortable: true,
        field: (row: any) => row.vessel.vesselName
      },
      {
        name: 'startDate',
        label: 'Start Date',
        align: 'left',
        sortable: true,
        field: 'departureDate'
      },
      {
        name: 'endDate',
        label: 'End Date',
        align: 'left',
        sortable: true,
        field: 'returnDate'
      }
    ];

    async function getEvaluationPeriodLookups() {
      const lookupsList: string[] = [];
      const queryOptions = {
        key: 'evaluation-period-type',
        include_docs: true,
        reduce: false
      };

      try {
        const lookupVals: any = await masterDB.view(
          'obs_web',
          'all_doc_types',
          queryOptions
        );
        for (const lookup of lookupVals.rows) {
          lookupsList.push(lookup.doc.description);
        }
        defaultEvaluationPeriods.value = lookupsList;
      } catch (err) {
        console.log('error');
      }
    }
    useAsync(getEvaluationPeriodLookups);

    async function getTrips() {
      if (dates.value[0] && dates.value[1]) {
        const tripsHolder: any[] = [];
        try {
            const tripDocs: any = await masterDB.viewWithDocs(
            'obs_web',
            'wcgop_trips_by_observerId',
            { key: observerId }
            );
            for (const trip of tripDocs.rows) {
                if (moment(trip.doc.departureDate).isAfter(dates.value[0].toString())
                    && moment(trip.doc.returnDate).isBefore(dates.value[1].toString())) {
                        tripsHolder.push(trip.doc);
                }
            }
            trips.value = tripsHolder;
        } catch (err) {
            console.log('could not get trips');
        }
      }
    }

    function save() {
      closeDialog();
      const tripIds: number[] = [];
      for (const val of selected.value) {
        tripIds.push(val._id);
      }
      const evalPeriod = {
        startDate: dates.value[0].toString(),
        endDate: dates.value[1].toString(),
        type: 'observer-evaluation-periods',
        evalType: evalType.value,
        observer: observerId,
        debriefer: state.user.activeUserAlias.personDocId,
        tripIds
      };
      if (currEvalPeriod.value && currEvalPeriod.value.id) {
        masterDB.put(currEvalPeriod.value.id, evalPeriod, currEvalPeriod.value.rev);
      } else {
        masterDB.post(evalPeriod);
      }
      store.dispatch('debriefer/updateEvaluationPeriod', evalPeriod);
      context.emit('update:showDialog', false);
    }

    function closeDialog() {
      context.emit('update:showDialog', false);
    }

    return {
      currEvalPeriod,
      dates,
      evalType,
      columns,
      selected,
      trips,
      pagination,
      save,
      defaultEvaluationPeriods,
      getTrips,
      closeDialog
    };
  }
});
</script>

<style>
body .p-inputtext {
  background-color: white !important;
}
</style>