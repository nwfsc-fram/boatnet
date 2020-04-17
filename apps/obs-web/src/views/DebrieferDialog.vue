<template>
  <q-dialog v-model="showDialog">
    <q-card style="width: 800px; max-width: 80vw; height: 800px">
      <q-card-section>
        <div class="text-h6" style="text-align: center">Evaluation Period</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select
          class="q-pa-md"
          style="width: 200px; display: inline-block"
          v-model="evalType"
          :options="defaultEvaluationPeriods"
          label="Type"
        />
        <div style="display: inline-block" class="q-pa-md">
          <div class="p-float-label q-px-md">
            <pCalendar v-model="startDate" id="startDate" @date-select="getTripsByDate" :minDate="formattedMinDate" />
            <label for="startDate" style="color: #027be3">Start Date</label>
          </div>
        </div>
        <div style="display: inline-block" class="q-pa-md">
          <div class="p-float-label">
            <pCalendar v-model="endDate" id="endDate" @date-select="getTripsByDate" :minDate="formattedMinDate" />
            <label for="endDate" style="color: #027be3">End Date</label>
          </div>
        </div>

        <q-table
          class="q-mt-md"
          dense
          :data="trips"
          :columns="columns"
          :row-key="row => row.legacy.tripId"
          :pagination.sync="pagination"
        ></q-table>
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
import { getTripsByDates } from '../helpers/getFields';

export default createComponent({
  props: {
    showDialog: Boolean,
    evaluationPeriod: Object,
    minDate: String
  },

  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const trips: any = ref([]);

    const defaultEvaluationPeriods: any = ref([]);
    const pagination = { rowsPerPage: 12 };

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
        field: 'departureDate',
        format: (val: any) => moment(val).format('MM/DD/YYYY HH:mm:ss')
      },
      {
        name: 'endDate',
        label: 'End Date',
        align: 'left',
        sortable: true,
        field: 'returnDate',
        format: (val: any) => moment(val).format('MM/DD/YYYY HH:mm:ss')
      }
    ];

    const watcherOptions: WatchOptions = {
      immediate: true
    };

    watch(() => props.showDialog, init, watcherOptions);

    const startDate: any = ref(new Date());
    const endDate = ref(new Date());
    const formattedMinDate = ref(new Date());
    const evalType = ref('');

    async function init() {
      const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
      formattedMinDate.value = props.minDate ? new Date(props.minDate) : null;
      if (evalPeriod.startDate) {
        startDate.value = evalPeriod.startDate ? new Date(evalPeriod.startDate) : new Date();
        endDate.value = evalPeriod.endDate ? new Date(evalPeriod.endDate) : new Date();
        evalType.value = evalPeriod.value;
      } else {
        startDate.value = new Date();
        endDate.value = new Date();
        evalType.value = '';
      }
      getTripsByDate();
    }

    async function getTripsByDate() {
      const observerId = state.debriefer.observers;
      trips.value = await getTripsByDates(startDate.value, endDate.value, observerId);
    }

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

    function save() {
      const observerId = state.debriefer.observers;
      const tripIds: number[] = [];
      for (const val of trips.value) {
        tripIds.push(val._id);
      }

      const curr = props.evaluationPeriod ? props.evaluationPeriod : {};
      const evalPeriod = {
        id: curr.id,
        rev: curr.rev,
        type: 'observer-evaluation-periods',
        observer: observerId,
        debriefer: state.user.activeUserAlias.personDocId,
        evalType: evalType.value,
        startDate: startDate.value,
        endDate: endDate.value
      };

      if (evalPeriod && evalPeriod.id) {
        masterDB
          .put(evalPeriod.id, evalPeriod, evalPeriod.rev)
          .then((response: any) => {
            updateStateIdAndRev(evalPeriod, response);
          });
      } else {
        masterDB.post(evalPeriod).then((response: any) => {
          updateStateIdAndRev(evalPeriod, response);
        });
      }
      store.dispatch('debriefer/updateEvaluationPeriod', evalPeriod);
      store.dispatch('debriefer/setTripIds', tripIds);
      closeDialog();
    }

    function updateStateIdAndRev(evalPeriod: any, response: any) {
      evalPeriod._id = response.id;
      evalPeriod._rev = response.rev;
      store.dispatch('debriefer/updateEvaluationPeriod', evalPeriod);
      context.emit('closeEvalDialog', evalPeriod);
    }

    function closeDialog() {
      context.emit('update:showDialog', false);
    }

    return {
      formattedMinDate,
      startDate,
      endDate,
      evalType,
      columns,
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