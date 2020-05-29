<template>
  <div :style="compStyle">
    <div>
      <b>{{title}}</b>
    </div>
    <q-btn
      v-if="value"
      :label="value.description ? value.description : value"
      :color="getColor"
      :text-color="getTextColor"
      @click="getNextIndex"
      class="full-width"
    ></q-btn>
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  computed,
  onMounted
} from '@vue/composition-api';
import { getOptions, formatDisplayValue } from '../helpers/getLookupsInfo';
import { get, set } from 'lodash';

export default createComponent({
  props: {
    title: String,
    docType: String,
    displayFields: Array,
    val: [String, Object],
    options: Array,
    compStyle: String
  },
  setup(props, context) {
    const options: any = [];
    const value: any = ref(props.val);
    const docType = props.docType ? props.docType : '';
    const store: any = context.root.$store;
    const appConfig = store.state.appSettings.appConfig;
    const index: any = ref(0);

    const getNextIndex = () => {
      if (index.value === options.length - 1) {
        index.value = 0;
      } else {
        index.value += 1;
      }
      value.value = options[index.value];
      context.emit('update:val', value.value);
      context.emit('save');
    };

    const getColor = computed(() => {
      if (index.value % 2) {
        return 'white';
      } else {
        return 'primary';
      }
    });

    const getTextColor = computed(() => {
      if (index.value % 2) {
        return 'primary';
      } else {
        return 'white';
      }
    });

    onMounted(async () => {
      if (props.options) {
        for (const option of props.options) {
          options.push(option);
        }
      } else {
        const results = await getOptions(
          appConfig.survey,
          docType,
          'lookups',
          props.displayFields
        );
        for (const result of results) {
          options.push(result.doc);
        }
      }
      value.value = options[0];
    });

    return {
      value,
      index,
      getNextIndex,
      getColor,
      getTextColor
    };
  }
});
</script>

<style scoped>
</style>