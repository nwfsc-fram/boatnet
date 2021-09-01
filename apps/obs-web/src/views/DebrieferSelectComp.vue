<template>
  <q-select
    v-model="valueHolder"
    :options="filteredOptions"
    :label="label"
    use-input
    hide-selected
    fill-input
    @input="select"
    @clear="clear"
    @filter="filterFn"
    :filled="filled"
    :label-color="color"
    :rules="rules"
    clearable
    clear-icon="close"
  >
      <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                <div>
                  {{ emptyMessage ? emptyMessage : 'No item found' }}
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
import {baseLookupInfoo} from '@boatnet/bn-common';

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
    const valueHolder: any = ref(props.val);
    const filteredOptions: any = ref(null);
    const masterDB: Client<any> = couchService.masterDB;

    const watcherOptions: WatchOptions = {
      immediate: true
    };

    watch(() => props.lookupQueryOptions, getOptions, watcherOptions);

    async function getOptions() {
      const c = {
        view: get(props, 'lookupView', ''),
        label: get(props, 'lookupLabel', ''),
        value: get(props, 'lookupValue', ''),
        queryOptions: get(props, 'lookupQueryOptions', {})

      }
      const m = {
        collection: '',
        label: '',
        value: ''
      }
      options.value = await baseLookupInfoo.getLookups(c, m, false);
    }

    async function filterFn(val: any, update: any) {
      if (options.value === null) {
        await getOptions();
      }
      update(() => {
        const needle = val.toLowerCase();
        filteredOptions.value = filter(options.value, (option: any) => {
          const currLabel = get(option, 'label').toString().toLowerCase();
          return currLabel.includes(needle);
        });
      });
    }

    function select(value: any) {
      const val = get(value, 'value');
      context.emit('update:val', val);
      context.emit('select', val);
    }

    function clear(val: any) {
      context.emit('clear');
    }

    return {
      clear,
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