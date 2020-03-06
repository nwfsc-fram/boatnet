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
    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Cruise Details: {{ cruise }}</div>
  </div>
</template>

<style>
</style>

<script lang="ts">
import { createComponent, reactive, computed, ref } from '@vue/composition-api';
import { getCruise } from '../helpers/cruiseInfo';
import moment from 'moment';
import { AshopCruise } from '@boatnet/bn-models';
import { newCruiseApiTrip } from '@boatnet/bn-common';
import { pouchService } from '@boatnet/bn-pouch';

export default createComponent({
  setup(props, context) {
    const store: any = context.root.$store;
    const router = context.root.$router;
    const showDeleteDialog: boolean = false;
    const deleteMessage: string = 'Are you sure you want to end this cruise? You will no '
                                + 'longer be able to access and edit this data. '
                                + 'The data will be archived and hidden from view.';

    const cruiseState = store.state.tripsState.currentCruise;
    const cruise = cruiseState ? ref(cruiseState)
                             : ref({ type: 'ashop-cruise', cruiseNum: 0, isActive: true });

    const appConfig = computed({
      get: () => {
        const currConfig = store.state.appSettings.appConfig.cruise;
        return currConfig ? currConfig : {};
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
      if (cruise.value.cruiseNum !== 0) {
        store.dispatch('tripsState/save', cruise.value);
      }
    }

    async function saveCruise() {
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
            // call cruiseAPI for new cruiseId
            await newCruiseApiTrip(newCruise).then( (res: any) => {
              cruise.value.cruiseNum = res.cruiseNum;
            });
            // create ashop cruise doc and save cruise along with cruiseId
            await pouchService.db.post(cruise.value).then((response: any) => {
              router.push({ path: '/' });
            });
      } else {
        router.push({ path: '/' });
      }
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
