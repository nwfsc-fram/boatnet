<template>
    <div class="q-pa-md">
      <debriefer-select-comp
        style="display: inline-block; width: 30%"
        label="Dissection Type"
        :val.sync="inputDissection"
        lookupView="wcgop-lookups"
        lookupLabel="doc.description"
        lookupValue="doc.description"
        :lookupQueryOptions="{ key: 'biostructure-type' }"
      />
      <q-input
        class="q-px-md" 
        style="display: inline-block; width: 30%"
        label="Barcode"
        debounce="500"
        v-model="barcode"
        clearable
        clear-icon="close"
        @input="populateSpecimenInfo"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <debriefer-select-comp
        style="display: inline-block; width: 30%"
        label="Rack Name"
        :val.sync="rack"
        lookupView="rack"
        lookupLabel="value"
        lookupValue="value"
      />
      <q-space/>
      <q-card class="bg-grey-2 q-mt-lg">
        <q-card-section>
          <div class="text-subtitle2" style="color: bg-primary"></div>
          <q-input
            v-model="structureType"
            label="Dissection Type"
            readonly
            :rules="[ val => !! inputDissection || 'No dissection above selected',
                      val => inputDissection === val || 'Doesn\'t match selected dissection type: ' + inputDissection
                    ]"
          />
          <q-input v-model="observerName" label="Observer" readonly />
          <q-input v-model="specimen.tripNum" label="Trip #" />
          <q-input v-model="specimen.haulNum" label="Haul #" readonly />
          <q-input v-model="specimen.catchNum" label="Catch #" readonly />
          <q-input v-model="specimen.species" label="Species" readonly />
          <q-input
            v-model="rackName"
            label="Rack Name"
            readonly
            :rules="[ val => !! rack || 'No rack above selected',
                      val => rack === val || 'Doesn\'t match selected rack: ' + rackName
                    ]"
            />
        </q-card-section>
      </q-card>
    </div>
</template>


<script lang="ts">
import { createComponent, ref, reactive, watch } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { get } from 'lodash';

Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    setup(props, context) {
        const inputDissection: any = ref('');
        const barcode: any = ref('');
        const rack: any = ref('');

        const observerName: any = ref('');
        const specimen: any = ref({});
        const structureType: any = ref('');
        const rackName: any = ref('');

        async function populateSpecimenInfo(val: any) {
            const masterDB: Client<any> = couchService.masterDB;
            specimen.value = await masterDB.view('obs_web', 'biostructures_barcode', { key: parseInt(val) });

            specimen.value = get(specimen.value, 'rows[0].value', {});
            const tripNum = get(specimen.value, 'tripNum');
            structureType.value = get(specimen.value, 'biostructure.structureType.description', '');
            const rackId = get(specimen.value, 'biostructure.legacy.rackId', '');

            // get trip doc to get observer name
            const tripDetails = await masterDB.viewWithDocs(
                'obs_web',
                'wcgop_trips_compound_fields',
                {
                    start_key: ['tripId', tripNum],
                    end_key: ['tripId', tripNum],
                }
            );
            const firstName = get(tripDetails, 'rows[0].doc.observer.firstName', '');
            const lastName = get(tripDetails, 'rows[0].doc.observer.lastName', '');
            observerName.value = firstName + ' ' + lastName;

            // get rack name
            const rackDetails = await masterDB.viewWithDocs('obs_web', 'rack', { key: rackId });
            rackName.value = get(rackDetails, 'rows[0].value');
        }

        return {
            inputDissection,
            barcode,
            rack,

            observerName,
            specimen,
            structureType,
            rackName,

            populateSpecimenInfo
        };
    },
});
</script>