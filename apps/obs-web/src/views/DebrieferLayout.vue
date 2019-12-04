<template>
  <div>
    <div class="q-pa-sm">
      <div class="q-gutter-md row">
        <div>
          <div>Program</div>
          <q-btn-toggle v-model="program" toggle-color="primary" :options="programOptions" />
        </div>

        <div v-if="program === 'wcgop'" class="row">
          <q-select v-model="observer" :options="options" label="Observer" style="width: 250px"></q-select>
          <q-btn
            flat
            color="white"
            text-color="black"
            label="+"
            size="xl"
            @click="addObserver = true"
          />
          <q-select
            v-model="evaluationPeriod"
            :options="evaluations"
            label="Evaluation Period"
            style="width: 250px"
          ></q-select>
          <q-btn
            flat
            color="white"
            text-color="black"
            label="+"
            size="xl"
            @click="addEvaluationPeriod = true"
          />
        </div>

        <div v-if="program === 'ashop'">
          <q-input v-model="text" label="Cruise ID" />
        </div>
      </div>
    </div>

    <TabView class="q-pa-md">
      <TabPanel header="Summary" :active="activeTab === 'summary'">Summary</TabPanel>
      <TabPanel header="Error" :active="activeTab === 'qa'">
        <prime-table :value="data" :columns="errorColumns" title="Errors" />
      </TabPanel>
      <TabPanel header="Data" :active="activeTab === 'data'">
        <app-debriefer
          :showData="activeTab === 'data' ? false : true"
        />
      </TabPanel>
      <TabPanel header="Assessment" :active="activeTab === 'assessment'">Assessment</TabPanel>
    </TabView>

    <q-dialog v-model="addObserver" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Observer</div>
        </q-card-section>

        <q-card-section>
          <q-select
            dense
            autofocus
            v-model="observer"
            :options="options"
            label="Observer"
            @keyup.enter="addObserver = false"
            style="width: 250px"
          ></q-select>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup></q-btn>
          <q-btn flat label="Add" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="addEvaluationPeriod" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">New Evaluation Period</div>
        </q-card-section>

        <q-card-section>
          <q-select
            dense
            autofocus
            v-model="evaluationPeriod"
            :options="evaluations"
            label="Evaluation Period"
            @keyup.enter="addEvaluationPeriod = false"
          ></q-select>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup></q-btn>
          <q-btn flat label="Add" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  private cruiseIds: string = '';

  private addObserver: boolean = false;
  private addEvaluationPeriod: boolean = false;

  private programOptions = [
    { label: 'WCGOP', value: 'wcgop' },
    { label: 'A-SHOP', value: 'ashop' }
  ];
  private options = ['George', 'Alex'];
  private evaluations = ['Mid Cruise', 'Year End', 'Exit'];

  private errorColumns = [
    { field: 'severity', header: 'Severity' },
    { field: 'description', header: 'Description' },
    { field: 'tripNum', header: 'Trip #' },
    { field: 'dateCreated', header: 'Date Created' },
    { field: 'observer', header: 'Observer' },
    { field: 'status', header: 'Status' },
    { field: 'dateFixed', header: 'Date Fixed' },
    { field: 'note', header: 'Note' }
  ];

  private data = [
    {
      severity: 'Warning',
      description:
        'Multiple dissections of the same type collected for sea whip, sea pen, or non-coral species.',
      tripNum: 24266,
      dateCreated: '1/1/19',
      observer: 'Davis',
      status: 'Unresolved',
      dateFixed: '',
      note: 'dissection count'
    }
  ];
}
</script>