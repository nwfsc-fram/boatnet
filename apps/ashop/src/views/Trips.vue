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
        <boatnet-table v-if="tripSettings.columns" :data="tripData" :settings="tripSettings" @select="handleSelectTrip">
          <template v-slot:default="rowVals">
            <q-td v-for="column of tripSettings.columns" :align="column.align" :key="column.name" :style="{ width: column.width, whiteSpace: 'normal' }">
              {{ getValue(rowVals.row, column) }}
            </q-td>
          </template>
        </boatnet-table>
      </template>

      <template v-slot:goToButtons>
      </template>

    </boatnet-summary>
    
  </q-page>
</template>

<script lang="ts">
import { createComponent, ref, reactive, computed } from '@vue/composition-api';
import { getFormattedValue } from '../helpers/helpers';
import { sampleData, sampleTrip } from '../data/data';
import { BaseTrip } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

export default createComponent({
  setup(props, context) {
    const router = context.root.$router;
    const store = context.root.$store;

    const tripSettings = store.state.appSettings.appConfig.trips;
    const appMode = store.state.appSettings.appMode;
    let cruise;
    let tripData = [sampleTrip];

    const currentTrip = computed({
      get: () => {
        const curr = store.getters['tripsState/currentTrip'];
        return curr;
      },
      set: (trip: BaseTrip) =>
       store.dispatch('tripsState/setCurrentTrip', trip)
    });

    const getCruiseInfo = async () => {
      const db = pouchService.db;
      const docs = await db.allDocs(pouchService.userDBName);
      const rows = docs.rows;
      cruise = rows.filter( (row: any) => row.doc.type === 'ashop-cruise' );
      return cruise;
    };

    const updateCruiseInfo = async (trip: BaseTrip) => {
      const db = pouchService.db;
      let cruise = await getCruiseInfo();
      if (cruise.length === 0) {
        const newCruise = { type: 'ashop-cruise', trips: [trip] };
        db.post(pouchService.userDBName, newCruise);
      } else {
        cruise = cruise[0].doc;
        cruise.trips.push(trip);
        db.put(pouchService.userDBName, cruise);
      }
    };

    const getTrips = async () => {
      if (appMode === 'ashop') {
        // let cruise = await getCruiseInfo();
         //let trips = cruise ? cruise[0].doc.trips : [];
         //console.log(trips);

        //tripData = [sampleTrip];
      } else {
        return [sampleTrip];
      }
    };
    getTrips();
   

    const addTrip = () => {
      // lousy way of adding another trip, will modify when actually querying db for trips info
      const tripNum = store.state.tripsState.currentTrip.tripNum + 1;
      const type = appMode + '-trip';
      const trip: BaseTrip = { tripNum, type };
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
      router.push({path: '/hauls/'});
    };

    const goToTripDetails = (tripNum: number) => {
      router.push({path: '/tripdetails/' + tripNum});
    };

    const handleSelectTrip = (trip: any) => {
      if (trip) {
        store.dispatch('tripsState/setCurrentTrip', trip);
      } else {
        store.dispatch('tripsState/setCurrentTrip', undefined);
      }
    };

    const getValue = (row: any, attribute: any) => {
      const fields = attribute.field.split('.');
      let value = row;
      for (const field of fields) {
        value = value[field];
      }
      if (attribute.type) {
        return getFormattedValue(value, attribute.type, attribute.displayFormat);
      } else {
        return value;
      }
    };

    return {
      tripSettings,
      currentTrip,
      tripData,
      addTrip,
      editTrip,
      deleteTrip,
      goToHauls,
      handleSelectTrip,
      getValue
    };
  }
});
</script>
