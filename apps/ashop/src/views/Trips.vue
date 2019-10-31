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
        >
          <template v-slot:default="rowVals">
            <q-td
              v-for="column of tripSettings.columns"
              :align="column.align"
              :key="column.name"
              :style="{ width: column.width, whiteSpace: 'normal' }"
            >{{ getValue(rowVals.row.doc, column) }}</q-td>
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
import { BaseTrip, AshopCruise, CouchID } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { useAsync } from 'vue-async-function';
import { get, remove } from 'lodash';

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

    const init = async () => {
      const docs = await db.allDocs(pouchService.userDBName);
      const rows = docs.rows;
      if (appMode === 'ashop') {
        cruise = rows.filter((row: any) => row.doc.type === 'ashop-cruise');
        cruise = cruise[0] ? cruise[0].doc : undefined;
        const tripIds = cruise ? cruise.trips : [];
        const queryOptions = {
          keys: tripIds,
          descending: true
        };
        try {
          const result = await pouchService.db.allDocs(
            pouchService.userDBName,
            queryOptions
          );
          return result.rows;
        } catch (error) {
          console.log(error);
        }
      } else {
        return rows.filter((row: any) => row.doc.type === appMode + '-trip');
      }
    };
    const { data } = useAsync(init);

    // TODO
    // 1. call cruise API to generate friendly cruiseNum
    // 2. Find a way to indicate which cruise is active on the userDB. Either remove
    // all inactive data each time a cruise ends. Or add a column that
    // indicates whether cruise is active.
    const updateCruise = async (tripId: CouchID) => {
      if (cruise) {
        cruise.trips ? cruise.trips.push(tripId) : (cruise.trips = [tripId]);
        db.put(pouchService.userDBName, cruise);
      } else {
        const newCruise = { type: 'ashop-cruise', trips: [tripId] };
        db.post(pouchService.userDBName, newCruise);
      }
    };

    const addTrip = async () => {
      const tripNum = data.value[0] ? data.value[0].doc.tripNum + 1 : 1;
      const type = appMode + '-trip';
      const trip: BaseTrip = { tripNum, type };
      await pouchService.db
        .post(pouchService.userDBName, trip)
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

    const deleteCruise = async (tripId: CouchID) => {
      if (cruise.trips) {
        remove(cruise.trips, (n: string) => n === tripId);
      }
      db.put(pouchService.userDBName, cruise).then((response: any) => {
        cruise._id = response.id;
        cruise._rev = response.rev;
      });
    };

    const deleteTrip = async () => {
      const id = store.state.tripsState.currentTrip._id;
      if (appMode === 'ashop') {
        deleteCruise(id);
      }
      const del = data.value.findIndex((i: any) => i.id === id);
      data.value.splice(del, 1);
      pouchService.db.remove(
        pouchService.userDBName,
        store.state.tripsState.currentTrip
      );
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
        delete trip.doc.__index;
        store.dispatch('tripsState/setCurrentTrip', trip.doc);
      } else {
        store.dispatch('tripsState/setCurrentTrip', undefined);
      }
    };

    const getValue = (row: any, attribute: any) => {
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
      end,
      getValue,
      data
    };
  }
});
</script>
