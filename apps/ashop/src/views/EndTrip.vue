<template>
  <div>
    <div class="text-h4 text-center q-pa-md">End Trip # {{trip.tripNum}}</div>
    <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 400px;">
      <div
        v-for="config of appConfig.endTripAttributes"
        :key="appConfig.endTripAttributes.indexOf(config)"
      >
        <boatnet-common-input-component :config="config" :model="trip" @save="saveOnUpdate"></boatnet-common-input-component>
      </div>
    </div>

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
    const appConfig = store.state.appSettings.appConfig;
    const trip = reactive(store.state.tripsState.currentTrip);

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
