<template>
  <div>
    <TabView class="q-ma-md">
      <TabPanel header="WCGOP" :active="true" >
        <TabView @tab-change="clearFilters">
          <TabPanel header="Evaluation" :active="true">
            <app-debriefer-wcgop-evaluation />
          </TabPanel>
          <TabPanel header="Search">
            <app-debriefer-wcgop-search />
          </TabPanel>
        </TabView>
      </TabPanel>
      <TabPanel header="A-SHOP">
        <app-debriefer-layout-ashop />
      </TabPanel>
    </TabView>

    <TabView class="q-ma-md">
      <TabPanel header="Data" :active="activeTab === 'data'">
        <app-debriefer-wcgop-data v-if="program === 'wcgop'" startingTab="trips" :showPopout="true" :isFullSize="false"/>
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
import { Client, CouchDoc, ListOptions, FindOptions } from 'davenport';
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
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const activeTab = ref('data');

    clearFilters();

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

    function clearFilters() {
      store.dispatch('debriefer/updateTripSearchFilters', {});
      store.dispatch('debriefer/updateEvaluationPeriod', {});
    }

    return {
      program,
      activeTab,
      clearFilters
    };
  }
});
</script>
