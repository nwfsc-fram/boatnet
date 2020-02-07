<template>
  <q-page>
    <boatnet-summary
      currentScreen="Non Fishing Day"
      :current="currIndex !== -1 ? {} : undefined"
      :selectionId="currIndex + 1"
      @add="addNonFishingDay"
      @edit="editNonFishingDay"
      @delete="deleteNonFishingDay"
      @goTo="goToTrips"
    >
      <template v-slot:table>
        <boatnet-table
          v-if="config.columns"
          :data="data"
          :settings="config"
          @select="select"
        />
      </template>

      <template v-slot:goToButtons></template>
    </boatnet-summary>
  </q-page>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { pouchService } from '@boatnet/bn-pouch';
import { get, remove } from 'lodash';
import { getDocByType } from '../helpers/cruiseInfo';
import { useAsync } from 'vue-async-function';
import { AshopTrip } from '@boatnet/bn-models';

export default createComponent({
  setup(props, context) {
    const router = context.root.$router;
    const store = context.root.$store;
    const db = pouchService.db;

    const config = store.state.appSettings.appConfig.nonFishingTable;
    const cruise = store.state.tripsState.currentCruise;

    const currIndex: any = ref(-1);

    async function init() {
      const nonFishingDays = cruise.nonFishingDays ? cruise.nonFishingDays : [];
      // populate with tripNum
      const trips = await getDocByType('ashop', 'trip');
      nonFishingDays.forEach((noFishDay: any, index: number) => {
        if (noFishDay.tripId && trips.length > 0) {
          const trip = trips.find((element: AshopTrip) => element._id === noFishDay.tripId);
          nonFishingDays[index].tripNum = trip.tripNum;
        }
      });
      return nonFishingDays;
    }

    const { data } = useAsync(init);

    function addNonFishingDay() {
      const inTrip = false;
      const newFishingDay = reactive({ inTrip });
      data.value.push(newFishingDay);
      const newItemIndex: number = data.value.length - 1;

      // update cruise
      cruise.nonFishingDays = data.value;
      store.dispatch('tripsState/save', cruise);

      store.dispatch('tripsState/setCurrentCruise', cruise);
      router.push({path: '/nonFishingDays/' + newItemIndex });
    }

    function editNonFishingDay() {
      router.push({path: '/nonFishingDays/' + currIndex.value });
    }

    function deleteNonFishingDay() {
      data.value.splice(currIndex.value, 1);

      // update cruise
      cruise.nonFishingDays = data.value;
      store.dispatch('tripsState/save', cruise);
    }

    function goToTrips() {
      router.push({ path: '/' });
    }

    function select(day: any) {
      currIndex.value = data.value.indexOf(day);
    }

    return {
        data,
        config,
        addNonFishingDay,
        editNonFishingDay,
        deleteNonFishingDay,
        goToTrips,
        select,
        currIndex
    };
  }
});
</script>
