<template>
  <div>
    <div style="width:100%">
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
        <div class="q-pa-md" style="float:left; width:30%">
          <q-select
            use-input
            style="display: inline-block; width: 60%"
            v-model="observer"
            :options="observerList"
            label="Observer"
            @input="selectObserver"
            @filter="filterObservers"
            fill-input
            hide-selected
          />
          <q-toggle
            class="q-ma-sm"
            style="display: inline-block"
            label="Show Active"
            v-model="showAll"
            @input="getWcgopObservers()"
          />
        </div>
        <div class="q-pa-md">
          <q-select
            style="display: inline-block; width: 20%"
            :disable="observer === '' ? true : false"
            v-model="evaluationPeriod"
            :options="evaluations"
            label="Previous Eval Periods"
            @input="setTripIds"
          />
          <q-btn
            :disable="observer === '' ? true : false"
            style="display: inline-block"
            color="white"
            text-color="black"
            label="Add"
            @click="add"
          />
          <q-btn
            :disable="observer === '' ? true : false"
            style="display: inline-block"
            color="white"
            text-color="black"
            label="Edit"
            @click="edit"
          />
        </div>
      </div>
      <div v-else>
        <div class="q-pa-md" style="float:left; width:30%">
          <q-input v-model="cruiseIds" label="Cruise Id" />
        </div>
        <div class="q-pa-md" style="float:left; width:15%">
          <b>Observer:</b>
          <div>Ruth</div>
        </div>
        <div class="q-pa-md" style="float:left; width:15%">
          <b>Permit:</b>
          <div>329056</div>
        </div>
        <div class="q-pa-md">
          <b>Vessel Name:</b>
          <div>Startbound</div>
        </div>
      </div>
    </div>

    <app-debriefer-dialog :showDialog.sync="showDialog" />

    <TabView class="q-pa-md">
      <TabPanel header="Data" :active="activeTab === 'data'">
        <app-debriefer-data />
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
import { createComponent, ref, reactive,
  computed, onMounted, toRefs} from '@vue/composition-api';
import Vue from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useAsync } from 'vue-async-function';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import moment from 'moment';

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

    const program: string = 'wcgop';
    const observer: any = ref('');
    const showAll: any = ref(false);
    const evaluationPeriod: any = ref('');
    const cruiseIds = '';

    let list: any[] = [];
    const observerList: any = ref([]);
    const evaluations: any = ref([]);

    const showDialog: any = ref(false);
    const masterDB: Client<any> = couchService.masterDB;

    function filterObservers(val: any, update: any) {
      update(() => {
        const needle = val.toLowerCase();
        observerList.value = list.filter((v: any) =>
          v.label.toLowerCase().indexOf(needle) > -1);
      });
    }

    async function getWcgopObservers() {
      const queryOptions: ListOptions = {};
      const observers = [];

      if (!showAll.value) {
        // queryOptions.key = state.user.activeUserAlias._id; // setting debriefer
        queryOptions.key = '852949f4bbd4095bd4a70a8ad130a261';
      }

      const results = await masterDB.view<any>(
        'obs_web',
        'all-wcgop-observers',
        queryOptions
      );

      for (const row of results.rows) {
        observers.push({ label: row.value, value: row.id });
      }
      observers.sort((a: any, b: any) => {
        if (a.label > b.label) {
          return 1;
        }
        if (b.label > a.label) {
          return -1;
        }
        return 0;
      });
      observerList.value = observers;
      list = [...observerList.value];
    }
    useAsync(getWcgopObservers);

    async function selectObserver() {
      store.dispatch('debriefer/updateObservers', observer.value.value);
      await getEvaluationPeriods();
    }

    async function getEvaluationPeriods() {
      const evaluationPeriods: any[] = [];
      const results = await masterDB.viewWithDocs<any>(
        'obs_web',
        'evaluation-periods',
        { key: observer.value.value }
      );

      for (const row of results.rows) {
        if (row.doc.debriefer === '48b80556bad0f18cb0a3748659ea6f9e') {
          const startDate = moment(row.doc.startDate).format('MM/DD/YY');
          const endDate = moment(row.doc.endDate).format('MM/DD/YY');
          evaluationPeriods.push({
            id: row.doc._id,
            rev: row.doc._rev,
            label: row.doc.evalType + '  ' + startDate + '-' + endDate,
            value: row.doc.evalType,
            trips: row.doc.tripIds,
            startDate: row.doc.startDate,
            endDate: row.doc.endDate
          });
        }
      }
      evaluations.value = evaluationPeriods;
    }

    useAsync(getEvaluationPeriods);

    function add() {
      showDialog.value = true;
      store.dispatch('debriefer/updateEvaluationPeriod', {});
    }

    function edit() {
      showDialog.value = true;
      store.dispatch('debriefer/updateEvaluationPeriod', evaluationPeriod.value);
    }

    function setTripIds() {
      for (const tripId of evaluationPeriod.value.trips) {
        store.dispatch('debriefer/addTripId', tripId);
      }
    }

    return {
      program,
      observer,
      evaluationPeriod,
      observerList,
      evaluations,
      cruiseIds,
      selectObserver,
      showDialog,
      showAll,
      getWcgopObservers,
      filterObservers,
      add,
      edit,
      setTripIds
    };
  }
});
</script>
