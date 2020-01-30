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
import { getCruise } from '../helpers/cruiseInfo';
import { useAsync } from 'vue-async-function';
import moment from 'moment';
import { AshopCruise } from '@boatnet/bn-models';

export default createComponent({
  setup(props, context) {
    const store: any = context.root.$store;
    const showDeleteDialog: boolean = false;
    const deleteMessage: string = 'Are you sure you want to end cruise? '
                                + 'This will archieve the data and clear it from the tablet. '
                                + 'You will no longer be able to edit the data once this action is complete.';


    const appConfig = computed({
      get: () => {
        const currConfig = store.state.appSettings.appConfig.cruise;
        return currConfig ? currConfig : {};
      },
       set: (val) => undefined
      });

    const cruise: AshopCruise = computed({
      get: () => {
        const currCruise = store.state.tripsState.currentCruise;
        return currCruise ? currCruise : { type: 'ashop-cruise', cruiseNum: 0 };
      },
      set: (val) => undefined
    });


    async function onDelete() {
      cruise.value.endDate = moment().utc().format();
      await store.dispatch('tripsState/save', cruise.value);
      // TODO archive data and clear from tablet.
      // Also need to think about how we will archive if there is no internet connection
      console.log('deleting');
    }

    function saveOnUpdate() {
      store.dispatch('tripsState/save', cruise);
    }

    return {
      appConfig,
      saveOnUpdate,
      cruise,
      showDeleteDialog,
      deleteMessage,
      onDelete
    };
  }
});
</script>
