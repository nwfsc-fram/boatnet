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
        ></q-select>
        <q-select
            class="col"
            label="Is"
            dense
            outlined
            options-dense
            :options="['equals', 'greater than', 'less than']"
            v-model="evaluator"
        ></q-select>
        <q-select
            v-if="['departureDate', 'returnDate'].includes(selectedSearchType)"
            class="col"
            label="Date Selection"
            outlined
            dense
            options-dense
            use-input
            :options="searchOptions"
            v-model="selectedSearchOption"
            @filter="selectionFilterFn"
            clearable
            :display-value="getOptionLabel(selectedSearchOption)"
            :option-label="opt => getOptionLabel(opt)"
            :option-value="opt => opt"
        >
            <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="dateFormatter">
                    <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                    </q-date>
                </q-popup-proxy>
                </q-icon>
            </template>
        </q-select>
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

import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
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

    const getSearchTypes = async () => {
      const results = await masterDB.view(
        'obs_web',
        'wcgop_trips_compound_fields',
        {reduce: true, include_docs: false, group_level: 1} as any
      );
      searchTypes.value.push.apply(searchTypes.value, results.rows.map( (row: any) => row.key[0]));
    };

    const getSearchOptions = async () => {
        loading.value = true;
        sourceSearchOptions.value.length = 0;
        const searchOptionResults = await masterDB.view(
            'obs_web',
            'wcgop_trips_compound_fields',
            {reduce: true, include_docs: false, start_key: [selectedSearchType.value], end_key: [selectedSearchType.value, {}], group_level: 2} as any
        );
        sourceSearchOptions.value.push.apply(sourceSearchOptions.value, [...new Set(searchOptionResults.rows.map( (row: any) => {
            if (row.key[1] === null || row.key[1] === undefined) {
                return 'null';
            } else if (['departureDate', 'returnDate'].includes(selectedSearchType.value)) {
                return moment(row.key[1]).minute(0).hour(0).second(0).format();
            } else {
                return row.key[1];
            }
        }))]
        );
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

        const searchResults: any = await masterDB.view(
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
        selectedSearchResults.value.push.apply(selectedSearchResults.value, searchResults.rows.map( (row: any) => row.value ));
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

    const dateFormatter = ref('');

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
        () => dateFormatter.value,
        (newVal, oldVal) => {
            if (dateFormatter.value !== '') {
                selectedSearchOption.value = moment(dateFormatter.value).format();
            }
        },
        watcherOptions
    );

    onMounted(() => {
      getSearchTypes();
    });

    return {
        dateFormatter, evaluator, getOptionLabel, loading, searchTypes, selectedSearchType, searchOptions, selectedSearchOption, selectedSearchResults, selectionFilterFn
    };
  }
});
</script>

<style scoped>

</style>