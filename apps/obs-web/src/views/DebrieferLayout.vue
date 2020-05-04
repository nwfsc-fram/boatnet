<template>
  <div>
    <div class="q-pl-md q-pt-md q-pr-md" style="float:left">
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
      <div class="q-pt-md">
        <debriefer-select-comp
          label="Observer"
          style="display: inline-block"
          :val.sync="observer"
          lookupView="all_wcgop_observers"
          lookupLabel="value"
          lookupValue="id"
          :lookupQueryOptions="observerQueryOptions"
          @select="selectObserver"
        />
        <q-toggle
          class="q-px-md"
          style="display: inline-block"
          label="Show All"
          v-model="showAll"
        />
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
          class="q-mx-xs"
          style="display: inline-block"
          color="white"
          text-color="black"
          icon="add"
          @click="add"
        />
        <q-btn
          round
          :disable="observer === '' ? true : false"
          class="q-mx-xs"
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
      <div>
        <q-expansion-item
          style="width: 25%"
          expand-separator
          class="q-pl-md text-primary"
          icon="filter_list"
          label="Additional Filters"
          default-closed
        >
          <div class="q-pl-md">
            <debriefer-select-comp
              label="Trip Id"
              :val.sync="tripId"
              lookupView="wcgop_trips_by_observerId"
              lookupLabel="value"
              lookupValue="id"
              :lookupQueryOptions="{}"
              @select="selectTripId"
            />
          </div>
        </q-expansion-item>
      </div>
    </div>
    <div v-else>
      <debriefer-select-comp
        class="q-pa-md"
        style="display: inline-block; width: 25%"
        label="Cruise Id"
        :val.sync="cruiseId"
        lookupView="ashop_cruise"
        lookupLabel="key"
        lookupValue="key"
        :lookupQueryOptions="{}"
        @select="selectCruise"
      />
      <q-btn
        round
        class="q-ma-xs"
        style="display: inline-block"
        color="white"
        text-color="black"
        icon="edit"
        @click="showCruiseDialog = true"
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
      :minDate="minDate"
      @closeEvalDialog="closeEvalDialog"
    />

    <app-cruise-dialog :showDialog.sync="showCruiseDialog" :cruise="cruise" />

    <boatnet-input-dialog
      :settings="deleteDialogSettings"
      :show.sync="showDeleteDialog"
      @save="deleteEvalPeriod()"
    >
      <div>
        Delete evaluation period:
        <b>{{ evaluationPeriod.label }}</b>?
      </div>
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
import { getTripsByDates } from '../helpers/getFields';
import DebrieferSelectComp from './DebrieferSelectComp.vue';

Vue.component('DebrieferSelectComp', DebrieferSelectComp);
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
    const masterDB: Client<any> = couchService.masterDB;

    const observer: any = ref({});
    const showAll: any = ref(false);

    const evaluations: any = ref([]);
    const evaluationPeriod: any = ref({});
    const tripId: any = ref({});

    const minDate: any = ref('');

    const cruiseId: any = ref({});
    const cruise: AshopCruise = ref({});

    const showEvaluationDialog: any = ref(false);
    const showCruiseDialog: any = ref(false);
    const showDeleteDialog: any = ref(false);
    const dialogEvalPeriod = ref({});

    const deleteDialogSettings = {
      title: 'Confirm Delete',
      width: 600,
      height: 200,
      confirmationLabel: 'Yes'
    }

    function clearFilters() {
      store.dispatch('debriefer/updateTrips', []);
      store.dispatch('debriefer/updateOperations', []);
    }
    clearFilters()

    const observerQueryOptions = computed(() => {
      const queryOptions: ListOptions = {};
      if (!showAll.value) {
        queryOptions.key = state.user.activeUserAlias.personDocId; // setting debrieferId
      }
      return queryOptions;
    });

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

    function clearData() {
      store.dispatch('debriefer/setTripIds', []);
    }
    clearData();

    async function getTripsByDate(evalPeriod: any) {
      store.dispatch('debriefer/updateEvaluationPeriod', evalPeriod);
      store.dispatch('debriefer/updateTrips', []);
      store.dispatch('debriefer/updateOperations', []);
      const tripIds: any[] = [];
      const trips: any = await getTripsByDates(
        new Date(evalPeriod.startDate),
        new Date(evalPeriod.endDate),
        evalPeriod.observer
      );
      for (const trip of trips) {
        tripIds.push(trip._id);
      }
      store.dispatch('debriefer/setTripIds', tripIds);
    }

    async function selectObserver(id: string) {
      clearData();
      store.dispatch('debriefer/updateObservers', id);
      evaluationPeriod.value = {};
      await getEvaluationPeriods(id);
    }

    async function selectCruise(id: string) {
      store.dispatch('debriefer/setCruiseIds', id);
      try {
        const results = await masterDB.viewWithDocs<any>(
          'obs_web',
          'ashop_cruise',
          { key: id }
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

    function selectTripId(id: string) {
      store.dispatch('debriefer/setTripIds', [id]);
    }

    async function closeEvalDialog(evalPeriod: any) {
      evaluationPeriod.value = formatEvaluationPeriod(evalPeriod);
      await getEvaluationPeriods(observer.value.value);
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

    async function getEvaluationPeriods(id: string) {
      const evaluationPeriods: any[] = [];
      let results: any;
      try {
        results = await masterDB
          .viewWithDocs<any>('obs_web', 'evaluation_periods', {
            key: id
          })
          .then((response: any) => {
            for (const row of response.rows) {
              const formattedVal = formatEvaluationPeriod(row.doc);
              evaluationPeriods.push(formattedVal);
            }
            evaluationPeriods.sort((a: any, b: any) => {
              if (moment(a.startDate).isBefore(b.startDate)) {
                return 1;
              } else if (moment(a.startDate).isAfter(b.startDate)) {
                return -1;
              } else {
                return 0;
              }
            });
            evaluations.value = evaluationPeriods;
          });
      } catch (err) {
        console.log(err);
      }
    }

    useAsync(getEvaluationPeriods(observer.value.value));

    function add() {
      dialogEvalPeriod.value = {};
      showEvaluationDialog.value = true;
      const date: any = moment(evaluations.value[0].endDate).add(1, 'days');
      minDate.value = date.toString();
    }

    function edit() {
      dialogEvalPeriod.value = evaluationPeriod.value;
      showEvaluationDialog.value = true;
      const index = findIndex(evaluations.value, { id: evaluationPeriod.value.id });
      if (evaluations.value[index + 1]) {
        minDate.value = moment(evaluations.value[index + 1].endDate).add(1, 'days').toString();
      } else {
        minDate.value = null;
      }
    }

    function deleteEvalPeriod() {
      const id = evaluationPeriod.value.id;
      const index = findIndex(evaluations.value, { id });
      evaluations.value.splice(index, 1);
      masterDB.delete(id, evaluationPeriod.value.rev);
      evaluationPeriod.value = {};
      store.dispatch('debriefer/updateEvaluationPeriod', {});
      clearData();
    }

    return {
      program,
      observer,
      observerQueryOptions,
      selectObserver,
      showAll,
      evaluations,
      evaluationPeriod,
      minDate,
      add,
      edit,
      deleteEvalPeriod,
      dialogEvalPeriod,
      closeEvalDialog,
      tripId,
      selectTripId,
      getTripsByDate,
      cruiseId,
      cruise,
      observers,
      vesselName,
      cruiseStartDate,
      cruiseEndDate,
      selectCruise,
      showEvaluationDialog,
      showCruiseDialog,
      showDeleteDialog,
      deleteDialogSettings
    };
  }
});
</script>
