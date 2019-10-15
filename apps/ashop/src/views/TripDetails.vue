<template>
  <div>
    <div style="display: flex; flex-wrap: wrap; justify-content: center;">
      <div
        v-for="config of appConfig.tripAttributes"
        :key="appConfig.tripAttributes.indexOf(config)"
      >
        <boatnet-datetime-prime
          v-if="config.type === 'dateTime'"
          :date.sync="trip[config.modelName]"
          :config="config"
          :model="trip"
          class="q-ma-sm"
        ></boatnet-datetime-prime>
      </div>
    </div>

    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Trip Details: {{ trip }}</div>

    <div>
      <boatnet-keyboard-select-list
        :value.sync="name"
        label="Skipper's Name"
        keyboardType="compact"
        dense
        :list="list"
      />
    </div>

    <boatnet-keyboard-select-list
      :value.sync="name2"
      label="Name"
      keyboardType="numeric"
      dense
      :list="numericList"
    />

    <boatnet-keyboard-select-list
      :value.sync="name23"
      label="Name again"
      keyboardType="numeric"
      dense
    />
  </div>
</template>

<style>
</style>

<script lang="ts">
import { sampleData, sampleTrip } from '../data/data';

import { createComponent, ref, reactive } from '@vue/composition-api';

export default createComponent({
  setup(props, context) {
    context.root.$store._actions['tripsState/setCurrentTrip'][0](sampleTrip);
    const appConfig = context.root.$store.state.appSettings.appConfig;

    const name = ref('');
    const name2 = ref('');
    const name23 = ref('');

    const trip = ref({});

    const list = ['baby shark', 'mama shark', 'daddy shark', 'nemo', 'whale'];
    const numericList = ['1', 'two', '333', 'four', '5', 'six'];

    return {
      appConfig, name, name2, name23, trip, list, numericList
    };
  }
});
</script>
