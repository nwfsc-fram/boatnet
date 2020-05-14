<template>
  <multiselect
    style="width: 400px"
    v-model="valueHolder"
    :placeholder="label"
    :options="options"
    :multiple="multiple ? true : false"
    label="label"
    trackBy="value"
    @input="select"
    :limit="2"
    :limit-text="limitText"
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
import Multiselect from 'vue-multiselect';

Vue.component('multiselect', Multiselect);

export default createComponent({
  props: {
    label: String,
    val: Array,
    lookupView: String,
    lookupLabel: String,
    lookupValue: String,
    lookupQueryOptions: Object,
    multiple: Boolean
  },

  setup(props, context) {
    const options: any = ref([]);
    let filterList: any[] = [];

    const watcherOptions: WatchOptions = {
      immediate: true
    };

    const valueHolder = computed({
      get: () => {
        return props.val;
      },
      set: (value: any) => {
        if (!props.multiple) {
          value = value ? [value] : [];
        }
        context.emit('update:val', value);
      }
    });

    watch(() => props.lookupQueryOptions, populateLookups, watcherOptions);

    function limitText(count: number) {
      return 'and ' + count + ' more';
    }

    function select(values: any) {
      if (props.multiple) {
        const ids: string[] = [];
        for (let val of values) {
          ids.push(val.value);
        }
        context.emit('select', ids);
      } else {
        values = values ? values.value : values;
        context.emit('select', values);
      }
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
      limitText,
      options,
      valueHolder
    };
  }
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>