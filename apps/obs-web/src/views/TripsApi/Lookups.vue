<template>
    <div class="q-ma-md">
        this is the trips api lookups page

        Need to come up with a way to get values from couch
        Nice to come up with a way to get list from couch

        source
        state - used by departureState, returnState
        portCode - departurePortCode, returnPortCode
        buyers (first Receivers)
        fishery : logbook
        fisherySector : review
        skipper
        gearTypeCode
        targetStrategy
        disposition
        speciesCode
        calcWeightType
        provider
        systemPerformance
        catchHandlingPerformance
        fate

        <div v-for="(lookup, i) of Object.keys(lookups)" :key="i">
            <b>{{ lookup }}</b>
            <q-table
            :data="lookups[lookup]"
            :columns="columns"
            :pagination.sync="pagination"
            :selected.sync="selected"
            row-key="index"
            dense
            hide-bottom
            :title="lookup"
            >
                <template v-slot:body="props">
                    <q-tr
                        :props="props"
                    >
                        <q-td key="value" :props="props">{{ props.row.value }}</q-td>
                        <q-td key="description" :props="props">{{ props.row.description }}</q-td>
                        <q-td key="usedon" :props="props">{{ getArrayValues(props.row.usedon) }}</q-td>
                    </q-tr>
                </template>
            </q-table>
            <br>
        </div>

    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';
import { Vue, Watch } from 'vue-property-decorator';
import { getArrayValues } from '../../helpers/arrayHelpers';
export default createComponent({
  setup(props, context) {
      const columns: any = [
          { name: 'value', label: 'Value', required: false, align: 'left', sortable: false },
          { name: 'description', label: 'Description', required: false, align: 'left', sortable: false },
          { name: 'usedon', label: 'Used On', required: false, align: 'left', sortable: false },
      ];
      const lookups: any = {
        testLookup: [
            { value: 0, description: 'test val 0', usedon: ['logbook', 'review']}
        ],
        secondLookup: [
            { value: 44, description: 'test val 44', usedon: ['logbook', 'other']}
        ]

      };
      const pagination = {
          sortBy: 'value',
          descending: false,
          rowsPerPage: 0
      };
      const selected: any = ref([]);

      return {columns, lookups, pagination, selected, getArrayValues};
  }
});
</script>

<style scoped>

</style>