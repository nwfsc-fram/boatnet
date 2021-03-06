<template>
  <div>
    <prime-table
      :value="cruises"
      :columns="columns"
      type="Cruise"
      :simple="false"
      uniqueKey="_id"
      :enableSelection="true"
      :showSelectionBoxes="true"
      :isFullSize="isFullSize"
      :loading="loading"
      :initialSelection="initialSelection"
      @selectValues="selectValues"
      @save="save"
    />
  </div>
</template>


<script lang="ts">
import { createComponent, ref, onMounted, watch } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { cloneDeep, findIndex, orderBy } from 'lodash';
import moment from 'moment';

import PrimeTable from './PrimeTable.vue';
Vue.component('PrimeTable', PrimeTable);

export default createComponent({
  props: {
    isFullSize: Boolean,
    lookupsMap: Array
  },
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const store = context.root.$store;
    const state: any = store.state;
    const displayColumns: any = state.debriefer.displayColumns;

    const jp = require('jsonpath');
    const flatten = require('flat');
    const unflatten = flatten.unflatten;


    const cruises: any = ref([]);
    const loading: any = ref(false);
    const initialSelection: any = state.debriefer && state.debriefer.selectedCruises ? state.debriefer.selectedCruises : [];

    const columns = [
      {
        field: 'cruiseNum',
        header: 'Cruise',
        type: 'number',
        key: 'ashopCruiseNum',
        width: '100'
      },
      {
        field: 'permit',
        header: 'Permit',
        type: 'number',
        key: 'ashopPermit',
        width: '100'
      },
      {
        field: 'vessel-vesselName',
        header: 'Name',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'vessel',
        lookupField: 'vesselName',
        isEditable: true,
        key: 'ashopVessel'
      },
      {
        field: 'editor',
        header: 'Editor',
        type: 'input',
        key: 'ashopEditor',
        isEditable: true
      },
      {
        field: 'status-description',
        header: 'Status',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'status',
        lookupField: 'description',
        isEditable: true,
        key: 'ashopStatuses',
      },
      {
        field: 'statusDate',
        header: 'Status Date',
        type: 'date',
        key: 'ashopStatusDate',
        isEditable: true
      },
      {
        field: '',
        header: 'Status Time',
        type: 'time',
        isEditable: true,
        key: 'ashopStatustime',
        width: '150'
      },
    ];

    watch(() => state.debriefer.cruises, async () => {
      cruises.value = jp.query(state.debriefer.cruises, '$[*].doc');
    });

    async function selectValues(data: any) {
      if (data) {
        store.dispatch('debriefer/updateSelectedCruises', data);
        const selectedCruise = unflatten(data[0], { delimiter: '-' });
        if (selectedCruise && selectedCruise.trips) {
          const tripOptions: ListOptions = { keys: selectedCruise.trips };
          const trips = await masterDB.listWithDocs(tripOptions);
          store.dispatch('debriefer/updateTrips', trips.rows);
        }
      }
    }

    async function save(data: any) {
      const result = await masterDB.put(data._id, data, data._rev);
      const index = findIndex(cruises.value, { _id: data._id });
      const updatedvalue: any[] = cloneDeep(cruises.value);
      updatedvalue[index] = data;
      updatedvalue[index]._rev = result.rev;
      cruises.value = updatedvalue;
      store.dispatch('debriefer/updateCruises', cruises.value);
    }

    return {
      columns,
      cruises,
      loading,
      initialSelection,
      displayColumns,
      selectValues,
      save
    };
  }
});
</script>