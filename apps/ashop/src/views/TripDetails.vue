<template>
  <div>
    <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 400px;">
      <div
        v-for="config of appConfig.tripAttributes"
        :key="appConfig.tripAttributes.indexOf(config)"
      >
        <boatnet-datetime-prime
          v-if="config.type === 'dateTime'"
          :date.sync="trip[config.modelName]"
          :config="config"
          :model="trip"
        ></boatnet-datetime-prime>

        <boatnet-keyboard-select-list
         v-if="config.type === 'input'"
         :value.sync="trip[config.modelName]"
         :config="config"
         :model="trip"
         @save="saveOnUpdate"
        ></boatnet-keyboard-select-list>

        <boatnet-button-toggle-comp
         v-if="config.type === 'toggle'"
         :value.sync="trip[config.modelName]"
         :config="config"
         @save="saveOnUpdate">
        </boatnet-button-toggle-comp>
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

import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { WcgopTrip } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const appConfig = context.root.$store.state.appSettings.appConfig;
    const trip = reactive(context.root.$store.state.tripsState.currentTrip);

    const test = (attribute: string, event: any) => {
      const fields: string[] = attribute.split('.');
      let value: any = sampleTrip;
      for (let i = 0; i < fields.length - 1; i++) {
        value = value[fields[i]];
      }
    };

    const saveOnUpdate = async () => {
      if (trip._id) {
      } else {
        await pouchService.db
          .post(pouchService.userDBName, trip)
          .then((response: any) => {
            trip._id = response.id;
            trip._rev = response.rev;
          });
      }
      store.dispatch('tripsState/save', trip);
    };

    return {
      saveOnUpdate,
      appConfig,
      name,
      trip,
      test
    };
  }
});
</script>
