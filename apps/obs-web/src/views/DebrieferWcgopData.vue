<template>
  <div>
    <div id="expand-box">
      <div id="expand-box-header">
        <div style="float: left" v-if="filters.length > 0">
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

        <q-tab-panels v-model="tab" animated :keep-alive="true">
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
  ref,
  watch,
  onMounted
} from '@vue/composition-api';
import { get, set, findIndex, uniq, indexOf, filter } from 'lodash';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

export default createComponent({
  props: {
    showErrors: Boolean,
    startingTab: String,
    isFullSize: Boolean
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const tab: any = ref('');

    const filters: any = ref([]);
    const masterDB: Client<any> = couchService.masterDB;
    const jp = require('jsonpath');

    watch(() => state.debriefer.trips, update);
    watch(() => state.debriefer.selectedOperations, update);
    watch(() => state.debriefer.evaluationPeriod, setToTripTab);
    watch(() => state.debriefer.observer, setToTripTab);

    updateTab(props.startingTab ? props.startingTab : '');

    onMounted(async () => {
      // load column configurations from couch into state
      const result: any = await masterDB.viewWithDocs('obs_web', 'column-config', { key: state.user.activeUserAlias.personDocId });
      if (result.rows.length > 0) {
        store.dispatch('debriefer/updateDisplayColumns', result.rows[0].doc.columnConfig);
      }
    });

    function updateTab(tabName: string) {
      tab.value = tabName;
    }

    function setToTripTab() {
      tab.value = 'trips';
    }

    function update() {
      filters.value = [];
      const trips = updateFilter(
        state.debriefer.trips,
        'Trip',
        'legacy-tripId'
      );
      filters.value = filters.value.concat(trips);
      const hauls = updateFilter(
        state.debriefer.selectedOperations,
        'Haul',
        'operationNum'
      );
      filters.value = filters.value.concat(hauls);
    }

    function updateFilter(list: any[], label: string, idLabel: string) {
      const filterVals = [];
      for (const val of list) {
        const id = get(val, idLabel);
        if (label === 'Haul') {
          val.label =
            'Trip: ' + get(val, 'legacy-tripId') + ' ' + label + ': ' + id;
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
      const ops = state.debriefer.selectedOperations;

      if (item.type === 'wcgop-trip') {
        index = findIndex(trips, item);
        trips.splice(index, 1);
        if (trips.length === 0) {
          updateTab('trips');
        }
        store.dispatch('debriefer/updateTrips', trips);
        removeOperations();
      } else {
        index = findIndex(ops, item);
        ops.splice(index, 1);
        if (ops.length === 0) {
          updateTab('operations');
        }
        store.dispatch('debriefer/updateSelectedOperations', ops);
      }
    }

    function removeOperations() {
      const tripIds: number[] = [];
      for (const trip of state.debriefer.trips) {
        tripIds.push(get(trip, 'legacy-tripId'));
      }
      // remove operations
      const ops = filter(state.debriefer.operations, (val: any) => {
        if (val && val.legacy && val.legacy.tripId) {
          const index = indexOf(tripIds, val.legacy.tripId);
          return index >= 0 ? true : false;
        }
      });
      store.dispatch('debriefer/updateOperations', ops);

      // when trips are remove also remove associated selectd operations
      const selectedOps = filter(state.debriefer.selectedOperations, (val: any) => {
        if (val && val.legacy && val.legacy.tripId) {
          const index = indexOf(tripIds, val.legacy.tripId);
          return index >= 0 ? true : false;
        }
      });
      store.dispatch('debriefer/updateSelectedOperations', selectedOps);
    }

    return {
      tab,
      updateTab,
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