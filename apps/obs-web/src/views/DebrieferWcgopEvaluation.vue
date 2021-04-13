<template>
  <div>
    <div>
      <debriefer-select-comp
        v-if="!observerMode"
        label="Observer"
        style="display: inline-block; width: 30%"
        :val.sync="observer"
        lookupView="all_wcgop_observers"
        lookupLabel="value"
        lookupValue="id"
        :lookupQueryOptions="observerQueryOptions"
        @select="selectObserver"
      />
      <q-toggle v-if="!observerMode" class="q-px-md" style="display: inline-block" label="Show All" v-model="showAll" />
      <q-select
        style="display: inline-block; width: 40%"
        v-model="evaluationPeriod"
        :options="evaluations"
        label="Evaluation Period"
        use-input
        hide-selected
        fill-input
        @filter="filterFn"
        @input="getTripsByDate"
      />
      <span v-if="!observerMode">
        <div style="display: inline-block">
          <q-btn
            round
            class="q-mx-xs"
            style="display: inline-block"
            color="white"
            text-color="black"
            icon="add"
            :disable="observer.length === 0"
            @click="add"
          />
          <q-tooltip v-if="observer.length === 0">
            An observer must be selected to create an eval period
          </q-tooltip>
        </div>
        <div style="display: inline-block">
          <q-btn
            round
            class="q-mx-xs"
            style="display: inline-block"
            color="white"
            text-color="black"
            icon="edit"
            :disable="evaluationPeriod === undefined"
            @click="edit"
          />
          <q-tooltip v-if="evaluationPeriod === undefined">
            No evaluation period selected to edit
          </q-tooltip>
        </div>
        <div style="display: inline-block">
          <q-btn
            round
            class="q-ma-xs"
            style="display: inline-block"
            color="white"
            text-color="black"
            icon="delete"
            :disable="evaluationPeriod === undefined"
            @click="showDeleteDialog = true"
          />
          <q-tooltip v-if="evaluationPeriod === undefined">
            No evaluation period selected to delete
          </q-tooltip>
        </div>
      </span>
    </div>

    <app-debriefer-dialog
      :showDialog.sync="showEvaluationDialog"
      :evaluationPeriod="dialogEvalPeriod"
      :minDate="minDate"
      :maxDate="maxDate"
      @closeEvalDialog="closeEvalDialog"
    />

    <boatnet-input-dialog
      :settings="deleteDialogSettings"
      :show.sync="showDeleteDialog"
      @save="deleteEvalPeriod()"
    >
      <div>
        Delete evaluation period:
        <b>{{ evaluationPeriod ? evaluationPeriod.label : '' }}</b>?
      </div>
    </boatnet-input-dialog>
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  onMounted
} from '@vue/composition-api';
import Vue from 'vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Panel from 'primevue/panel';

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Fieldset from 'primevue/fieldset';
import { useAsync } from 'vue-async-function';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions, FindOptions } from 'davenport';

import moment from 'moment';
import { PersonAlias, AshopCruise } from '@boatnet/bn-models';
import { filter, findIndex } from 'lodash';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';
import { getTripsByDates, getTripsByObserverId } from '../helpers/getFields';

Vue.component('multiselect', Multiselect);
Vue.component('Accordion', Accordion);
Vue.component('Accordion', AccordionTab);
Vue.component('Panel', Panel);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);
Vue.component('TabPanel', TabPanel);
Vue.component('TabView', TabView);
Vue.component('DataTable', DataTable);
Vue.component('Column', Column);
Vue.component('Fieldset', Fieldset);

export default createComponent({
  props: {
    activeTab: String
  },

  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const observer: any = ref('');
    const showAll: any = ref(false);

    const evaluations: any = ref([]);
    const evaluationPeriod: any = ref();

    const minDate: any = ref('');
    const maxDate: any = ref('');

    const showEvaluationDialog: any = ref(false);
    const showDeleteDialog: any = ref(false);
    const dialogEvalPeriod = ref({});

    const observerMode = !state.user.userRoles.includes('debriefer') || state.user.observerMode;

    const deleteDialogSettings = {
      title: 'Confirm Delete',
      width: 600,
      height: 200,
      confirmationLabel: 'Yes'
    };

    function clearFilters() {
      store.dispatch('debriefer/updateSelectedTrips', []);
      store.dispatch('debriefer/updateOperations', []);
      store.dispatch('debriefer/updateSelectedOperations', []);
      store.dispatch('debriefer/updateFilters', {});
      store.dispatch('debriefer/updateBiospecimens', []);
      store.dispatch('debriefer/updateCatches', []);
      store.dispatch('debriefer/updateSummarySelection', {});
      state.debriefer.selectedTrips.splice(0, state.debriefer.selectedTrips.length);
      state.debriefer.operations.splice(0, state.debriefer.operations.length);
    }
    clearFilters();

    const observerQueryOptions = computed(() => {
      const queryOptions: ListOptions = {};
      if (!showAll.value) {
        queryOptions.key = state.user.activeUserAlias.personDocId; // setting debrieferId
      }
      return queryOptions;
    });

    async function getTripsByDate(evalPeriod: any) {
      if (evalPeriod) {
        store.dispatch('debriefer/updateEvaluationPeriod', evalPeriod);
        clearFilters();
      } else {
        store.dispatch('debriefer/updateEvaluationPeriod', {});
      }
      const trips = await getTripsByDates(
        new Date(evalPeriod.startDate),
        new Date(evalPeriod.endDate),
        observer.value
      );
      store.dispatch('debriefer/updateTrips', trips);
    }

    async function selectObserver(id: string) {
      store.dispatch('debriefer/updateEvaluationPeriod', {});
      clearFilters();
      store.dispatch('debriefer/updateObserver', id);
      evaluationPeriod.value = undefined;
      await getEvaluationPeriods(id);
      const trips = await getTripsByObserverId(id);
      store.dispatch('debriefer/updateTrips', trips);
    }

    async function closeEvalDialog(evalPeriod: any) {
      evaluationPeriod.value = formatEvaluationPeriod(evalPeriod);
      await getEvaluationPeriods(observer.value[0]);
    }

    function formatEvaluationPeriod(evalPeriod: any) {
      const startDate = moment(evalPeriod.startDate).format('MM/DD/YY');
      const endDate = moment(evalPeriod.endDate).format('MM/DD/YY');
      return {
        id: evalPeriod._id,
        rev: evalPeriod._rev,
        label: evalPeriod.evalType + ' ' + startDate + '-' + endDate,
        value: evalPeriod._id,
        type: evalPeriod.evalType,
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

    useAsync(getEvaluationPeriods(observer.value));

    function add() {
      dialogEvalPeriod.value = {};
      showEvaluationDialog.value = true;
      if (evaluations.value.length > 0) {
        minDate.value = evaluations.value[0].endDate;
      } else {
        minDate.value = null;
      }
    }

    function edit() {
      dialogEvalPeriod.value = evaluationPeriod.value;
      showEvaluationDialog.value = true;
      const currEval: number = evaluations.value.indexOf(evaluationPeriod.value);
      const previousEvalPeriod: any = evaluations.value[currEval + 1];
      const nextEvalPeriod: any = evaluations.value[currEval - 1];
      minDate.value = previousEvalPeriod ? previousEvalPeriod.endDate : null;
      maxDate.value = nextEvalPeriod ? nextEvalPeriod.startDate : null;
    }

    function deleteEvalPeriod() {
      const id = evaluationPeriod.value.id;
      const index = findIndex(evaluations.value, { id });
      evaluations.value.splice(index, 1);
      masterDB.delete(id, evaluationPeriod.value.rev);
      evaluationPeriod.value = undefined;
      store.dispatch('debriefer/updateEvaluationPeriod', {});
      clearFilters();
    }

    function filterFn(val: any, update: any) {
      update(() => {
        const needle = val.toLowerCase();
        evaluations.value = filter(evaluations.value, (option: any) => {
          const currLabel = option.label.toLowerCase();
          return currLabel.includes(needle);
        });
      });
    }

    onMounted( () => {
      if (observerMode) {
        console.log('observer mode');
        observer.value = '852949f4bbd4095bd4a70a8ad1379300';
        selectObserver('852949f4bbd4095bd4a70a8ad1379300').then( () => {
          console.log(state.debriefer.observer);
        });
      } else {
        console.log('not observer mode');
      }

    });

    return {
      add,
      closeEvalDialog,
      deleteDialogSettings,
      deleteEvalPeriod,
      dialogEvalPeriod,
      edit,
      evaluationPeriod,
      evaluations,
      filterFn,
      getTripsByDate,
      maxDate,
      minDate,
      observer,
      observerMode,
      observerQueryOptions,
      selectObserver,
      showAll,
      showDeleteDialog,
      showEvaluationDialog,
      state
    };
  }
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
