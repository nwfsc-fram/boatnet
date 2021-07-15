<template>
<!--
  Forked from:
  https://quasar.dev/vue-components/tab-panels#example--with-vertical-qtabs-and-qsplitter
-->
<div id="q-app">
  <div>
    <q-card>

        <q-tabs
          v-model="tab"
          align="left"
          class="bg-primary text-white shadow-2 q-my-md"
        >
          <q-tab name="log" label="Log Bio-structures"></q-tab>
          <q-tab name="process" label="Process Bio-structures"></q-tab>
        </q-tabs>

        <q-tab-panels
          v-model="tab"
        >
          <q-tab-panel name="log">
            <app-rack-biospecimens/>
          </q-tab-panel>
          <q-tab-panel name="process">
            <app-process-biostructures/>
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
        const tab: any = ref('log');
        const splitterModel: any = ref(20);

        return {
            tab,
            splitterModel
        };
    }
});
</script>