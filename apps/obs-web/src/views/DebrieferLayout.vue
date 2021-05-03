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
            icon="settings"
          >
            <q-tooltip>Settings</q-tooltip>
            <q-menu>
              <q-list style="width: 225px">
                <q-item clickable v-close-popup>
                  <q-toggle
                    left-label
                    v-model="displayCodes"
                    label="Display codes:"
                    @input="updateDisplayCodes"
                  />
                </q-item>
                <q-item clickable v-close-popup>
                  <span>Program:</span>
                  <q-btn-toggle
                    class="q-ml-md"
                    v-model="program"
                    toggle-color="primary"
                    dense
                    :options="[
                      {label: 'A-SHOP', value: 'ashop'},
                      {label: 'WCGOP', value: 'wcgop'},
                    ]"
                    @input="updateProgram"
                  />
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            flat
            :icon="show ? 'expand_less' : 'expand_more'"
            @click="show = show ? false : true"
          >
            <q-tooltip>Expand / hide</q-tooltip>
          </q-btn>
      </q-tabs>
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
          <q-tab name="data" label="Data" />
          <q-tab name="errors" label="Errors" />
          <q-tab name="summary" label="Summary" />
          <q-tab name="assessement" label="Assessement" />
          <q-tab name="dcs" label="DCS" />
        </q-tabs>

    <q-tab-panels v-model="bottomTab" animated>
      <q-tab-panel name="data">
        <app-debriefer-wcgop-data 
          v-if="program === 'wcgop'"
          :startingTab="startingDataTab"
          :isFullSize="false"
          @updateDataTab="setDataTab"
        />
        <app-debriefer-ashop-data v-else />
      </q-tab-panel>
      <q-tab-panel name="errors">
         <app-debriefer-errors :showData="bottomTab === 'qa' ? false : true" />
      </q-tab-panel>
      <q-tab-panel name="summary">
        <app-debriefer-summary @changeTab="redirectTabs"/>
      </q-tab-panel>
      <q-tab-panel name="assessement">
        <app-debriefer-assessment ></app-debriefer-assessment>
      </q-tab-panel>
      <q-tab-panel name="dcs">
        <app-debriefer-dcs :showData="bottomTab === 'dcs'" />
      </q-tab-panel>
    </q-tab-panels>
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
    const startingDataTab = ref('trips');

    const show: any = ref(true);
    const activeParamsTab: any = ref('evaluation');

    const program: any = ref('');
    const displayCodes: any = ref(false);

    watch(() => state.debriefer.observer, () => {
      setDataTab('trips');
      setBottomTab('data');
    });

    watch(() => state.debriefer.evaluationPeriod, () => {
      setDataTab('trips');
      setBottomTab('data');
    });

    clearFilters();

    onMounted(async () => {
      store.dispatch('debriefer/updateTrips', []);
      const displayCodesState = state.debriefer.displayCodes;
      const programState = state.debriefer.program;

      const userColConfig: any = await couchService.masterDB.viewWithDocs(
            'obs_web',
            'debriefer-config',
            { key: state.user.activeUserAlias.personDocId }
        );
      const currDoc = userColConfig.rows[0].doc;

      displayCodes.value = displayCodesState ? displayCodesState : currDoc.displayCodes;
      program.value = programState ? programState : currDoc.program;
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

    async function updateDebrieferConfig(field: string, status: any) {
      const userColConfig: any = await couchService.masterDB.viewWithDocs(
        'obs_web',
        'debriefer-config',
        { key: state.user.activeUserAlias.personDocId }
      );
      const doc: any = userColConfig.rows[0].doc;
      doc[field] = status;
      await couchService.masterDB.bulk([doc], true);
    }

    async function updateDisplayCodes(status: any) {
      store.dispatch('debriefer/updateDisplayCodes', status);
      await updateDebrieferConfig('displayCodes', status);
    }

    async function updateProgram(status: string) {
      store.dispatch('debriefer/updateProgram', status);
      await updateDebrieferConfig('program', status);
    }

    return {
      program,
      displayCodes,
      startingDataTab,
      topTab,
      bottomTab,
      clearFilters,
      show,
      activeParamsTab,
      redirectTabs,
      setBottomTab,
      setDataTab,

      updateDisplayCodes,
      updateProgram
    };
  }
});
</script>
