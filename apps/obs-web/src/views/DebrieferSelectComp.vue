<template>
  <q-select
    use-input
    v-model="valueHolder"
    :options="options"
    :label="label"
    @filter="filter"
    @input="select"
    fill-input
    hide-selected
    clearable
  />
</template>
<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch
} from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { useAsync } from 'vue-async-function';
import Vue, { WatchOptions } from 'vue';
import { get } from 'lodash';

export default createComponent({
  props: {
    label: String,
    val: Object,
    lookupView: String,
    lookupLabel: String,
    lookupValue: String,
    lookupQueryOptions: Object
  },

  setup(props, context) {
    const options: any = ref([]);
    let filterList: any[] = [];

    const watcherOptions: WatchOptions = {
      immediate: true
    };

    const valueHolder = computed({
      get: () => {
        return props.val ? props.val : {};
      },
      set: (value: any) => {
        context.emit('update:val', value);
      }
    });

    watch(() => props.lookupQueryOptions, populateLookups, watcherOptions);

    function select(input: any) {
      if (input && input.value) {
        context.emit('select', input.value);
      } else {
        context.emit('select', null);
      }
    }

    function filter(val: any, update: any) {
      update(() => {
        const needle = val.toLowerCase();
        options.value = filterList.filter(
          (v: any) =>
            v.label
              .toString()
              .toLowerCase()
              .indexOf(needle) > -1
        );
      });
    }

    async function getLookups(
      view: string,
      label: string,
      value: string,
      queryOptions: any
    ) {
      const lookupVals: any[] = [];
      const masterDB: Client<any> = couchService.masterDB;
      try {
        const results = await masterDB
          .view<any>('obs_web', view, queryOptions)
          .then((response: any) => {
            for (const row of response.rows) {
              lookupVals.push({ label: get(row, label), value: row[value] });
            }
            lookupVals.sort((a: any, b: any) => {
              if (a.label > b.label) {
                return 1;
              }
              if (b.label > a.label) {
                return -1;
              }
              return 0;
            });
          });
        options.value = lookupVals;
        filterList = lookupVals;
      } catch (err) {
        console.log(err);
      }
    }

    async function populateLookups() {
      const view = props.lookupView ? props.lookupView : '';
      const llabel = props.lookupLabel ? props.lookupLabel : '';
      const llvalue = props.lookupValue ? props.lookupValue : '';
      const lQueryOptions = props.lookupQueryOptions
        ? props.lookupQueryOptions
        : {};
      return await getLookups(view, llabel, llvalue, lQueryOptions);
    }
    useAsync(populateLookups);

    return {
      select,
      filter,
      options,
      valueHolder
    };
  }
});
</script>