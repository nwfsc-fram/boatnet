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
          :data="nonFishingDays"
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
import { BaseTrip, AshopCruise, CouchID } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { useAsync } from 'vue-async-function';
import { get, remove } from 'lodash';
import {
  getDocByType,
  getTrips,
  addTripIdToCruise,
  removeTripIdFromCruise
} from '../helpers/cruiseInfo';
import { allDocs } from '../helpers/queries';
import moment from 'moment';

export default createComponent({
  setup(props, context) {
    const router = context.root.$router;
    const store = context.root.$store;
    const db = pouchService.db;

    const config = store.state.appSettings.appConfig.nonFishingTable;
    const cruise = store.state.tripsState.currentCruise;
    const nonFishingDays = cruise.nonFishingDays ? cruise.nonFishingDays : [];

    const currIndex = computed(() => store.getters['tripsState/currentNonFishingDay']);
    const friendlyIndex = currIndex.value + 1;

    function addNonFishingDay() {
      const occuredInTrip = false;
      const newFishingDay = reactive({ occuredInTrip });
      nonFishingDays.push(newFishingDay);

      // update cruise
      cruise.nonFishingDays = nonFishingDays;
      store.dispatch('tripsState/save', cruise);

      store.dispatch('tripsState/setCurrentNonFishingDay', nonFishingDays.length - 1);
      router.push({path: '/nonFishingDays/' + friendlyIndex });
    }

    function editNonFishingDay() {
      router.push({path: '/nonFishingDays/' + friendlyIndex });
    }

    function deleteNonFishingDay() {
      nonFishingDays.splice(currIndex.value, 1);

      // update cruise
      cruise.nonFishingDays = nonFishingDays;
      store.dispatch('tripsState/save', cruise);

      store.dispatch('tripsState/setCurrentNonFishingDay', -1);
    }

    function goToTrips() {
      router.push({ path: '/' });
    }

    function select(day: any) {
      const index = nonFishingDays.indexOf(day);
      store.dispatch('tripsState/setCurrentNonFishingDay', index);
    }

    return {
        nonFishingDays,
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
