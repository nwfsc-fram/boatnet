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
          <div class="w-full max-w-sm">
            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8" @submit.prevent>
              <label style="color: #027be3" for="startDate">
                Start Date
              </label>
              <p class="color: red" v-if="startErrorMessage">
                {{ startErrorMessage }}
              </p>
              <div class="flex w-full">
                <v-date-picker v-model="startDate" class="flex-grow" @input="inputDate('start')">
                  <template v-slot="{ inputValue, inputEvents }">
                    <input
                      id="startDate"
                      class="bg-white text-gray-700 w-full py-2 px-3 appearance-none border rounded-l focus:outline-none"
                      :value="inputValue"
                      v-on="inputEvents"
                    />
                  </template>
                </v-date-picker>
              </div>
              
            </form>
          </div>
        </div>

        <div style="display: inline-block" class="q-pa-md">
          <div class="w-full max-w-sm">
            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8" @submit.prevent>
              <label style="color: #027be3" for="endDate">
                End Date
              </label>
              <p class="color: red" v-if="endErrorMessage">
                {{ endErrorMessage }}
              </p>
              <div class="flex w-full">
                <v-date-picker v-model="endDate" class="flex-grow" @input="inputDate('end')">
                  <template v-slot="{ inputValue, inputEvents }">
                    <input
                      id="endDate"
                      class="bg-white text-gray-700 w-full py-2 px-3 appearance-none border rounded-l focus:outline-none"
                      :value="inputValue"
                      v-on="inputEvents"
                    />
                  </template>
                </v-date-picker>
              </div>
            </form>
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
import { createComponent, ref, watch } from '@vue/composition-api';
import Vue, { WatchOptions } from 'vue';
import { useAsync } from 'vue-async-function';
import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import { getTripsByDates } from '../helpers/getFields';

export default createComponent({
  props: {
    showDialog: Boolean,
    evaluationPeriod: Object,
    minDate: String,
    maxDate: String
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

    const startDate: any = ref(new Date());
    const endDate: any = ref(new Date());
    const formattedMinDate = ref(new Date());
    const formattedMaxDate = ref(new Date());
    const evalType = ref('');
    const startErrorMessage = ref('');
    const endErrorMessage = ref('');

    watch(() => props.showDialog, init, watcherOptions);

    async function init() {
      const evalPeriod = props.evaluationPeriod ? props.evaluationPeriod : {};
      formattedMinDate.value = props.minDate ? new Date(props.minDate) : new Date(1970, 1, 1);
      formattedMaxDate.value = props.maxDate ? new Date(props.maxDate) : new Date();
      if (evalPeriod.startDate) {
        startDate.value = evalPeriod.startDate ? new Date(evalPeriod.startDate) : new Date();
        endDate.value = evalPeriod.endDate ? new Date(evalPeriod.endDate) : new Date();
        evalType.value = evalPeriod.type;
      } else {
        startDate.value = new Date();
        endDate.value = new Date();
        evalType.value = '';
      }
      getTripsByDate();
    }

    async function getTripsByDate() {
      const observerId = state.debriefer.observer;
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
      const observerId = state.debriefer.observer;

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

    function isDateValid(currDate: any) {
      const formattedCurrDate = moment(currDate).format('MM/DD/YYYY HH:mm:ss');
      const isBefore = moment(formattedCurrDate).isBefore(props.minDate);
      if (isBefore) {
        return 'Must proceed prev eval period\n' + moment(props.minDate).format('MM/DD/YY');
      } else {
        return '';
      }
    }

    function inputDate(type: string) {
      if (type === 'start') {
        startErrorMessage.value = isDateValid(startDate.value);
        if (moment(startDate.value).isAfter(endDate.value)) {
          startErrorMessage.value = 'Start date must preceded end date';
        }
      } else {
        endErrorMessage.value = isDateValid(endDate.value);
        if (moment(endDate.value).isBefore(startDate.value)) {
          endErrorMessage.value = 'End Date must proceed start date';
        }
      }
      if (startErrorMessage.value.length === 0 && endErrorMessage.value.length === 0) {
        getTripsByDate();
      }
    }

    return {
      formattedMinDate,
      formattedMaxDate,
      startDate,
      endDate,
      evalType,
      columns,
      trips,
      pagination,
      save,
      defaultEvaluationPeriods,
      getTripsByDate,
      closeDialog,
      inputDate,
      startErrorMessage,
      endErrorMessage
    };
  }
});
</script>

<style>
body .p-inputtext {
  background-color: white !important;
}
</style>