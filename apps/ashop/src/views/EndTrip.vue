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

    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Trip Details: {{ trip }}</div>
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
    const trip = reactive(store.state.tripsState.currentTrip);

    const saveOnUpdate = async () => {
      store.dispatch('tripsState/save', trip);
    };

    return {
      appConfig,
      trip,
      saveOnUpdate
    };
  }
});
</script>
