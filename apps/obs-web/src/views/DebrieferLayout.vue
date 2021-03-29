<template>
  <div>
    <TabView class="q-ma-sm">
        <TabPanel>
          <template #header>
            <q-btn
              padding="none"
              flat
              dense
              label="Evaluation"
              :icon-right="activeParamsTab === 'evaluation' ? (show ? 'arrow_drop_down' : 'arrow_drop_up') : ''"
              @click="toggleShow('evaluation')"
            />
          </template>
          <app-debriefer-wcgop-evaluation v-show="show"/>
        </TabPanel>
        <TabPanel>
          <template #header>
            <q-btn
              flat
              padding="none"
              dense
              label="Search"
              :icon-right="activeParamsTab === 'search' ? (show ? 'arrow_drop_down' : 'arrow_drop_up') : ''"
              @click="toggleShow('search')"
            />
            </template>
          <app-debriefer-wcgop-search v-show="show"/>
        </TabPanel>
    </TabView>

    <TabView class="q-ma-sm">
      <TabPanel header="Data" :active="infoTab === 'data'">
        <app-debriefer-wcgop-data v-if="program === 'wcgop'" startingTab="trips" :isFullSize="false"/>
        <app-debriefer-ashop-data v-else />
      </TabPanel>
      <TabPanel header="Errors" :active="infoTab === 'qa'">
        <app-debriefer-errors :showData="infoTab === 'qa' ? false : true" />
      </TabPanel>
      <TabPanel header="Summary" :active="infoTab === 'summary'">Summary</TabPanel>
      <TabPanel header="Assessment" :active="infoTab === 'assessment'">
        <app-debriefer-assessment :showData="infoTab === 'assessment'"></app-debriefer-assessment>
      </TabPanel>
      <TabPanel header="DCS" :active="infoTab === 'dcs'">
        <app-debriefer-dcs :showData="infoTab === 'dcs'" />
      </TabPanel>
    </TabView>

  </div>
</template>

<script lang="ts">
import { createComponent, ref, computed } from '@vue/composition-api';
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
    const infoTab = ref('data');

    const show: any = ref(true);
    const activeParamsTab: any = ref('evaluation');

    function toggleShow(label: string) {
      const prevActiveTab = activeParamsTab.value;
      show.value = show.value ? false : true;
      if (prevActiveTab !== label) {
        show.value = true;
      }
      activeParamsTab.value = label;
    }
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
      infoTab,
      clearFilters,
      toggleShow,
      show,
      activeParamsTab
    };
  }
});
</script>
