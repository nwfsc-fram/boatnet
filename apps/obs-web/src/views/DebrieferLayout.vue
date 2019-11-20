<template>
  <div>
    <div style="width:100%">
      <div class="q-pa-md" style="float:left">
        <div>Program</div>
        <q-btn-toggle
          v-model="program"
          toggle-color="primary"
          :options="[
          {label: 'WCGOP', value: 'WCGOP'},
        {label: 'A-SHOP', value: 'A-SHOP'}
      ]"
        />
      </div>
      <div class="q-pa-md" style="float:left; width:30%">
        <q-select v-model="observer" :options="options" label="Observer" />
        <!--  <q-btn color="white" text-color="black" label="+" />-->
      </div>
      <div class="q-pa-md">
        <q-select v-model="evaluationPeriod" :options="evaluations" label="Evaluation Period" />
        <!-- <q-btn color="white" text-color="black" label="+" />-->
      </div>
    </div>
    <TabView class="q-pa-md">
      <TabPanel header="Summary" :active="activeTab === 'summary'">Summary</TabPanel>
      <TabPanel header="QA/QC" :active="activeTab === 'qa'">
        <app-debriefer
          :showData="activeTab === 'qa' ? false : true"
        />
      </TabPanel>
      <TabPanel header="Assessment" :active="activeTab === 'assessment'">Assessment</TabPanel>
    </TabView>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

Vue.component('TabPanel', TabPanel);
Vue.component('TabView', TabView);

@Component
export default class DebrieferLayout extends Vue {
  @Prop(String) public activeTab!: string; // Passed by router
  private program: string = '';
  private observer: string = '';
  private evaluationPeriod: string = '';
  private options = ['George', 'Alex'];
  private evaluations = ['Mid Cruise', 'Year End', 'Exit'];
}
</script>