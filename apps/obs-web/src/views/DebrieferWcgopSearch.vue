<template>
  <div>
    <debriefer-select-comp
      label="Observer"
      style="display: inline-block"
      :val.sync="observer"
      lookupView="all_wcgop_observers"
      lookupLabel="value"
      lookupValue="id"
      @select="observerFilter"
    />
    <debriefer-select-comp
      label="Status"
      style="display: inline-block"
      class="q-mx-xs"
      :val.sync="status"
      lookupView="all_doc_types"
      lookupLabel="doc.description"
      lookupValue="id"
      :lookupQueryOptions="{ key: 'trip-status', include_docs: true }"
      @select="statusFilter"
    />
    <div style="display: inline-block" class="q-pa-md">
      <div class="p-float-label q-px-xs">
        <pCalendar v-model="dateRange" selectionMode="range" />
        <label for="endDate" style="color: #027be3">Date Range</label>
      </div>
    </div>
    <debriefer-select-comp
      label="Vessel Name"
      style="display: inline-block"
      class="q-mx-xs"
      :val.sync="vessel"
      lookupView="all_vessel_names"
      lookupLabel="value"
      lookupValue="id"
      :lookupQueryOptions="{}"
      @select="vesselFilter"
    />
    <debriefer-select-comp
      label="Fishery"
      style="display: inline-block"
      class="q-mx-xs"
      :val.sync="fishery"
      lookupView="all_doc_types"
      lookupLabel="doc.description"
      lookupValue="id"
      :lookupQueryOptions="{ key: 'fishery', include_docs: true }"
      @select="fisheryFilter"
    />
    <debriefer-select-comp
      style="display: inline-block"
      class="q-mx-xs"
      label="Trip Id"
      :val.sync="tripId"
      lookupView="wcgop_trips_by_observerId"
      lookupLabel="value"
      lookupValue="id"
      :lookupQueryOptions="{}"
      @select="selectTripId"
    />
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch
} from '@vue/composition-api';
import Vue from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useAsync } from 'vue-async-function';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions, FindOptions } from 'davenport';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import moment from 'moment';
import { PersonAlias, AshopCruise } from '@boatnet/bn-models';
import { findIndex, get, remove } from 'lodash';
import { getTripsByDates } from '../helpers/getFields';
import DebrieferSelectComp from './DebrieferSelectComp.vue';

Vue.component('DebrieferSelectComp', DebrieferSelectComp);
Vue.component('TabPanel', TabPanel);
Vue.component('TabView', TabView);
Vue.component('DataTable', DataTable);
Vue.component('Column', Column);

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const filters: any = [];

    const observer: any = ref({});
    const status: any = ref({});
    const dateRange: any = ref([]);
    const vessel: any = ref({});
    const fishery: any = ref({});
    const tripId: any = ref({});

    async function observerFilter(id: string) {
      await filter('wcgop_trips_by_observerId', 'observer._id', id);
    }

    async function statusFilter(id: string) {
      await filter('wcgop_trips_by_statusId', 'tripStatus._id', id);
    }

    async function dateFilter() {
      if (dateRange.value[0] && dateRange.value[1]) {
        await filter('wcgop_trips_by_date', 'departureDate', dateRange.value);
      }
    }

    async function vesselFilter(id: string) {
      await filter('wcgop_trips_by_vesselId', 'vessel._id', id);
    }

    async function fisheryFilter(id: string) {
      await filter('wcgop_trips_by_fisheryId', 'fishery._id', id);
    }

    async function filter(view: string, field: string, id: string) {
      let tripIds: string[] = [];
      tripId.value = {}
      const index = findIndex(filters, { view: view });
      if (index >= 0) {
        filters[index] = { view: view, field: field, id: id };
      } else {
        filters.push({ view: view, field: field, id: id });
      }
      // when a filter is cleared (value = '') remove it from filters
      remove(filters, (n: any) => { return !n.id; });

      try {
        if (filters.length > 0) {
          const results = await masterDB
            .viewWithDocs('obs_web', filters[0].view, { key: filters[0].id })
            .then((response: any) => {
              for (const row of response.rows) {
                let filterIn = true;
                for (const filter of filters) {
                  if (filter.id != get(row.doc, filter.field)) {
                    filterIn = false;
                  }
                }
                if (filterIn) {
                  tripIds.push(row.id);
                }
              }
            });
          store.dispatch('debriefer/setTripIds', tripIds);
        }
      } catch (e) {
        console.log('error getting trips ' + e);
      }
    }

    function selectTripId(id: string) {
      store.dispatch('debriefer/setTripIds', [id]);
      vessel.value = {};
      fishery.value = {};
      observer.value = {};
    }

    return {
      observerFilter,
      statusFilter,
      vesselFilter,
      fisheryFilter,
      dateRange,
      vessel,
      observer,
      status,
      fishery,
      tripId,
      selectTripId
    };
  }
});
</script>
