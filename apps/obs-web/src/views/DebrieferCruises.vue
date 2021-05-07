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
import { createComponent, ref, onMounted } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { cloneDeep, findIndex, orderBy } from 'lodash';

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
      { field: 'cruiseNum', header: 'Cruise', type: 'number', key: 'ashopCruiseNum' },
      {
        field: 'permit',
        header: 'Permit',
        type: 'number',
        key: 'ashopPermit'
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
        key: 'ashopEditor'
      },
      {
        field: 'status-description',
        header: 'Status',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'status',
        lookupField: 'description',
        key: 'ashopStatus',
        isEditable: true
      },
      {
        field: 'statusDate',
        header: 'Status Date',
        type: 'date',
        key: 'ashopStatusDate',
        isEditable: true
      }
    ];

    onMounted(async () => {
      const result = await masterDB.viewWithDocs(
        'obs_web',
        'ashop-cruise',
        { 
          limit: 50,
          start_key: '2020-06-03T19:32:00.000Z',
          end_key: '2021-05-06T19:32:00.000Z',
        }  
      );
      cruises.value = jp.query(result.rows, '$[*].doc')
      cruises.value = orderBy(cruises.value, ['statusDate'], ['desc']);
    })

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
      console.log('save')
      console.log(data)
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