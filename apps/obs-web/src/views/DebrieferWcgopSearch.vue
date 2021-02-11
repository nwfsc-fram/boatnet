<template>
  <div class="q-pa-xs q-gutter-xs">
      <div v-for="(option, i) of searchOptions" :key="i">
        <q-btn-toggle
          v-if="i > 0"
          v-model="evaluators[i - 1]"
          toggle-color="black"
          color="grey-4"
          :options="[{label: 'and', value: 'and'}, {label: 'or', value: 'or'}]"
          dense
          flat
        ></q-btn-toggle>
        <span v-if="i > 0" class="evaluator-description">{{ evaluatorDescription(i) }}</span>
        <attribute-search-comp :val.sync=searchOptions[i]></attribute-search-comp>
      </div>
      <q-btn @click="addFilter" color="primary" size="md">Add Filter</q-btn>
      <q-btn @click="resetFilters" color="primary" size="md">Reset</q-btn>
      <span style="position: relative; top: 3px">( {{ result.length ? result.length : 0 }} filtered results )</span>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, watch, computed } from '@vue/composition-api';
import Vue, { WatchOptions } from 'vue';
import moment from 'moment';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import Multiselect from 'vue-multiselect';

import AttributeSearchComp from './AttributeSearchComp.vue';

Vue.component('AttributeSearchComp', AttributeSearchComp);

Vue.component('multiselect', Multiselect);

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const searchOptions: any = ref([[]]);
    const evaluators: any = ref([]);
    const result: any = ref([]);
    const resultDocs: any = ref([]);

    const addFilter = () => {
        searchOptions.value.push([]);
        evaluators.value.push('and');
    };

    const evaluatorDescription =
      (i: any) => {
        if (evaluators.value[i - 1] === 'and') {
          return '( value satisfies both criteria )';
        } else {
          return '( value satisfies either criteria )';
        }
      };

    const resetFilters = () => {
      result.value.length = 0;
      resultDocs.value.length = 0;
      searchOptions.value.length = 0;
      searchOptions.value.push([]);
      evaluators.value.length = 0;
    };

    const generateResult = () => {
      let workingArray: any = [];

      for (const resultSet of searchOptions.value) {
        if (workingArray.length === 0) {
          workingArray.push.apply(workingArray, resultSet);
        } else {
          if (evaluators.value[searchOptions.value.indexOf(resultSet) - 1] === 'and') {
            workingArray = workingArray.filter( (val: any) => resultSet.includes(val));
          } else { // evaluator is 'or'
            workingArray.push.apply(workingArray, resultSet);
            workingArray = [...new Set(workingArray)];
          }
        }
      }
      result.value.length = 0;
      result.value.push.apply(result.value, workingArray);
      store.dispatch('debriefer/setTripIds', result.value);
    };

    const watcherOptions: WatchOptions = {
      immediate: true, deep: false
    };

    watch(
        () => [searchOptions.value, evaluators.value],
        (newVal, oldVal) => {
            generateResult();
        },
        watcherOptions
    );

    return { searchOptions, evaluatorDescription, evaluators, addFilter, result, resultDocs, resetFilters };
  }
});
</script>

<style scoped>
  * >>> .q-btn--dense {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 1em !important;
  }

  * >>> .q-btn__wrapper {
    margin: 0 !important;
    padding: 0 0.25em !important;
    min-height: 1em !important;
  }

  .evaluator-description {
    font-style: italic;
    font-size: 0.8em;
    position: relative;
    bottom: 2px
  }

</style>