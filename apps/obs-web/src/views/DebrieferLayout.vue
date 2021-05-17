<template>
  <div>
    <div v-if="state.debriefer.program === 'wcgop'">
      <q-tabs

        v-model="topTab"
        align="left"
        dense
        class="q-mt-sm bg-primary text-white shadow-2"
      >
        <q-tab name="evaluation" label="Evaluation" />
        <q-tab name="search" label="Search" />
        <q-space/>
        <q-btn
              flat
              :icon="show ? 'expand_less' : 'expand_more'"
              @click="show = show ? false : true"
            >
              <q-tooltip>Expand / hide</q-tooltip>
            </q-btn>
      </q-tabs>
      <q-tab-panels v-model="topTab" animated>
        <q-tab-panel name="evaluation" v-show="show">
          <app-debriefer-wcgop-evaluation class="z-index5 1"/>
        </q-tab-panel>
        <q-tab-panel name="search">
          <app-debriefer-wcgop-search v-show="show"/>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <div>
      <q-tabs
            v-model="bottomTab"
            align="left"
            dense
            class="q-mt-sm bg-primary text-white shadow-2"
            narrow-indicator
          >
            <q-tab name="data" label="Data" />
            <q-tab name="errors" label="Errors" />
            <q-tab name="summary" label="Summary" />
            <q-tab v-if="topTab === 'evaluation'" name="assessment" label="Assessment" />
            <q-tab v-if="topTab === 'evaluation'" name="dcs" label="DCS" />
          </q-tabs>

      <q-tab-panels v-model="bottomTab" animated>
        <q-tab-panel name="data">
          <app-debriefer-wcgop-data 
            :startingTab="startingDataTab"
            :isFullSize="false"
            @updateDataTab="setDataTab"
          />
        <!--  <app-debriefer-ashop-data v-else />           v-if="program === 'wcgop'"
  -->
        </q-tab-panel>
        <q-tab-panel name="errors">
          <app-debriefer-errors :showData="bottomTab === 'qa' ? false : true" />
        </q-tab-panel>
        <q-tab-panel name="summary">
          <app-debriefer-summary @changeTab="redirectTabs"/>
        </q-tab-panel>
        <q-tab-panel name="assessment">
          <app-debriefer-assessment ></app-debriefer-assessment>
        </q-tab-panel>
        <q-tab-panel name="dcs">
          <app-debriefer-dcs :showData="bottomTab === 'dcs'" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, computed, onMounted, watch } from '@vue/composition-api';
import Vue from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import { couchService } from '@boatnet/bn-couch';

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
    const bottomTab = ref('data');
    const startingDataTab = ref('');

    const show: any = ref(true);
    const activeParamsTab: any = ref('evaluation');
    clearFilters();

    onMounted(async () => {
      store.dispatch('debriefer/updateTrips', []);
    });

    function clearFilters() {
      store.dispatch('debriefer/updateEvaluationPeriod', {});
    }

    function redirectTabs(tabInfo: any) {
      setBottomTab(tabInfo.topLevelTab);
      setDataTab(tabInfo.dataTab);
    }

    function setBottomTab(tabName: string) {
      bottomTab.value = tabName;
    }

    function setDataTab(tabName: string) {
      startingDataTab.value = tabName;
    }

    return {
      state,
      startingDataTab,
      topTab,
      bottomTab,
      clearFilters,
      show,
      activeParamsTab,
      redirectTabs,
      setBottomTab,
      setDataTab,
    };
  }
});
</script>
