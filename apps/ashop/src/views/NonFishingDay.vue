<template>
  <div>
    <div class="text-h4 text-center q-pa-md">Non Fishing Day</div>
    <div style="display: flex; flex-flow: column wrap; height: 400px; width: 400px">
      <div v-for="config of appConfig.nonFishingDay" :key="appConfig.nonFishingDay.indexOf(config)">
        <boatnet-common-input-component :config="config" :model="haul" @save="saveOnUpdate"></boatnet-common-input-component>
      </div>
    </div>

    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Haul Details: {{ haul }}</div>
    </div>
</template>

<style>
</style>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { WcgopTrip } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { set } from 'lodash';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const appConfig = store.state.appSettings.appConfig;
    const haul = reactive({});

    // fetch from lookups list: https://github.com/nwfsc-fram/boatnet/issues/1007
    // also shouldn't use index to fetch item should use something to fetch based
    // off displayName or model
    appConfig.nonFishingDay[2].list = [
      'Streaming to/from grounds',
      'Weather',
      'Looking for fish',
      'Mechanical Breakdown',
      'Cleaning Factory',
      'Other (notes)'
    ];

    const saveOnUpdate = async () => {
      store.dispatch('tripsState/save', haul);
    };

    return {
      appConfig,
      haul,
      saveOnUpdate
    };
  }
});
</script>
