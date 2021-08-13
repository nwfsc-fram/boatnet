<template>
<div id="q-app">
  <div>
    <q-card>

        <q-tabs
          v-model="tab"
          align="left"
          class="bg-primary text-white shadow-2 q-my-md"
        >
          <q-tab name="scan" label="Scan Barcodes"></q-tab>
          <q-tab name="report" label="Report"></q-tab>
        </q-tabs>

        <q-tab-panels
          v-model="tab"
          keep-alive
        >
          <q-tab-panel name="scan">
            <app-scan-barcodes type="scan"/>
          </q-tab-panel>
          <q-tab-panel name="report">
            <app-biospecimens-report type="scan"/>
          </q-tab-panel>
        </q-tab-panels>
    </q-card>
  </div>
</div>
</template>


<script lang="ts">
import { createComponent, ref, reactive, watch } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';

Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    setup(props, context) {
        const tab: any = ref('scan');

        return {
            tab
        };
    }
});
</script>