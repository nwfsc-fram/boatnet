<template>
  <div>
    <div v-if="showPopout" style="text-align: right">
      <q-icon name="open_in_new" size="md" v-on:click="openNewDebriefingTab" />
    </div>
    <div>
      Filters:
      <q-chip
        v-for="filter of filters"
        :key="filter.label"
        removable
        color="primary"
        text-color="white"
        icon="directions_boat"
        @remove="remove(filter)"
      >{{ filter.label }}</q-chip>
    </div>
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="bg-grey-3 text-black"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="trips" label="Trips" />
          <q-tab name="operations" label="Hauls" />
          <q-tab name="catch" label="Catch" />
          <q-tab name="catchSpecies" label="Biospecimens" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="trips">
            <app-debriefer-trips :isFullSize="isFullSize"></app-debriefer-trips>
          </q-tab-panel>

          <q-tab-panel name="operations">
            <app-debriefer-operations :isFullSize="isFullSize"></app-debriefer-operations>
          </q-tab-panel>

          <q-tab-panel name="catch">
            <app-debriefer-catches :isFullSize="isFullSize"></app-debriefer-catches>
          </q-tab-panel>

          <q-tab-panel name="catchSpecies">
            <app-debriefer-biospecimens :isFullSize="isFullSize"></app-debriefer-biospecimens>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>


<script lang="ts">
import {
  createComponent,
  reactive,
  computed,
  ref,
  watch
} from '@vue/composition-api';
import moment from 'moment';
import { AshopCruise } from '@boatnet/bn-models';
import { newCruiseApiTrip } from '@boatnet/bn-common';
import { pouchService } from '@boatnet/bn-pouch';
import { get, set, findIndex } from 'lodash';

export default createComponent({
  props: {
    showErrors: Boolean,
    showPopout: Boolean,
    startingTab: String,
    isFullSize: Boolean
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const tab: any = ref('');

    const filters: any = ref([]);

    watch(() => state.debriefer.trips, update);
    watch(() => state.debriefer.operations, update);
    watch(() => state.debriefer.evaluationPeriod, setToTripTab);

    function initTab() {
      tab.value = props.startingTab;
    }
    initTab();

    function setToTripTab() {
      tab.value = 'trips';
    }

    function update() {
      filters.value = [];
      filters.value = filters.value.concat(updateFilter(state.debriefer.trips, 'Trip', 'legacy.tripId'));
      filters.value = filters.value.concat(updateFilter(state.debriefer.operations, 'Haul', 'operationNum'));
      setToTripTab();
    }

    function updateFilter(list: any[], label: string, idLabel: string) {
      const filterVals = [];
      for (const val of list) {
        const id = get(val, idLabel);
        if (label === 'Haul') {
          val.label = 'Trip: ' + get(val, 'legacy.tripId') + ' ' + label + ': ' + id;
        } else {
          val.label = label + ': ' + id;
        }
        filterVals.push(val);
      }
      return filterVals;
    }

    function remove(item: any) {
      let index = -1;
      const trips = state.debriefer.trips;
      const operations = state.debriefer.operations;

      if (item.type === 'wcgop-trip') {
        index = findIndex(trips, item);
        trips.splice(index, 1);
        store.dispatch('debriefer/updateTrips', trips);
      } else if (item.type === 'wcgop-operation') {
        index = findIndex(operations, item);
        operations.splice(index, 1);
        store.dispatch('debriefer/updateOperations', operations);
      }
    }

    function openNewDebriefingTab() {
      const route = '/table/' + tab.value;
      window.open(route, '_blank');
      context.emit('update:showErrors', false);
    }

    return {
      tab,
      openNewDebriefingTab,
      filters,
      remove
    };
  }
});
</script>