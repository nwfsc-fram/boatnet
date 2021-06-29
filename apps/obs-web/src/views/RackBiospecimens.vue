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
        :val.sync="inputDissection"
        lookupView="rack"
        lookupLabel="key"
        lookupValue="value"
      />
      <q-space/>
      <q-card class="bg-grey-2 q-mt-lg">
        <q-card-section>
          <div class="text-subtitle2" style="color: bg-primary"></div>
          <q-input
            v-model="dissectionType"
            label="Dissection Type"
            readonly
            :rules="[ val => !! inputDissection || 'No dissection above selected',
                      val => inputDissection === val || 'Doesn\'t match selected dissection type: ' + inputDissection
                    ]"
          />
          <q-input v-model="observerName" label="Observer" readonly />
          <q-input v-model="tripNum" label="Trip #" readonly />
          <q-input v-model="haulNum" label="Haul #" readonly />
          <q-input v-model="catchNum" label="Catch #" readonly />
          <q-input v-model="species" label="Species" readonly />
          <q-input v-model="rackName" label="Rack Name" readonly />
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

        const dissectionType: any = ref('');
        const observerName: any = ref('');
        const tripNum: any = ref();
        const haulNum: any = ref();
        const catchNum: any = ref();
        const species: any = ref('');
        const rackName: any = ref('');

        async function populateSpecimenInfo(val: any) {
            const masterDB: Client<any> = couchService.masterDB;
            let specimen = await masterDB.view('obs_web', 'biostructures_barcode', { key: parseInt(val) });

            specimen = get(specimen, 'rows[0].value', {});
            dissectionType.value = get(specimen, 'biostructure.structureType.description', '');
            tripNum.value = get(specimen, 'tripNum');
            haulNum.value = get(specimen, 'haulNum');
            catchNum.value = get(specimen, 'catchNum');
            species.value = get(specimen, 'species', '');
            rackName.value = get(specimen, 'biostructure.legacy.rackPosition', '');

            // get trip doc to get observer name
            const tripDetails = await masterDB.viewWithDocs(
                'obs_web',
                'wcgop_trips_compound_fields',
                {
                    start_key: ['tripId', tripNum.value],
                    end_key: ['tripId', tripNum.value],
                }
            );
            const firstName = get(tripDetails, 'rows[0].doc.observer.firstName', '');
            const lastName = get(tripDetails, 'rows[0].doc.observer.lastName', '');
            observerName.value = firstName + ' ' + lastName;
        }

        return {
            inputDissection,
            barcode,
            rack,

            dissectionType,
            observerName,
            tripNum,
            haulNum,
            catchNum,
            species,
            rackName,

            populateSpecimenInfo,
            get,
        };
    },
});
</script>