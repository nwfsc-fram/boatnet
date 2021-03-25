<template>
  <div>
    <q-tabs
          v-model="topTab"
          align="left"
          dense
          class="q-ma-sm bg-primary text-white shadow-2"
          narrow-indicator
        >
          <q-tab name="evaluation" label="Evaluation" />
          <q-tab name="search" label="Search" />
          <q-space/>
          <q-btn
            flat
            :icon="show ? 'expand_less' : 'expand_more'"
            @click="show = show ? false : true"
          />
        </q-tabs>

        <q-separator />

    <q-tab-panels v-model="topTab" animated :keep-alive="true">
      <q-tab-panel name="evaluation" v-show="show">
        <app-debriefer-wcgop-evaluation class="z-index5 1"/>
      </q-tab-panel>
      <q-tab-panel name="search">   
        <app-debriefer-wcgop-search v-show="show"/>
      </q-tab-panel>
    </q-tab-panels>

    <q-tabs
          v-model="bottomTab"
          align="left"
          dense
          class="q-ma-sm bg-primary text-white shadow-2"
          narrow-indicator
        >
          <q-tab name="summary" label="Summary" />
          <q-tab name="data" label="Data" />
          <q-tab name="errors" label="Errors" />
          <q-tab name="assessement" label="Assessement" />
          <q-tab name="dcs" label="DCS" />
        </q-tabs>

        <q-separator />

    <q-tab-panels v-model="bottomTab" animated>
      <q-tab-panel name="summary">
        <app-debriefer-summary />
      </q-tab-panel>
      <q-tab-panel name="data">
        <app-debriefer-wcgop-data v-if="program === 'wcgop'" startingTab="trips" :isFullSize="false"/>
        <app-debriefer-ashop-data v-else />
      </q-tab-panel>
      <q-tab-panel name="errors">
         <app-debriefer-errors :showData="bottomTab === 'qa' ? false : true" />
      </q-tab-panel>
      <q-tab-panel name="assessement">
      </q-tab-panel>
      <q-tab-panel name="dcs">
        <app-debriefer-dcs :showData="bottomTab === 'dcs'" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, computed, onMounted } from '@vue/composition-api';
import Vue from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
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
    const topTab = ref('evaluation');
    const bottomTab = ref('summary');

    const show: any = ref(true);
    const activeParamsTab: any = ref('evaluation');

    clearFilters();

    onMounted(() => {
      store.dispatch('debriefer/updateTrips', []);
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

    function clearFilters() {
      store.dispatch('debriefer/updateEvaluationPeriod', {});
    }

    return {
      program,
      topTab,
      bottomTab,
      clearFilters,
      show,
      activeParamsTab
    };
  }
});
</script>
