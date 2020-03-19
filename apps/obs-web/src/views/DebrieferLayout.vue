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
        <div class="q-pa-md" style="float:left; width:35%">
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
        </div>
      </div>
      <div v-else>
        <div class="q-pa-md" style="float:left; width:30%">
          <q-input v-model="cruiseIds" label="Cruise Id" />
        </div>
        <div class="q-pa-md" style="float:left; width:15%">
          <b>Observer:</b>
          <div>{{ observers }}</div>
        </div>
       <!-- <div class="q-pa-md" style="float:left; width:15%">
          <b>Permit:</b>
          <div>329056</div>
        </div>-->
        <div class="q-pa-md">
          <b>Vessel Name:</b>
          <div>{{ vesselName }}</div>
        </div>
      </div>
    </div>

    <app-debriefer-dialog
      :showDialog.sync="showDialog"
      :evaluationPeriod="dialogEvalPeriod"
      @closeEvalDialog="closeEvalDialog"
    />

    <TabView class="q-ma-md">
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
  computed, watch } from '@vue/composition-api';
import Vue from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useAsync } from 'vue-async-function';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import moment from 'moment';
import { PersonAlias, AshopCruise } from '@boatnet/bn-models';
 
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

    let list: any[] = [];
    const observerList: any = ref([]);
    const evaluations: any = ref([]);

    const showDialog: any = ref(false);
    const masterDB: Client<any> = couchService.masterDB;

    const dialogEvalPeriod = ref({});

    const cruise: AshopCruise = ref({});
    const cruiseIds = computed ({
      get: () => {
        return state.debriefer.cruiseIds;
      }, set: (id) => {
        if (id.length >= 5) {
          store.dispatch('debriefer/setCruiseIds', id);
        }
      }
    });

    const vesselName = computed({
      get: () => {
        return cruise.value.vessel && cruise.value.vessel.vesselName ? cruise.value.vessel.vesselName : '';
      }, set: (id) => undefined
    })

    const observers = computed({
      get: () => {
        let names = '';
        const length = cruise.value.observers ? cruise.value.observers.length : 0;
        for (let i = 0; i < length; i++) {
          names += cruise.value.observers[i].firstName + ' ' + cruise.value.observers[i].lastName;
          if (i < length - 1) {
            names += ', ';
          }
        }
        return names;
      }, set: (id) => undefined
    })

    const program = computed ({
      get: () => {
        let mode: string = state.debriefer.program;
        if (!mode) {
          mode = 'wcgop';
        }
        return mode;
      }, set: (val) => {
        store.dispatch('debriefer/updateProgram', val);
      }
    });

    const evaluationPeriod = computed({
      get: () => {
        return state.debriefer.evaluationPeriod;
      }, set: (val) => {
        store.dispatch('debriefer/updateEvaluationPeriod', val);
        store.dispatch('debriefer/setTripIds', val.tripIds);
      }
    });

    function filterObservers(val: any, update: any) {
      update(() => {
        const needle = val.toLowerCase();
        observerList.value = list.filter(
          (v: any) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    }

    async function getWcgopObservers() {
      const queryOptions: ListOptions = {};
      const observers: any[] = [];

      try {
        if (!showAll.value) {
          queryOptions.key = state.user.activeUserAlias.personDocId; // setting debrieferId
        }
        const results = await masterDB
          .view<any>('obs_web', 'all_wcgop_observers', queryOptions)
          .then((response: any) => {
            for (const row of response.rows) {
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
          });
      } catch (err) {
        console.log(err);
      }
    }
    useAsync(getWcgopObservers);

    async function selectObserver() {
      store.dispatch('debriefer/updateObservers', observer.value.value);
      evaluationPeriod.value = {};
      await getEvaluationPeriods();
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

    watch(() => state.debriefer.cruiseIds, getCruise);

    async function getCruise() {
      const cruiseId: number = parseInt(state.debriefer.cruiseIds, 10);
      try {
        const results = await masterDB.viewWithDocs<any>(
          'obs_web',
          'ashop_cruise',
          { key: cruiseId}
        );
        cruise.value = results.rows[0].doc;
        store.dispatch('debriefer/setTripIds', results.rows[0].doc.trips);
      } catch (err) {
        store.dispatch('debriefer/setTripIds', []);
        console.log(err);
      }
    }

    async function getEvaluationPeriods() {
      const evaluationPeriods: any[] = [];
      const debrieferId = state.user.activeUserAlias.personDocId;
      let results: any;
      try {
        results = await masterDB.viewWithDocs<any>(
          'obs_web',
          'evaluation_periods',
          { key: observer.value.value })
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
      showDialog.value = true;
    }

    function edit() {
      dialogEvalPeriod.value = evaluationPeriod.value;
      showDialog.value = true;
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
      cruise,
      cruiseIds,
      selectObserver,
      showDialog,
      showAll,
      getWcgopObservers,
      filterObservers,
      add,
      edit
    };
  }
});
</script>
