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

        <boatnet-keyboard-select-list
         v-if="config.type === 'input'"
         :value.sync="trip[config.modelName]"
         :config="config"
         :model="trip"
         class="q-ma-sm"
        ></boatnet-keyboard-select-list>
      </div>
    </div>

    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Trip Details: {{ trip }}</div>
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

    const trip = ref({});

    return {
      appConfig,
      name,
      trip
    };
  }
});
</script>
