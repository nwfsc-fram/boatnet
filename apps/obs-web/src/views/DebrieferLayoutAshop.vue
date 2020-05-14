<template>
  <div>
    <debriefer-select-comp
      class="q-pa-md"
      style="display: inline-block; width: 25%"
      label="Cruise Id"
      :val.sync="cruiseId"
      lookupView="ashop_cruise"
      lookupLabel="key"
      lookupValue="key"
      :lookupQueryOptions="{}"
      @select="selectCruise"
    />
    <q-btn
      round
      class="q-ma-xs"
      style="display: inline-block"
      color="white"
      text-color="black"
      icon="edit"
      @click="showCruiseDialog = true"
    />
    <div class="q-pa-md" style="display: inline-block; width: 20%">
      <b>Observer:</b>
      <div>{{ observers }}</div>
    </div>
    <div class="q-pa-md" style="display: inline-block; width: 10%">
      <b>Vessel Name:</b>
      <div>{{ vesselName }}</div>
    </div>
    <div class="q-pa-md" style="display: inline-block; width: 10%">
      <b>Start Date:</b>
      <div>{{ cruiseStartDate }}</div>
    </div>
    <div class="q-pa-md" style="display: inline-block; width: 10%">
      <b>End Date:</b>
      <div>{{ cruiseEndDate }}</div>
    </div>
    <app-cruise-dialog :showDialog.sync="showCruiseDialog" :cruise="cruise" />
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
import { findIndex } from 'lodash';
import { getTripsByDates } from '../helpers/getFields';
import DebrieferSelectComp from './DebrieferSelectComp.vue';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const cruiseId: any = ref({});
    const cruise: AshopCruise = ref({});

    const showCruiseDialog: any = ref(false);

    const cruiseStartDate = computed(() =>
      cruise.value && cruise.value.startDate
        ? moment(cruise.value.startDate).format('MM/DD/YYYY')
        : ''
    );
    const cruiseEndDate = computed(() =>
      cruise.value && cruise.value.endDate
        ? moment(cruise.value.endDate).format('MM/DD/YYYY')
        : ''
    );
    const vesselName = computed(() =>
      cruise.value && cruise.value.vessel && cruise.value.vessel.vesselName
        ? cruise.value.vessel.vesselName
        : ''
    );

    const observers = computed({
      get: () => {
        let names = '';
        const length = cruise.value.observers
          ? cruise.value.observers.length
          : 0;
        for (let i = 0; i < length; i++) {
          names +=
            cruise.value.observers[i].firstName +
            ' ' +
            cruise.value.observers[i].lastName;
          if (i < length - 1) {
            names += ', ';
          }
        }
        return names;
      },
      set: (id) => undefined
    });

    async function selectCruise(id: string) {
      store.dispatch('debriefer/setCruiseIds', id);
      try {
        const results = await masterDB.viewWithDocs<any>(
          'obs_web',
          'ashop_cruise',
          { key: id }
        );
        if (results.rows[0] && results.rows[0].doc) {
          cruise.value = results.rows[0].doc;
          store.dispatch('debriefer/setTripIds', results.rows[0].doc.trips);
        } else {
          cruise.value = {};
          store.dispatch('debriefer/setTripIds', []);
        }
      } catch (err) {
        store.dispatch('debriefer/setTripIds', []);
        console.log(err);
      }
    }

    return {
      cruiseId,
      cruise,
      vesselName,
      observers,
      cruiseStartDate,
      cruiseEndDate,
      selectCruise,
      showCruiseDialog
    };
  }
});
</script>
