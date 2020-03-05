<template>
  <div class="q-pa-lg">
    <div class="text-h4 text-center q-pa-md">Cruise #{{cruise.cruiseNum}} Info</div>
    <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 400px">
     <div v-for="config of appConfig" :key="appConfig.indexOf(config)">
        <boatnet-common-input-component :config="config" :model="cruise" @save="saveOnUpdate"></boatnet-common-input-component>
      </div>
    </div>
    <div class="row q-gutter-sm relative-bottom ">
      <q-btn color="primary" icon="check" label="End Cruise" @click="showDeleteDialog = true" />
      <q-space/>
      <q-btn class="q-ml-md" color="primary" icon="play_arrow" label="Go To Trips" @click="saveCruise"/>
    </div>
    <boatnet-warning-dialog
      :message="deleteMessage"
      :show.sync="showDeleteDialog"
      @confirm="onDelete"
      confirmationAction='Delete'
    />
  </div>
</template>

<style>
</style>

<script lang="ts">
import { createComponent, reactive, computed } from '@vue/composition-api';
import { getCruise } from '../helpers/cruiseInfo';
import moment from 'moment';
import { AshopCruise } from '@boatnet/bn-models';
import { newCruiseApiTrip } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const store: any = context.root.$store;
    const router = context.root.$router;
    const showDeleteDialog: boolean = false;
    const deleteMessage: string = 'Are you sure you want to end this cruise? You will no '
                                + 'longer be able to access and edit this data. '
                                + 'The data will be archived and hidden from view.';


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
    }

    function saveOnUpdate() {
      store.dispatch('tripsState/save', cruise.value);
    }

    async function saveCruise() {
      router.push({ path: '/' });
      if (cruise.value.cruiseNum === 0 &&
          cruise.value.vessel &&
          cruise.value.vessel.vesselName &&
          cruise.value.startDate) {

            const newCruise = {
              departureDate: cruise.value.startDate,
              returnDate: '',
              vesselId: cruise.value.vessel._id,
              vesselName: cruise.value.vessel.vesselName,
              createdDate: moment().format()
            };
            await newCruiseApiTrip(newCruise).then( (res: any) => {
              cruise.value.cruiseNum = res.cruiseNum;
            });
      }
      saveOnUpdate();
    }

    return {
      appConfig,
      saveOnUpdate,
      saveCruise,
      cruise,
      showDeleteDialog,
      deleteMessage,
      onDelete
    };
  }
});
</script>
