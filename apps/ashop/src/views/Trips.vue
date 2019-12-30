<template>
  <q-page>
    <boatnet-summary
      currentScreen="Trip"
      :current="currentTrip"
      :selectionId="currentTrip? currentTrip['tripNum'] : 0"
      @add="addTrip"
      @edit="editTrip"
      @delete="deleteTrip"
      @goTo="goToHauls"
      @end="end"
    >
      <template v-slot:table>
        <boatnet-table
          v-if="tripSettings.columns"
          :data="data"
          :settings="tripSettings"
          @select="handleSelectTrip"
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
  getCruise,
  getTrips,
  updateCruise,
  deleteCruise
} from '../helpers/cruiseInfo';
import { allDocs } from '../helpers/queries';

export default createComponent({
  setup(props, context) {
    const router = context.root.$router;
    const store = context.root.$store;
    const db = pouchService.db;

    const tripSettings = store.state.appSettings.appConfig.trips;
    const appMode = store.state.appSettings.appMode;

    const currentTrip = computed({
      get: () => {
        const curr = store.getters['tripsState/currentTrip'];
        return curr;
      },
      set: (trip: BaseTrip) => store.dispatch('tripsState/setCurrentTrip', trip)
    });

    const init = async () => {
      const rows = await allDocs({}, pouchService.userDBName);
      if (appMode === 'ashop') {
        await getCruise(appMode, rows);
        return await getTrips();
      } else {
        return rows.filter((row: any) => row.type === appMode + '-trip');
      }
    };
    const { data } = useAsync(init);

    const addTrip = async () => {
      const tripNum: number = data.value[0] ? data.value[0].tripNum + 1 : 1;
      const type: string = appMode + '-trip';
      const trip: BaseTrip = { tripNum, type };
      await pouchService.db
        .post(trip)
        .then((response: any) => {
          trip._id = response.id;
          trip._rev = response.rev;
        });
      store.dispatch('tripsState/setCurrentTrip', trip);
      if (appMode === 'ashop' && trip._id) {
        updateCruise(trip._id);
      }
      goToTripDetails(tripNum);
    };

    const editTrip = () => {
      const tripNum = store.state.tripsState.currentTrip.tripNum;
      goToTripDetails(tripNum);
    };

    const deleteTrip = async () => {
      const id = store.state.tripsState.currentTrip._id;
      if (appMode === 'ashop') {
        deleteCruise(id);
      }
      const del = data.value.findIndex((i: any) => i.id === id);
      data.value.splice(del, 1);
      pouchService.db.remove(store.state.tripsState.currentTrip);
      store.dispatch('tripsState/setCurrentTrip', undefined);
    };

    const goToHauls = () => {
      router.push({ path: '/hauls/' });
    };

    const goToTripDetails = (tripNum: number) => {
      router.push({ path: '/tripdetails/' + tripNum });
    };

    const end = () => {
      const tripNum = store.state.tripsState.currentTrip.tripNum;
      router.push({ path: '/endtrip/' + tripNum });
    };

    const handleSelectTrip = (trip: any) => {
      if (trip) {
        store.dispatch('tripsState/setCurrentTrip', trip);
      } else {
        store.dispatch('tripsState/setCurrentTrip', undefined);
      }
    };

    return {
      tripSettings,
      currentTrip,
      addTrip,
      editTrip,
      deleteTrip,
      goToHauls,
      handleSelectTrip,
      end,
      data
    };
  }
});
</script>
