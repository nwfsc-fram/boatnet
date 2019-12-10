<template>
  <div class="q-pt-lg">
    <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 400px;">
      <div
        v-for="config of appConfig.tripAttributes"
        :key="appConfig.tripAttributes.indexOf(config)"
      >
        <boatnet-common-input-component :config="config" :model="trip" @save="saveOnUpdate"></boatnet-common-input-component>
      </div>
    </div>

    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Trip Details: {{ trip }}</div>

    <div class="row q-gutter-sm fixed-bottom q-pa-md justify-end">
      <q-btn color="primary" icon="play_arrow" label="Go to Hauls" @click="goToHauls" />
    </div>
  </div>
</template>

<style>
</style>

<script lang="ts">
import { createComponent, reactive } from '@vue/composition-api';

export default createComponent({
  setup(props, context) {
    const router = context.root.$router;
    const store = context.root.$store;
    const appConfig = context.root.$store.state.appSettings.appConfig;
    const trip = reactive(context.root.$store.state.tripsState.currentTrip);

    const saveOnUpdate = async () => {
      store.dispatch('tripsState/save', trip);
    };

    const goToHauls = () => {
      router.push({ path: '/hauls/' });
    };

    return {
      appConfig,
      trip,
      saveOnUpdate,
      goToHauls
    };
  }
});
</script>
