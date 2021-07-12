<template>
  <q-select
    v-model="valueHolder"
    :options="filteredOptions"
    :label="label"
    use-input
    hide-selected
    fill-input
    @input="select"
    @filter="filterFn"
    :filled="filled"
    :label-color="color"
    :rules="rules"
    :option-label="(item) => get(item, lookupLabel)"
    :option-value="(item) => get(item, lookupValue)"
  >
      <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                <div>
                  {{ emptyMessage }}
                </div>
              </q-item-section>
            </q-item>
          </template>
  </q-select>
</template>
<script lang="ts">
import {
  createComponent,
  ref,
  watch
} from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { useAsync } from 'vue-async-function';
import Vue, { WatchOptions } from 'vue';
import { filter, get, orderBy } from 'lodash';
import Multiselect from 'vue-multiselect';

Vue.component('multiselect', Multiselect);

export default createComponent({
  props: {
    label: String,
    val: [String, Object],
    lookupView: String,
    lookupLabel: String,
    lookupValue: String,
    lookupQueryOptions: Object,
    multiple: Boolean,
    emptyMessage: String,
    filled: Boolean,
    color: String,
    rules: Array
  },

  setup(props, context) {
    const options: any = ref(null);
    const valueHolder: any = ref(null);
    const filteredOptions: any = ref(null);
    const masterDB: Client<any> = couchService.masterDB;

    const watcherOptions: WatchOptions = {
      immediate: true
    };

    watch(() => props.lookupQueryOptions, getOptions, watcherOptions);

    async function getOptions() {
      const queryOptions = get(props, 'lookupQueryOptions', {});
      const view = get(props, 'lookupView', '');
      options.value = await masterDB.viewWithDocs('obs_web', view, queryOptions);
      options.value = orderBy(options.value.rows, props.lookupLabel);

    }

    async function filterFn(val: any, update: any) {
      const label = get(props, 'lookupLabel', '');
      if (options.value === null) {
        await getOptions();
      }
      update(() => {
        const needle = val.toLowerCase();
        filteredOptions.value = filter(options.value, (option: any) => {
          const currLabel = get(option, label).toString().toLowerCase();
          return currLabel.includes(needle);
        });
      });
    }

    function select(value: any) {
      const lookupValue = get(props, 'lookupValue', '');
      const val = get(value, lookupValue);
      context.emit('update:val', val);
      context.emit('select', val);
    }

    return {
      select,
      filteredOptions,
      options,
      valueHolder,
      filterFn,
      get
    };
  }
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>