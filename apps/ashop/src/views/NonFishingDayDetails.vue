<template>
  <div class="q-pa-lg">
    <div class="text-h5 row justify-center">Non Fishing Day Info</div>
    <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 400px;">
      <div
        v-for="config of appConfig"
        :key="appConfig.indexOf(config)"
      >
        <boatnet-common-input-component :config="config" :model="nonFishingDay" @save="saveOnUpdate"></boatnet-common-input-component>
      </div>
    </div>

    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Info: {{ nonFishingDay }}</div>
  </div>
</template>

<style>
</style>

<script lang="ts">
import { createComponent, reactive } from '@vue/composition-api';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const appConfig = store.state.appSettings.appConfig.nonFishingDay;

    const currentState = store.state.tripsState;
    const cruise = currentState.currentCruise;
    const nonFishingDayIndex: number = Number(context.root.$route.params.nonFishingDayNum);
    const nonFishingDay = reactive(cruise.nonFishingDays[nonFishingDayIndex]);

    async function saveOnUpdate() {
      cruise.nonFishingDays[nonFishingDayIndex] = nonFishingDay;
      await store.dispatch('tripsState/save', cruise);
    }

    return {
      appConfig,
      nonFishingDay,
      saveOnUpdate
    };
  }
});
</script>
