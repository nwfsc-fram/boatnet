<template>
  <div>
    <debriefer-select-comp
      label="Observer"
      style="display: inline-block"
      :val.sync="observers"
      lookupView="all_wcgop_observers"
      lookupLabel="value"
      lookupValue="id"
      :multiple="true"
      @select="select('wcgop_trips_by_observerId', 'observer._id', observers)"
    />
    <debriefer-select-comp
      label="Status"
      style="display: inline-block"
      class="q-mx-xs"
      :val.sync="status"
      lookupView="all_doc_types"
      lookupLabel="doc.description"
      lookupValue="id"
      :multiple="true"
      :lookupQueryOptions="{ key: 'trip-status', include_docs: true }"
      @select="select('wcgop_trips_by_statusId', 'tripStatus._id', status)"
    />
    <debriefer-select-comp
      label="Vessel Name"
      style="display: inline-block"
      class="q-mx-xs"
      :val.sync="vessel"
      lookupView="all_vessel_names"
      lookupLabel="value"
      lookupValue="id"
      :lookupQueryOptions="{}"
      :multiple="true"
      @select="select('wcgop_trips_by_vesselId', 'vessel._id', vessel)"
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
      :multiple="true"
      @select="select('wcgop_trips_by_fisheryId', 'fishery._id', fishery)"
    />
    <debriefer-select-comp
      style="display: inline-block"
      class="q-mx-xs"
      label="Trip Id"
      :val.sync="tripId"
      lookupView="wcgop_trips_by_observerId"
      lookupLabel="value"
      lookupValue="id"
      :multiple="true"
      :lookupQueryOptions="{}"
      @select="selectTripId"
    />
    <div style="display: inline-block" class="q-pa-md">
      <div class="p-float-label q-px-xs">
        <pCalendar
          v-model="startDate"
          @date-select="dateFilter"
          @clear-click="dateFilter"
          :showButtonBar="true"
        />
        <label for="endDate" style="color: #027be3">Start Date</label>
      </div>
    </div>
    <div style="display: inline-block" class="q-pa-md">
      <div class="p-float-label q-px-xs">
        <pCalendar
          v-model="endDate"
          @date-select="dateFilter"
          @clear-click="dateFilter"
          :showButtonBar="true"
        />
        <label for="endDate" style="color: #027be3">End Date</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { createComponent, ref } from '@vue/composition-api';
import Vue from 'vue';
import { useAsync } from 'vue-async-function';
import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions, FindOptions } from 'davenport';
import moment from 'moment';
import { PersonAlias, AshopCruise } from '@boatnet/bn-models';
import { findIndex, get, remove, indexOf } from 'lodash';
import { getTripsByDates } from '../helpers/getFields';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';

Vue.component('DebrieferSelectComp', DebrieferSelectComp);
Vue.component('multiselect', Multiselect);

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    // store filters in an object where the:
    // key: view name
    // value: array of selected values
    let filters: any = {};
    const rows: any = [];

    const observers: any = ref([]);
    const status: any = ref([]);
    const startDate: any = ref();
    const endDate: any = ref();
    const vessel: any = ref([]);
    const fishery: any = ref([]);
    const tripId: any = ref([]);

    const observerList: any = ref([]);
    const vesselList: any = ref([]);
    const statusList: any = ref([]);
    const fisheryList: any = ref([]);

    async function select(view: string, field: string, vals: any) {
      tripId.value = [];
      const ids: string[] = [];
      for (const val of vals) {
        ids.push(val.value);
      }
      await updateFilters(view, field, ids);
    }

    async function dateFilter() {
      if (startDate.value && endDate.value) {
        const dates = [
          moment(startDate.value).format(),
          moment(endDate.value).format()
        ];
        await updateFilters('wcgop_trips_by_date', 'returnDate', dates);
      } else {
        await updateFilters('wcgop_trips_by_date', 'returnDate', []);
      }
    }

    function updateFilters(view: string, field: string, val: any) {
      if (val.length > 0) {
        filters[view] = { field, val };
      } else if (filters[view] && val.length === 0) {
        delete filters[view];
      }
      updateRecords();
    }

    async function updateRecords() {
      let tripIds: any[] = [];
      const views = Object.keys(filters);
      if (views.length === 0) {
        vesselList.value = [];
        fisheryList.value = [];
        statusList.value = [];
        observerList.value = [];
      } else {
        const queryView = views[0]; // use the first key in the object to query couch, then filter based off the remaining keys
        let keyVals = {};
        if (queryView === 'wcgop_trips_by_date') {
          keyVals = {
            start_key: filters[queryView].val[0],
            end_key: filters[queryView].val[1]
          };
        } else {
          keyVals = { keys: filters[queryView].val };
        }
        try {
          const results = await masterDB
            .viewWithDocs('obs_web', queryView, keyVals)
            .then((response: any) => {
              tripIds = response.rows
                .filter((row: any) => {
                  let keep: boolean = true;
                  if (views.length > 1) {
                    for (let i = 1; i < views.length; i++) {
                      console.log('checking ' + views[i])
                      if (views[i] === 'wcgop_trips_by_date') {
                        if (moment(row.doc.returnDate).isBefore(filters[views[i]].val[0]) ||
                          moment(row.doc.returnDate).isAfter(filters[views[i]].val[1])) {
                          keep = false;
                        }
                      } else {
                        const rowVal = get(row.doc, filters[views[i]].field);
                        if (indexOf(filters[views[i]].val, rowVal) === -1) {
                          keep = false;
                        }
                      }
                    }
                  }
                  return keep;
                })
                .map((row: any) => row.id);
            });
        } catch (e) {
          console.log('error getting trips ' + e);
        }
      }
      store.dispatch('debriefer/setTripIds', tripIds);
    }

    function selectTripId(id: string) {
      store.dispatch('debriefer/setTripIds', id);
      filters = {};
      vessel.value = [];
      fishery.value = [];
      observers.value = [];
    }

    return {
      select,
      dateFilter,
      startDate,
      endDate,
      vessel,
      observers,
      status,
      fishery,
      tripId,
      selectTripId,
      observerList,
      vesselList,
      fisheryList,
      statusList
    };
  }
});
</script>

<style src="../../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>