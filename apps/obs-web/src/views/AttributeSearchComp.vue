<template>
  <div>
      <div class="row q-gutter-xs">
        <q-select
            class="col"
            label="Attribute"
            outlined
            dense
            options-dense
            :options="searchTypes"
            v-model="selectedSearchType"
            clearable
        >
        </q-select>
        <q-select
            class="col"
            label="Is"
            dense
            outlined
            options-dense
            :options="evaluatorOptions"
            v-model="evaluator"
        ></q-select>
        <pCalendar
        v-if="['departureDate', 'returnDate'].includes(selectedSearchType)"
        class="col"
        v-model="selectedSearchOption"
        :showButtonBar="true"
        :monthNavigator="true"
        :yearNavigator="true"
        yearRange="2011:2035"
        :showIcon="true"
        >
        </pCalendar>
        <q-select
            v-else
            class="col"
            label="Selection"
            outlined
            dense
            options-dense
            use-input
            :options="searchOptions"
            v-model="selectedSearchOption"
            @filter="selectionFilterFn"
            clearable
        >
        </q-select>
        <div class="col" style="position: relative; top: 8px">
            <q-spinner v-if="loading" color="primary" size="1.8em"></q-spinner>
            <span v-if="selectedSearchResults.length > 0">{{selectedSearchResults.length}} results</span>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, onMounted, watch } from '@vue/composition-api';
import Vue, { WatchOptions } from 'vue';
import moment from 'moment';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

import Multiselect from 'vue-multiselect';
Vue.component('multiselect', Multiselect);

export default createComponent({
  props: {
    val: Array
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const searchTypes: any = ref([]);
    const selectedSearchType = ref('');
    const searchOptions: any = ref([]);
    const sourceSearchOptions: any = ref([]);
    const selectedSearchOption = ref('');
    const selectedSearchResults: any = ref([]);
    const evaluator: any = ref('equals');
    const loading: any = ref(false);
    const evaluatorOptions = ref(['equals', 'greater than', 'less than']);

    const getSearchTypes = async () => {
      const types: any = [
          'tripId', 'trip-status', 'observer', 'vesselName', 'vesselId', 'program', 'fishery', 'firstReceiver',
          'departureDate', 'returnDate', 'fishingActivity', 'isPartialTrip', 'isFishProcessed',
          'logbookNum', 'observerLogbookNum', 'departurePort', 'returnPort', 'fishTicket', 'state',
          'gearType', 'gearPerformance', 'isDataQualityPassing', 'isEfpUsed', 'beaufortValue', 'crewSize'
      ];

      searchTypes.value.push.apply(searchTypes.value, types);
    };

    const getSearchOptions = async () => {
        loading.value = true;
        sourceSearchOptions.value.length = 0;
        if (!['departureDate', 'returnDate'].includes(selectedSearchType.value)) {
            const tripSearchOptionResults = await masterDB.view(
                'obs_web',
                'wcgop_trips_compound_fields',
                {reduce: true, include_docs: false, start_key: [selectedSearchType.value], end_key: [selectedSearchType.value, {}], group_level: 2} as any
            );
            sourceSearchOptions.value.push.apply(sourceSearchOptions.value, [...new Set(tripSearchOptionResults.rows.map( (row: any) => {
                if (row.key[1] === null || row.key[1] === undefined) {
                    return 'null';
                } else {
                    return row.key[1];
                }
            }))]
            );
            const operationSearchOptionResults = await masterDB.view(
                'obs_web',
                'wcgop_operations_compound_fields',
                {reduce: true, include_docs: false, start_key: [selectedSearchType.value], end_key: [selectedSearchType.value, {}], group_level: 2} as any
            );
            sourceSearchOptions.value.push.apply(sourceSearchOptions.value, [...new Set(operationSearchOptionResults.rows.map( (row: any) => {
                if (row.key[1] === null || row.key[1] === undefined) {
                    return 'null';
                } else {
                    return row.key[1];
                }
            }))]
            );
            if (parseInt(sourceSearchOptions.value[0], 10)) {
                evaluatorOptions.value.length = 0;
                evaluatorOptions.value.push.apply(evaluatorOptions.value, ['equals', 'greater than', 'less than']);
            } else {
                evaluatorOptions.value.length = 0;
                evaluatorOptions.value.push.apply(evaluatorOptions.value, ['equals']);
            }
        } else { // selectedSearchType is a date
            evaluatorOptions.value.length = 0;
            evaluatorOptions.value.push.apply(evaluatorOptions.value, ['equals', 'greater than', 'less than']);
        }
        loading.value = false;
    };

    const selectionFilterFn = (val: string, update: any, abort: any) => {
        update(() => {
            if (val !== '') {
                searchOptions.value = sourceSearchOptions.value.filter( (option: any) => {
                    return option.toString().toLowerCase().includes(val.toLowerCase());
                });
            } else {
                searchOptions.value = sourceSearchOptions.value;
            }
            return;
        });
    };

    const getSearchResults = async () => {
        loading.value = true;
        selectedSearchResults.value.length = 0;
        const searchOption = selectedSearchOption.value === 'null' ? null : selectedSearchOption.value;

        const tripSearchResults: any = await masterDB.view(
            'obs_web',
            'wcgop_trips_compound_fields',
            {
                reduce: false,
                include_docs: false,
                inclusive_end: true,
                start_key: [selectedSearchType.value, evaluator.value === 'less than' ? null :
                ['departureDate', 'returnDate'].includes(selectedSearchType.value) ? moment(searchOption).hour(0).minute(0).second(0).format() : searchOption ],
                end_key: [selectedSearchType.value, evaluator.value === 'greater than' ? {} :
                ['departureDate', 'returnDate'].includes(selectedSearchType.value) ? moment(searchOption).hour(23).minute(59).second(59).format() : searchOption ]
            } as any
        );
        selectedSearchResults.value.push.apply(selectedSearchResults.value, tripSearchResults.rows.map( (row: any) => row.value ));
        const operationSearchResults: any = await masterDB.view(
            'obs_web',
            'wcgop_operations_compound_fields',
            {
                reduce: false,
                include_docs: false,
                inclusive_end: true,
                start_key: [selectedSearchType.value, evaluator.value === 'less than' ? null :
                ['departureDate', 'returnDate'].includes(selectedSearchType.value) ? moment(searchOption).hour(0).minute(0).second(0).format() : searchOption ],
                end_key: [selectedSearchType.value, evaluator.value === 'greater than' ? {} :
                ['departureDate', 'returnDate'].includes(selectedSearchType.value) ? moment(searchOption).hour(23).minute(59).second(59).format() : searchOption ]
            } as any
        );
        const tripIds = [
                        ...new Set(
                            operationSearchResults.rows.map(
                                (row: any) => {
                                    return row.value;
                                }
                            )
                        )
                      ];
        const keys = tripIds.map( (row: any) => {
            return ['tripId', row];
        });

        const tripsFromOperations: any = await masterDB.view(
            'obs_web',
            'wcgop_trips_compound_fields',
            {
                reduce: false,
                include_docs: false,
                inclusive_end: true,
                keys
            } as any
        );

        selectedSearchResults.value.push.apply(selectedSearchResults.value, tripsFromOperations.rows.map( (row: any) => row.value ));
        context.emit('update:val', selectedSearchResults.value);
        loading.value = false;
    };

    const getOptionLabel = (opt: string) => {
        if (opt === '') {
            return '';
        } else {
            return moment(opt).format('MM/DD/YYYY');
        }
    };

    const watcherOptions: WatchOptions = {
      immediate: true, deep: false
    };

    watch(
        () => selectedSearchType.value,
        (newVal, oldVal) => {
            if (newVal !== '') {
                getSearchOptions();
                selectedSearchResults.value.length = 0;
                selectedSearchOption.value = '';
            }
        },
        watcherOptions
    );

    watch(
        () => selectedSearchOption.value,
        (newVal, oldVal) => {
            // if (newVal !== '') {
                selectedSearchResults.value.length = 0;
                getSearchResults();
            // }
        },
        watcherOptions
    );

    watch(
        () => evaluator.value,
        (newVal, oldVal) => {
            if (selectedSearchOption.value) {
                selectedSearchResults.value.length = 0;
                getSearchResults();
            }
        },
        watcherOptions
    );


    watch(
        () => props.val as any,
        (newVal, oldVal) => {
            if (newVal.length === 0 && oldVal && oldVal.length !== 0) {
                selectedSearchType.value = '';
                selectedSearchOption.value = '';
                selectedSearchResults.value.length = 0;
            }
        },
        watcherOptions
    );


    onMounted(() => {
      getSearchTypes();
    });

    return {
        evaluator, evaluatorOptions, getOptionLabel, loading, searchTypes, selectedSearchType, searchOptions, selectedSearchOption, selectedSearchResults, selectionFilterFn
    };
  }
});
</script>

<style scoped>

</style>