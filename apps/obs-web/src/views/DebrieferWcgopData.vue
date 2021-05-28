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
          @input="updateDataTab"
        >
          <q-tab v-if="program === 'ashop'" name="cruises" label="Cruises" />
          <q-tab name="trips" label="Trips" />
          <q-tab name="operations" label="Hauls" />
          <q-tab v-if="program === 'wcgop'" name="catch" label="Catch" />
          <q-tab v-if="program === 'ashop'" name="samples" label="Samples" />
          <q-tab name="biospecimens" label="Biospecimens" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel v-if="program === 'ashop'" name="cruises">
            <app-debriefer-cruises/>
          </q-tab-panel>
          <q-tab-panel name="trips">
            <app-debriefer-trips :isFullSize="isFullSize" :lookupsMap="lookupsMap"></app-debriefer-trips>
          </q-tab-panel>

          <q-tab-panel name="operations">
            <app-debriefer-operations :isFullSize="isFullSize" :lookupsMap="lookupsMap"></app-debriefer-operations>
          </q-tab-panel>

          <q-tab-panel v-if="program === 'wcgop'" name="catch">
            <app-debriefer-catches :isFullSize="isFullSize" @changeTab="updateTab" :lookupsMap="lookupsMap"></app-debriefer-catches>
          </q-tab-panel>

          <q-tab-panel v-if="program === 'ashop'" name="samples">
            <app-debriefer-samples :isFullSize="isFullSize" @changeTab="updateTab" :lookupsMap="lookupsMap"></app-debriefer-samples>
          </q-tab-panel>

          <q-tab-panel name="biospecimens">
            <app-debriefer-biospecimens :isFullSize="isFullSize" :lookupsMap="lookupsMap"></app-debriefer-biospecimens>
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
  onMounted,
} from '@vue/composition-api';
import { get, set, findIndex, indexOf, filter } from 'lodash';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';

export default createComponent({
  props: {
    startingTab: String,
    isFullSize: Boolean
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const debriefer = state.debriefer;
    const tab: any = ref('');
    const program: any = ref(state.debriefer.program);

    const filters: any = ref([]);
    const masterDB: Client<any> = couchService.masterDB;
    const lookupsMap: any = ref([]);

    watch(() => state.debriefer.selectedCruises, update);
    watch(() => state.debriefer.selectedTrips, update);
    watch(() => state.debriefer.selectedOperations, update);
    watch(() => state.debriefer.evaluationPeriod, setToTripTab);
    watch(() => state.debriefer.observer, setToTripTab);
    watch(() => state.debriefer.program, updateProgram);

    updateTab(props.startingTab ? props.startingTab : '');

    onMounted(async () => {
      tab.value = program.value === 'ashop' ? 'cruises' : 'trips';
      lookupsMap.value = await masterDB.view('obs_web', 'wcgop-lookup-codes');
      lookupsMap.value = lookupsMap.value.rows;
    });

    function updateProgram() {
      const currProgram: string = state.debriefer.program;
      tab.value = currProgram === 'ashop' ? 'cruises' : 'trips';
      program.value = currProgram;
    }

    function updateDataTab(tabName: string) {
      context.emit('updateDataTab', tabName);
    }

    function updateTab(tabName: string) {
      tab.value = tabName;
    }

    function setToTripTab() {
      tab.value = 'trips';
    }

    function update() {
      filters.value = [];
      const cruises = updateFilter(
        state.debriefer.selectedCruises,
        'Cruise',
        'cruiseNum'
      );
      filters.value = filters.value.concat(cruises);
      const tripLabel = state.debriefer.program === 'ashop' ? 'tripNum' : 'legacy-tripId';
      const trips = updateFilter(
        state.debriefer.selectedTrips,
        'Trip',
        tripLabel
      );
      filters.value = filters.value.concat(trips);
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
      store.dispatch('debriefer/updateSummarySelection', {});
      let index = -1;
      const cruises = state.debriefer.selectedCruises;
      const trips = state.debriefer.selectedTrips;
      const ops = state.debriefer.selectedOperations;

      if (item.type.includes('trip')) {
        index = findIndex(trips, item);
        trips.splice(index, 1);
        if (trips.length === 0) {
          updateTab('trips');
        }
        store.dispatch('debriefer/updateSelectedTrips', trips);
        removeOperations();
      } else if (item.type === 'ashop-cruise') {
        index = findIndex(cruises, item);
        cruises.splice(index, 1);
        if (cruises.length === 0) {
          updateTab('cruises');
        }
        store.dispatch('debriefer/updateSelectedCruises', cruises);
      }
    }

    function removeOperations() {
      const tripIds: number[] = [];
      for (const trip of state.debriefer.selectedTrips) {
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
      debriefer,
      program,
      updateDataTab,
      tab,
      updateTab,
      filters,
      remove,
      lookupsMap
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