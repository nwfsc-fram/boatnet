<template>
  <div>
    <div id="expand-box">
      <div id="expand-box-header">
        <div style="float: left">
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
        <q-icon
          v-if="showPopout"
          style="float: right"
          name="open_in_new"
          size="md"
          v-on:click="openNewDebriefingTab"
        />
      </div>
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
          <q-tab name="biospecimens" label="Biospecimens" />
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
            <app-debriefer-catches :isFullSize="isFullSize" @changeTab="updateTab"></app-debriefer-catches>
          </q-tab-panel>

          <q-tab-panel name="biospecimens">
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
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

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
    const masterDB: Client<any> = couchService.masterDB;

    watch(() => state.debriefer.trips, update);
    watch(() => state.debriefer.evaluationPeriod, setToTripTab);

    updateTab(props.startingTab ? props.startingTab : '');

    function updateTab(tabName: string) {
      tab.value = tabName;
    }

    function setToTripTab() {
      tab.value = 'trips';
    }

    function update() {
      filters.value = [];
      filters.value = filters.value.concat(
        updateFilter(state.debriefer.trips, 'Trip', 'legacy.tripId')
      );
      getOperations();
    }

    function updateFilter(list: any[], label: string, idLabel: string) {
      const filterVals = [];
      for (const val of list) {
        const id = get(val, idLabel);
        if (label === 'Haul') {
          val.label =
            'Trip: ' + get(val, 'legacy.tripId') + ' ' + label + ': ' + id;
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
        if (trips.length === 0) {
          setToTripTab();
        }
        store.dispatch('debriefer/updateTrips', trips);
      }
    }

    // fetch operation docs for selected trips
    async function getOperations() {
      let operationIds: any[] = [];
      let operations: any[] = [];
      for (const trip of state.debriefer.trips) {
        operationIds = operationIds.concat(trip.operationIDs);
      }

      if (operationIds.length > 0) {
        try {
          const operationOptions: ListOptions = {
            keys: operationIds
          };
          const operationDocs = await masterDB.listWithDocs(operationOptions);
          operations = operationDocs.rows;
          operations.sort((a: any, b: any) => {
            if (a.legacy.tripId !== b.legacy.tripId) {
              return a.legacy.tripId - b.legacy.tripId;
            } else if (a.legacy.tripId === b.legacy.tripId) {
              return a.operationNum - b.operationNum;
            } else {
              return 0;
            }
          });
        } catch (err) {
          console.log('cannot fetch operation docs ' + err);
        }
      }
      store.dispatch('debriefer/updateOperations', operations);
    }

    function openNewDebriefingTab() {
      const route = '/observer-web/table/' + tab.value;
      window.open(route, '_blank');
      context.emit('update:showErrors', false);
    }

    return {
      tab,
      updateTab,
      openNewDebriefingTab,
      filters,
      remove
    };
  }
});
</script>

<style >
#expand-box {
  width: 100%;
  padding: 0;
  margin: 7px 0 0 0;
}

#expand-box-header {
  margin: 0;
  padding: 0 0 3px 2px;
  overflow: auto;
}

#expand_box_sub_header {
  clear: both;
}
</style>