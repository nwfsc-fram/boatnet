<template>
  <div>
    <prime-table
      :value="data"
      :columns="columns"
      type="Cruise"
      :simple="false"
      uniqueKey="_id"
      :enableSelection="false"
      :showSelectionBoxes="false"
      :isFullSize="isFullSize"
      :loading="loading"
      @save="save"
    />
  </div>
</template>


<script lang="ts">
import { createComponent, ref, onMounted, watch } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { cloneDeep, findIndex, forEach, join, indexOf } from 'lodash';
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

    const jp = require('jsonpath');
    const flatten = require('flat');
    const unflatten = flatten.unflatten;


    const data: any = ref([]);
    const loading: any = ref(false);

    const columns = [
        {
        field: 'tripNum',
        header: 'Trip',
        type: 'number',
        key: 'wcgopSpecTripNum',
        width: '80'
      },
        {
        field: 'species-commonNames-0',
        header: 'Species',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'taxonomy-alias',
        lookupField: 'commonNames[0]',
        isEditable: true,
        key: 'wcgopSpecIntSpecies',
        width: '150'
      },
      {
        field: 'location-coordinates',
        header: 'Location',
        type: 'coordinate',
        displayField: ['location-coordinates-0', 'location-coordinates-1'],
        isEditable: true,
        key: 'wcgopSpecIntLocation',
        width: '130'
      },
      {
        field: 'bodyLength-description',
        header: 'Body Length',
        type: 'input',
        key: 'wcgopSpecIntBodyLen',
        width: '140'
      },
      {
        field: 'legacy-sightingCondition-description',
        header: 'Sighting Condition',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'sighting-condition',
        lookupField: 'description',
        isEditable: true,
        key: 'wcgopSpecIntSightingCond',
        width: '80'
      },
      {
        field: 'beaufort-code',
        header: 'Beaufort',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'beaufort',
        lookupField: 'lookupValue',
        isEditable: true,
        key: 'wcgopSpecIntBeaufort',
        width: '80'
      },
      {
        field: 'confidenceOfSpecies-description',
        header: 'Confidence',
        type: 'toggle',
        listType: 'fetch',
        lookupKey: 'confidence',
        lookupField: 'description',
        isEditable: true,
        key: 'wcgopSpecIntConf',
        width: '80'
      },
      {
        field: 'closestApproach-value',
        header: 'Closest Approach (M)',
        type: 'number',
        isEditable: true,
        key: 'wcgopSpecIntClosestApproach',
        width: '80'
      },
      {
        field: 'bestNumSighted',
        header: 'Number (best)',
        type: 'number',
        key: 'wcgopSpecIntBestNum',
        width: '80'
      },
      {
        field: 'minAnimalCountEstimate',
        header: 'Number (Min)',
        type: 'number',
        key: 'wcgopSpecIntMinNum',
        width: '80'
      },
      {
        field: 'maxAnimalCountEstimate',
        header: 'Number (Max)',
        type: 'number',
        key: 'wcgopSpecIntMaxNum',
        width: '80'
      },
      {
        field: 'interactionDescriptions',
        header: 'Interactions',
        type: 'textArea',
        key: 'wcgopSpecInteractions',
        width: '150',
      },
      {
        field: 'behaviors',
        header: 'Behaviors',
        type: 'textArea',
        key: 'wcgopSpecBehaviors',
        width: '150',
      },
      {
        field: 'notes',
        header: 'Notes',
        type: 'textArea',
        key: 'wcgopSpecIntNotes',
        width: '120',
        isEditable: true
      },
    ];

    function getData() {
        data.value = [];
        forEach(state.debriefer.selectedTrips, (trip) => {
          const unflattenedTrip = unflatten(trip, { delimiter: '-' });
          const interactionEvents = unflattenedTrip.interactionEvents;

          forEach(interactionEvents, (interaction) => {
              const interactionDescriptions = jp.query(interaction, '$.interactions[*].description');
              interaction.interactionDescriptions = join(interactionDescriptions, ', ');

              const behaviors = jp.query(interaction, '$.animalBehavior[*].description');
              interaction.behaviors = join(behaviors, ', ');

              let beaufortCode: any = findIndex(props.lookupsMap, { id: interaction.beaufort._id});
              beaufortCode = beaufortCode.value;
              interaction.beaufort.code = beaufortCode;

              interaction.tripNum = unflattenedTrip.legacy.tripId;
              interaction.tripId = unflattenedTrip._id;

              data.value.push(interaction);
          });
        });
    }
    getData();

    async function save(newVal: any) {
      // updating display values
      const updatedvalue: any[] = cloneDeep(data.value);
      const updatedIndex = findIndex(data.value, { _id: newVal._id});
      updatedvalue[updatedIndex] = newVal;
      data.value = updatedvalue;

      // updating trips couch doc
      const trips = state.debriefer.selectedTrips;
      const tripIndex = findIndex(trips, { _id: newVal.tripId });
      const unflattenedTrip = unflatten(trips[tripIndex], { delimiter: '-' });
      const interactionIndex = findIndex(unflattenedTrip.interactionEvents, { _id: newVal._id });
      unflattenedTrip.interactionEvents[interactionIndex] = newVal;

      const result = await masterDB.put(unflattenedTrip._id, unflattenedTrip, unflattenedTrip._rev);
      state.debriefer.selectedTrips[tripIndex] = unflattenedTrip;
      state.debriefer.selectedTrips[tripIndex]._rev = result.rev;
      store.dispatch('debriefer/updateSelectedTrips', state.debriefer.selectedTrips);
    }

    return {
      columns,
      data,
      loading,
      save
    };
  }
});
</script>