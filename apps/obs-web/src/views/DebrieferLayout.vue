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
          <app-debriefer-wcgop-evaluation v-if="show"/>
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
          <app-debriefer-wcgop-search v-if="show"/>
        </TabPanel>
    </TabView>

    <TabView class="q-ma-sm">
      <TabPanel header="Data" :active="infoTab === 'data'">
        <app-debriefer-wcgop-data v-if="program === 'wcgop'" startingTab="trips" :isFullSize="false"/>
        <app-debriefer-ashop-data v-else />
        <h5>Maximizable</h5>
    <Button label="Show" icon="pi pi-external-link" @click="openMaximizable" />
    <Dialog header="Header" :visible="displayMaximizable" :style="{width: '50vw'}" :maximizable="true" :modal="true">
        <app-debriefer-wcgop-data v-if="program === 'wcgop'" startingTab="trips" :isFullSize="false"/>

    <template #footer>
        <Button label="No" icon="pi pi-times" @click="closeMaximizable" class="p-button-text"/>
        <Button label="Yes" icon="pi pi-check" @click="closeMaximizable" autofocus />
    </template>
</Dialog>
      </TabPanel>
      <TabPanel header="Errors" :active="infoTab === 'qa'">
        <app-debriefer-errors :showData="infoTab === 'qa' ? false : true" />
      </TabPanel>
      <TabPanel header="Summary" :active="infoTab === 'summary'">Summary</TabPanel>
      <TabPanel header="Assessment" :active="infoTab === 'assessment'">Assessment</TabPanel>
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
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

Vue.component('Button', Button);
Vue.component('Dialog', Dialog);
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
    const dialog: any = ref(false);
    const maximizedToggle: any = ref(true);

    const show: any = ref(true);
    const activeParamsTab: any = ref('evaluation');
    const displayMaximizable: any = ref(false);

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

    function  openMaximizable() {
      displayMaximizable.value = true;
    }

    function closeMaximizable() {
      displayMaximizable.value = false;
    }

    return {
      program,
      infoTab,
      clearFilters,
      dialog,
      maximizedToggle,
      toggleShow,
      show,
      activeParamsTab,
      displayMaximizable,
      openMaximizable,
      closeMaximizable
    };
  }
});
</script>
