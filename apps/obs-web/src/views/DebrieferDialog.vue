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
            v-model="startDate"
            @date-select="getTripsByDate"
          />
          <pCalendar
            v-model="endDate"
            @date-select="getTripsByDate"
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
  watch
} from '@vue/composition-api';
import Vue, { WatchOptions } from 'vue';
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
    showDialog: Boolean,
    evaluationPeriod: Object
  },

  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const observerId = state.debriefer.observers;
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

    const startDate = computed({
      get: () => {
        const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
        const start = evalPeriod.startDate ? new Date(evalPeriod.startDate) : new Date();
        return start;
      },
      set: (val) => {
        const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
        evalPeriod.startDate = new Date(val);
        context.emit('update:evaluationPeriod', evalPeriod);
      }
    });

    const endDate = computed({
      get: () => {
        const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
        const end = evalPeriod.endDate ? new Date(evalPeriod.endDate) : new Date();
        return end;
      },
      set: (val) => {
        const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
        evalPeriod.endDate = new Date(val);
        context.emit('update:evaluationPeriod', evalPeriod);
      }
    });

    const evalType = computed({
      get: () => {
        const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
        return evalPeriod.value;
      },
      set: (val) => {
        const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
        evalPeriod.value = val;
        context.emit('update:evaluationPeriod', evalPeriod);
      }
    });

    async function initTrips() {
      const tripsHolder: any[] = [];
      const tripIds = props.evaluationPeriod && props.evaluationPeriod.tripIds ? props.evaluationPeriod.tripIds : [];
      if (tripIds.length > 0) {
        try {
          const options: ListOptions = {
            keys: props.evaluationPeriod ? props.evaluationPeriod.tripIds : []
          };
          const tripDocs = await masterDB.listWithDocs(options);
          for (const trip of tripDocs.rows) {
            tripsHolder.push(trip);
          }
        } catch (err) {
          console.log('could not get trips');
        }
      }
      trips.value = tripsHolder;
    }

    const watcherOptions: WatchOptions = {
      immediate: true
    };

    watch(() => props.evaluationPeriod && props.evaluationPeriod.tripIds ? props.evaluationPeriod.tripIds : [], initTrips, watcherOptions);

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
        lookupsList.sort((a: any, b: any) => {
          if (a > b) {
            return 1;
          }
          if (b > a) {
           return -1;
          }
          return 0;
        });
        defaultEvaluationPeriods.value = lookupsList;
      } catch (err) {
        console.log('error');
      }
    }
    useAsync(getEvaluationPeriodLookups);

    async function getTripsByDate() {
      if (startDate.value && endDate.value) {
        const tripsHolder: any[] = [];
        try {
            const tripDocs: any = await masterDB.viewWithDocs(
            'obs_web',
            'wcgop_trips_by_observerId',
            { key: observerId }
            );
            for (const trip of tripDocs.rows) {
                if (moment(trip.doc.departureDate).isAfter(startDate.value.toString())
                    && moment(trip.doc.returnDate).isBefore(endDate.value.toString())) {
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
      const tripIds: number[] = [];
      for (const val of selected.value) {
        tripIds.push(val._id);
      }

      const curr = props.evaluationPeriod ? props.evaluationPeriod : {};
      const evalPeriod = {
        id: curr.id,
        rev: curr.rev,
        type: 'observer-evaluation-periods',
        observer: observerId,
        debriefer: state.user.activeUserAlias.personDocId,
        evalType: curr.value,
        startDate: curr.startDate,
        endDate: curr.endDate,
        tripIds
      };

      if (evalPeriod && evalPeriod.id) {
        masterDB.put(evalPeriod.id, evalPeriod, evalPeriod.rev).then((response: any) => {
          update(evalPeriod, response);
        });
      } else {
        masterDB.post(evalPeriod).then((response: any) => {
          update(evalPeriod, response);
        });
      }
      closeDialog();
    }

    function update(evalPeriod: any, response: any) {
      evalPeriod._id = response.id;
      evalPeriod._rev = response.rev;
      store.dispatch('debriefer/updateEvaluationPeriod', evalPeriod);
      selected.value = [];
      context.emit('closeEvalDialog');
    }

    function closeDialog() {
      context.emit('update:showDialog', false);
    }

    return {
      startDate,
      endDate,
      evalType,
      columns,
      selected,
      trips,
      pagination,
      save,
      defaultEvaluationPeriods,
      getTripsByDate,
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