<template>
  <div class="q-pa-md">
    <debriefer-select-comp
      label="Barcode"
      style="display: inline-block; width: 30%"
      :val.sync="biospecimen"
      lookupView="biostructures_barcode"
      lookupLabel="key"
      lookupValue="value"
      @select="select"
    />
    <div class="q-pa-sm"><b>Dissection Type: </b>{{ structureDesc }}</div>
    <div class="q-pa-sm"><b>Trip #: </b>{{ currVal.tripNum ? currVal.tripNum : null }}</div>
    <div class="q-pa-sm"><b>Haul #: </b>{{ currVal.haulNum ? currVal.haulNum: null }}</div>
    <div class="q-pa-sm"><b>Catch #: </b>{{ currVal.catchNum ? currVal.catchNum : null }}</div>
    <div class="q-pa-sm"><b>Species: </b>{{ currVal.species ? currVal.species : null }}</div>
    <span class="q-pa-sm"><b>Assign to Rack:</b></span>
    <multiselect style="width: 400px" v-model="racks" :options="options" />
  </div>
</template>


<script lang="ts">
import { createComponent, ref, reactive, watch } from '@vue/composition-api';
import Vue from 'vue';
import { Biostructure, BiostructureType } from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';

Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
  setup(props, context) {
    const biospecimen: any = ref([]);
    const racks: any = ref([]);

    const currVal: any = ref({});
    const structureDesc: any = ref('');

    const options: any = [
      'BCAC-2004-01',
      'BCAC-2013-01',
      'CHNK-2005',
      'CNRY-2004-02',
      'DBRK-2005-07'
    ];

    function select(selected: any) {
      const biostructure: Biostructure = selected.biostructure;
      const biostructureType: BiostructureType = biostructure && biostructure.structureType
        ? biostructure.structureType
        : {};
      structureDesc.value = biostructureType ? biostructureType.description : '';
      currVal.value = selected;
    }
    return {
      biospecimen,
      currVal,
      select,
      racks,
      options,
      structureDesc
    };
  }
});
</script>