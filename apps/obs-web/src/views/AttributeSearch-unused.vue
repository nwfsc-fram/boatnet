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

      <div>
        <p v-if="result.length > 0">{{result.length}} filtered results</p>
        <q-table
          v-if="resultDocs.length > 0"
          :data="resultDocs"
          :columns="columns"
          :pagination.sync="pagination"
          :selected.sync="selected"
          row-key="_id"
          dense
          hide-bottom
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="vesselName" :props="props">{{ props.row.vessel.vesselName }}</q-td>
              <q-td key="vesselId" :props="props">{{ props.row.vessel.coastGuardNumber ? props.row.vessel.coastGuardNumber : props.row.vessel.stateRegualtionNumber }}</q-td>
              <q-td key="departurePort" :props="props">{{ props.row.departurePort.name }}</q-td>
              <q-td key="returnPort" :props="props">{{ props.row.returnPort.name }}</q-td>
              <q-td key="observer" :props="props">{{ props.row.observer.firstName }} {{ props.row.observer.lastName }}</q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
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

    const columns  = [
        {name: 'vesselName', label: 'Vessel Name', field: 'vessel.vesselName', required: false, align: 'left', sortable: true},
        {name: 'vesselId', label: 'Vessel #', field: 'vessel.vesselId', required: false, align: 'left', sortable: true},
        {name: 'departurePort', label: 'Departure Port', field: 'departurePort.name', required: false, align: 'left', sortable: true},
        {name: 'returnPort', label: 'Return Port', field: 'returnPort.name', required: false, align: 'left', sortable: true},
        {name: 'observer', label: 'Observer', field: 'observer', required: false, align: 'left', sortable: true},
    ];

    const pagination = {
        sortBy: 'departureDate',
        descending: false,
        rowsPerPage: 0,
        };

    const selected: any = [];

    const addFilter = () => {
        searchOptions.value.push([]);
        evaluators.value.push('and');
    };

    const evaluatorDescription =
      (i: any) => {
        if (evaluators.value[i - 1] === 'and') {
          return '( value satisfies both criteria )'
        } else {
          return '( value satisfies either criteria )'
        }
      }

    const resetFilters = () => {
      result.value.length = 0;
      resultDocs.value.length = 0;
      searchOptions.value.length = 0;
      searchOptions.value.push([]);
      evaluators.value.length = 0;
    }

    const generateResult = () => {
      let workingArray: any = []

      for (const resultSet of searchOptions.value) {
        if (workingArray.length === 0) {
          workingArray.push.apply(workingArray, resultSet)
        } else {
          if (evaluators.value[searchOptions.value.indexOf(resultSet) -1] === 'and') {
            workingArray = workingArray.filter( (val: any) => resultSet.includes(val));
          } else { // evaluator is 'or'
            workingArray.push.apply(workingArray, resultSet)
            workingArray = [...new Set(workingArray)]
          }
        }
      }
      result.value.length = 0;
      result.value.push.apply(result.value, workingArray);
      getResults()
    }

    const getResults = async () => {
      resultDocs.value.length = 0;
      for (const id of result.value) {
        resultDocs.value.push(await masterDB.get(id));
      }
    }

    const watcherOptions: WatchOptions = {
      immediate: true, deep: false
    };

    watch(
        () => [searchOptions.value, evaluators.value],
        (newVal, oldVal) => {
            generateResult()
        },
        watcherOptions
    );

    return { searchOptions, evaluatorDescription, evaluators, addFilter, result, resultDocs, columns, pagination, resetFilters, selected };
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