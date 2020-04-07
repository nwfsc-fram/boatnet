<template>
  <div>
    <div class="q-pa-md" style="float:left">
      <div>Program</div>
      <q-btn-toggle
        v-model="program"
        toggle-color="primary"
        :options="[
            {label: 'WCGOP', value: 'wcgop'},
            {label: 'A-SHOP', value: 'ashop'}
          ]"
      />
    </div>
    <div v-if="program === 'wcgop'">
      <div class="q-pa-md" style="float:left; width:35%">
        <q-select
          use-input
          style="display: inline-block; width: 60%"
          v-model="observer"
          :options="observerList"
          label="Observer"
          @input="selectObserver"
          @filter="filterLookups"
          fill-input
          hide-selected
        />
        <q-toggle
          class="q-ma-sm"
          style="display: inline-block"
          label="Show All"
          v-model="showAll"
          @input="getWcgopObservers()"
        />
      </div>
      <div class="q-pa-md">
        <q-select
          style="display: inline-block; width: 25%"
          :disable="observer === '' ? true : false"
          v-model="evaluationPeriod"
          :options="evaluations"
          label="Previous Eval Periods"
          @input="getTripsByDate"
        />
        <q-btn
          round
          :disable="observer === '' ? true : false"
          class="q-ma-xs"
          style="display: inline-block"
          color="white"
          text-color="black"
          icon="add"
          @click="add"
        />
        <q-btn
          round
          :disable="observer === '' ? true : false"
          class="q-ma-xs"
          style="display: inline-block"
          color="white"
          text-color="black"
          icon="edit"
          @click="edit"
        />
        <q-btn
          round
          :disable="observer === '' ? true : false"
          class="q-ma-xs"
          style="display: inline-block"
          color="white"
          text-color="black"
          icon="delete"
          @click="showDeleteDialog = true"
        />
      </div>
    </div>
    <div v-else>
      <q-select
        use-input
        class="q-pa-md"
        style="display: inline-block; width: 25%"
        v-model="cruiseId"
        :options="cruiseIdList"
        label="Cruise Id"
        @filter="filterLookups"
        @input="selectCruise"
        fill-input
        hide-selected
      />
      <q-btn
        round
        class="q-ma-xs"
        style="display: inline-block"
        color="white"
        text-color="black"
        icon="edit"
        @click="editCruise"
      />
      <div class="q-pa-md" style="display: inline-block; width: 20%">
        <b>Observer:</b>
        <div>{{ observers }}</div>
      </div>
      <div class="q-pa-md" style="display: inline-block; width: 10%">
        <b>Vessel Name:</b>
        <div>{{ vesselName }}</div>
      </div>
      <div class="q-pa-md" style="display: inline-block; width: 10%">
        <b>Start Date:</b>
        <div>{{ cruiseStartDate }}</div>
      </div>
      <div class="q-pa-md" style="display: inline-block; width: 10%">
        <b>End Date:</b>
        <div>{{ cruiseEndDate }}</div>
      </div>
    </div>

    <app-debriefer-dialog
      :showDialog.sync="showEvaluationDialog"
      :evaluationPeriod="dialogEvalPeriod"
      @closeEvalDialog="closeEvalDialog"
    />

    <app-cruise-dialog :showDialog.sync="showCruiseDialog" :cruise="cruise" />

    <boatnet-input-dialog title="Delete Confirmation" :show.sync="showDeleteDialog" @save="deleteEvalPeriod()">
      <div>Delete evaluation period: <b>{{ evaluationPeriod.label }}</b>?</div>
    </boatnet-input-dialog>

    <TabView class="q-ma-md">
      <TabPanel header="Data" :active="activeTab === 'data'">
        <app-debriefer-wcgop-data v-if="program === 'wcgop'" />
        <app-debriefer-ashop-data v-else />
      </TabPanel>
      <TabPanel header="Errors" :active="activeTab === 'qa'">
        <app-debriefer-errors :showData="activeTab === 'qa' ? false : true" />
      </TabPanel>
      <TabPanel header="Summary" :active="activeTab === 'summary'">Summary</TabPanel>
      <TabPanel header="Assessment" :active="activeTab === 'assessment'">Assessment</TabPanel>
    </TabView>
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
import { PersonAlias, AshopCruise } from '@boatnet/bn-models';
import { findIndex } from 'lodash';

Vue.component('TabPanel', TabPanel);
Vue.component('TabView', TabView);
Vue.component('DataTable', DataTable);
Vue.component('Column', Column);

export default createComponent({
  props: {
    activeTab: String
  },

  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;

    const observer: any = ref('');
    const showAll: any = ref(false);

    let observerFilterList: any[] = [];
    const observerList: any = ref([]);
    const evaluations: any = ref([]);

    const showEvaluationDialog: any = ref(false);
    const showCruiseDialog: any = ref(false);
    const masterDB: Client<any> = couchService.masterDB;

    const dialogEvalPeriod = ref({});

    const cruiseId: any = ref('');
    const cruise: AshopCruise = ref({});
    const cruiseIdList: any = ref([]);
    let cruiseIdFilterList: any[] = [];
    const showDeleteDialog: any = ref(false);

    const cruiseStartDate = computed(() =>
      cruise.value && cruise.value.startDate
        ? moment(cruise.value.startDate).format('MM/DD/YYYY')
        : ''
    );
    const cruiseEndDate = computed(() =>
      cruise.value && cruise.value.endDate
        ? moment(cruise.value.endDate).format('MM/DD/YYYY')
        : ''
    );
    const vesselName = computed(() =>
      cruise.value && cruise.value.vessel && cruise.value.vessel.vesselName
        ? cruise.value.vessel.vesselName
        : ''
    );

    const observers = computed({
      get: () => {
        let names = '';
        const length = cruise.value.observers
          ? cruise.value.observers.length
          : 0;
        for (let i = 0; i < length; i++) {
          names +=
            cruise.value.observers[i].firstName +
            ' ' +
            cruise.value.observers[i].lastName;
          if (i < length - 1) {
            names += ', ';
          }
        }
        return names;
      },
      set: (id) => undefined
    });

    const program = computed({
      get: () => {
        let mode: string = state.debriefer.program;
        if (!mode) {
          mode = 'wcgop';
          store.dispatch('debriefer/updateProgram', mode);
        }
        return mode;
      },
      set: (val) => {
        store.dispatch('debriefer/updateProgram', val);
      }
    });

    const evaluationPeriod = computed({
      get: () => {
        return state.debriefer.evaluationPeriod;
      },
      set: (val) => {
        store.dispatch('debriefer/updateEvaluationPeriod', val);
        store.dispatch('debriefer/setTripIds', val.tripIds);
      }
    });

    function filterLookups(val: any, update: any) {
      update(() => {
        const needle = val.toLowerCase();
        if (state.debriefer.program === 'wcgop') {
          observerList.value = observerFilterList.filter(
            (v: any) =>
              v.label
                .toString()
                .toLowerCase()
                .indexOf(needle) > -1
          );
        } else {
          cruiseIdList.value = cruiseIdFilterList.filter(
            (v: any) =>
              v.label
                .toString()
                .toLowerCase()
                .indexOf(needle) > -1
          );
        }
      });
    }

    async function getWcgopObservers() {
      const queryOptions: ListOptions = {};
      if (!showAll.value) {
        queryOptions.key = state.user.activeUserAlias.personDocId; // setting debrieferId
      }
      observerList.value = await getLookups(
        'all_wcgop_observers',
        'value',
        'id',
        queryOptions
      );
      observerFilterList = observerList.value;
    }
    useAsync(getWcgopObservers);

    async function getCruiseIds() {
      cruiseIdList.value = await getLookups('ashop_cruise', 'key', 'key', {});
      cruiseIdFilterList = cruiseIdList.value;
    }
    useAsync(getCruiseIds);

    async function getLookups(
      view: string,
      label: string,
      value: string,
      queryOptions: any
    ) {
      const lookupVals: any[] = [];
      try {
        const results = await masterDB
          .view<any>('obs_web', view, queryOptions)
          .then((response: any) => {
            for (const row of response.rows) {
              lookupVals.push({ label: row[label], value: row[value] });
            }
            lookupVals.sort((a: any, b: any) => {
              if (a.label > b.label) {
                return 1;
              }
              if (b.label > a.label) {
                return -1;
              }
              return 0;
            });
          });
        return lookupVals;
      } catch (err) {
        console.log(err);
      }
    }

    async function getTripsByDate(evalPeriod: any) {
      const tripIds: any[] = [];
      try {
        const tripDocs: any = await masterDB.viewWithDocs(
          'obs_web',
          'wcgop_trips_by_observerId',
          { key: evalPeriod.observer }
        );
        for (const trip of tripDocs.rows) {
          if (
            moment(trip.doc.departureDate).isAfter(
              evalPeriod.startDate.toString()
            ) &&
            moment(trip.doc.returnDate).isBefore(
              evalPeriod.endDate.toString()
            )
          ) {
            tripIds.push(trip.id);
          }
        }
        store.dispatch('debriefer/setTripIds', tripIds);
      } catch (err) {
        console.log('could not get trips from evaluation period');
      }
    }

    async function selectObserver() {
      store.dispatch('debriefer/updateObservers', observer.value.value);
      evaluationPeriod.value = {};
      await getEvaluationPeriods();
    }

    async function selectCruise() {
      store.dispatch('debriefer/setCruiseIds', cruiseId.value.value);
      try {
        const results = await masterDB.viewWithDocs<any>(
          'obs_web',
          'ashop_cruise',
          { key: cruiseId.value.value }
        );
        if (results.rows[0] && results.rows[0].doc) {
          cruise.value = results.rows[0].doc;
          store.dispatch('debriefer/setTripIds', results.rows[0].doc.trips);
        } else {
          cruise.value = {};
          store.dispatch('debriefer/setTripIds', []);
        }
      } catch (err) {
        store.dispatch('debriefer/setTripIds', []);
        console.log(err);
      }
    }

    async function closeEvalDialog() {
      evaluationPeriod.value = formatEvaluationPeriod(evaluationPeriod.value);
      await getEvaluationPeriods();
    }

    function formatDate(date: string) {
      return moment(date).format('MM/DD/YYYY');
    }

    function formatEvaluationPeriod(evalPeriod: any) {
      const startDate = moment(evalPeriod.startDate).format('MM/DD/YY');
      const endDate = moment(evalPeriod.endDate).format('MM/DD/YY');
      return {
        id: evalPeriod._id,
        rev: evalPeriod._rev,
        label: evalPeriod.evalType + ' ' + startDate + '-' + endDate,
        value: evalPeriod.evalType,
        tripIds: evalPeriod.tripIds,
        startDate: evalPeriod.startDate,
        endDate: evalPeriod.endDate,
        observer: evalPeriod.observer,
        debriefer: evalPeriod.debriefer
      };
    }

    async function getEvaluationPeriods() {
      const evaluationPeriods: any[] = [];
      const debrieferId = state.user.activeUserAlias.personDocId;
      let results: any;
      try {
        results = await masterDB
          .viewWithDocs<any>('obs_web', 'evaluation_periods', {
            key: observer.value.value
          })
          .then((response: any) => {
            for (const row of response.rows) {
              if (row.doc.debriefer === debrieferId) {
                const startDate = moment(row.doc.startDate).format('MM/DD/YY');
                const endDate = moment(row.doc.endDate).format('MM/DD/YY');
                const formattedVal = formatEvaluationPeriod(row.doc);
                evaluationPeriods.push(formattedVal);
              }
            }
            evaluations.value = evaluationPeriods;
          });
      } catch (err) {
        console.log(err);
      }
    }

    useAsync(getEvaluationPeriods);

    function add() {
      dialogEvalPeriod.value = {
        value: '',
        startDate: '',
        endDate: '',
        tripIds: []
      };
      showEvaluationDialog.value = true;
    }

    function edit() {
      dialogEvalPeriod.value = evaluationPeriod.value;
      showEvaluationDialog.value = true;
    }

    function deleteEvalPeriod() {
      const id = evaluationPeriod.value.id;
      const index = findIndex(evaluations.value, { id });
      evaluations.value.splice(index, 1);
      masterDB.delete(id, evaluationPeriod.value.rev);
      evaluationPeriod.value = {};
      store.dispatch('debriefer/setTripIds', []);
    }

    function editCruise() {
      showCruiseDialog.value = true;
    }

    return {
      program,
      observer,
      evaluationPeriod,
      dialogEvalPeriod,
      closeEvalDialog,
      observerList,
      evaluations,
      observers,
      vesselName,
      cruiseStartDate,
      cruiseEndDate,
      cruise,
      selectCruise,
      cruiseIdList,
      cruiseId,
      selectObserver,
      showCruiseDialog,
      showEvaluationDialog,
      showAll,
      getWcgopObservers,
      filterLookups,
      add,
      edit,
      deleteEvalPeriod,
      editCruise,
      getTripsByDate,
      showDeleteDialog
    };
  }
});
</script>
