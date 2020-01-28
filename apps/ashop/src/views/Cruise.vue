<template>
<div class="q-pa-lg">
    <div class="text-h4 text-center q-pa-md">Cruise #{{cruise.cruiseNum}} Info</div>
    <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 400px">
     <div v-for="config of appConfig.cruise" :key="appConfig.cruise.indexOf(config)">
        <boatnet-common-input-component :config="config" :model="cruise" @save="saveOnUpdate"></boatnet-common-input-component>
      </div>
    </div>
    <div class="row q-gutter-sm fixed-bottom q-pa-md justify-end">
    <q-btn color="primary" icon="check" label="End Deployment" :to="'/'"/>
    <q-btn class="q-ml-md" color="primary" icon="play_arrow" label="Go To Trips" :to="'/'"/>
    </div>

     <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Cruise: {{ cruise }}</div>
  </div>
</template>

<style>
</style>

<script lang="ts">
import { createComponent, reactive, computed } from '@vue/composition-api';
import { createCruise } from '../helpers/cruiseInfo';
import { useAsync } from 'vue-async-function';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const appConfig = computed({
      get: () => {
        const currConfig = store.state.appSettings.appConfig;
       return currConfig ? currConfig : {};
      },
       set: val => undefined
      })

    const cruise = computed({
      get: () => {
        const currCruise = store.state.tripsState.currentCruise;
        return currCruise ? currCruise : { type: 'ashop-cruise', cruiseNum: 0 };
      },
      set: val => undefined
    })
  
    const init = async () => {
      const newCruise = await createCruise();
      if (newCruise) {
        store.dispatch('tripsState/setCurrentCruise', newCruise);
      }
    };
    useAsync(init);

    function saveOnUpdate() {
      store.dispatch('tripsState/save', cruise);
    }

    return {
      appConfig,
      saveOnUpdate,
      cruise
    };
  }
});
</script>
