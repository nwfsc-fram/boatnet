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
    >
      <template v-slot:table>
        <boatnet-table
          v-if="tripSettings.columns"
          :data="data"
          :settings="tripSettings"
          @select="handleSelectTrip"
        >
          <template v-slot:default="rowVals">
            <q-td
              v-for="column of tripSettings.columns"
              :align="column.align"
              :key="column.name"
              :style="{ width: column.width, whiteSpace: 'normal' }"
            >{{ getValue(rowVals.row, column) }}</q-td>
          </template>
        </boatnet-table>
      </template>

      <template v-slot:goToButtons></template>
    </boatnet-summary>
  </q-page>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { getFormattedValue } from '../helpers/helpers';
import { BaseTrip, AshopCruise } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { useAsync } from 'vue-async-function';
import { get } from 'lodash';

export default createComponent({
  setup(props, context) {
    const router = context.root.$router;
    const store = context.root.$store;
    const db = pouchService.db;

    const tripSettings = store.state.appSettings.appConfig.trips;
    const appMode = store.state.appSettings.appMode;
    let cruise: AshopCruise = {};

    const currentTrip = computed({
      get: () => {
        const curr = store.getters['tripsState/currentTrip'];
        return curr;
      },
      set: (trip: BaseTrip) => store.dispatch('tripsState/setCurrentTrip', trip)
    });

    const getTrips = async () => {
      const docs = await db.allDocs(pouchService.userDBName);
      const rows = docs.rows;
      if (appMode === 'ashop') {
        cruise = rows.filter((row: any) => row.doc.type === 'ashop-cruise');
        cruise = cruise[0] ? cruise[0].doc : undefined;
        return cruise ? cruise.trips : [];
      } else {
        return rows.filter((row: any) => row.doc.type === appMode + '-trip');
      }
    };
    const { data } = useAsync(getTrips);

    const updateCruiseInfo = async (trip: BaseTrip) => {
      if (cruise) {
        cruise.trips ? cruise.trips.push(trip) : (cruise.trips = [trip]);
        db.put(pouchService.userDBName, cruise);
      } else {
        const newCruise = { type: 'ashop-cruise', trips: [trip] };
        db.post(pouchService.userDBName, newCruise);
      }
    };

    const addTrip = async () => {
      const tripNum = data && data.value ? data.value.length + 1 : 1;
      const type = appMode + '-trip';
      const trip: BaseTrip = { tripNum, type };
      await pouchService.db
        .post(pouchService.userDBName, trip)
        .then((response: any) => {
          trip._id = response.id;
          trip._rev = response.rev;
        });
      store.dispatch('tripsState/setCurrentTrip', trip);
      if (appMode === 'ashop') {
        updateCruiseInfo(trip);
      }
      goToTripDetails(tripNum);
    };

    const editTrip = () => {
      const tripNum = store.state.tripsState.currentTrip.tripNum;
      goToTripDetails(tripNum);
    };

    const deleteTrip = () => {
      pouchService.db.remove(pouchService.userDBName, currentTrip);
      store.dispatch('tripsState/setCurrentTrip', undefined);
    };

    const goToHauls = () => {
      router.push({ path: '/hauls/' });
    };

    const goToTripDetails = (tripNum: number) => {
      router.push({ path: '/tripdetails/' + tripNum });
    };

    const handleSelectTrip = (trip: any) => {
      if (trip) {
        delete trip.doc.__index;
        store.dispatch('tripsState/setCurrentTrip', trip.doc);
      } else {
        store.dispatch('tripsState/setCurrentTrip', undefined);
      }
    };

    const getValue = (row: any, attribute: any) => {
      if (appMode !== 'ashop') {
        row = row.doc;
      }
      const value = get(row, attribute.field);
      if (attribute.type) {
        return getFormattedValue(
          value,
          attribute.type,
          attribute.displayFormat
        );
      } else {
        return value;
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
      getValue,
      data
    };
  }
});
</script>
