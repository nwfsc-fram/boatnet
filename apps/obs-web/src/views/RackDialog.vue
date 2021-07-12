<template>
    <q-dialog v-model="show">
        <q-card>
            <q-card-section>
                <div class="text-h6">Add Rack</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit="saveRack" class="q-gutt-md" greedy>
                    <div>
                        <debriefer-select-comp
                            style="display: inline-block; width: 30%"
                            label="Species"
                            :val.sync="newRack.species"
                            lookupView="wcgop-lookups"
                            lookupLabel="doc.commonNames[0]"
                            lookupValue="doc"
                            :filled="true"
                            color="black"
                            :lookupQueryOptions="{ key: 'taxonomy-alias' }"
                            :rules="[(val) => !!newRack.species || 'Species Required']"
                        />
                        <debriefer-select-comp
                            style="display: inline-block; width: 30%"
                            class="q-mx-md"
                            label="Dissection Type"
                            :val.sync="newRack.dissection"
                            lookupView="wcgop-lookups"
                            lookupLabel="doc.description"
                            lookupValue="doc"
                            :filled="true"
                            color="black"
                            :lookupQueryOptions="{ key: 'biostructure-type' }"
                            :rules="[(val) => !!newRack.dissection || 'Dissection Required']"
                            
                        />
                        <q-input
                            style="display: inline-block; width: 30%"
                            v-model="newRack.name"
                            label="Rack Name"
                            filled
                            label-color="black"
                            :rules="[(val) => !!newRack.name || 'Rack Name Required']"
                        />
                    </div>
                    <div class="q-pt-md">
                        <q-input
                            style="display: inline-block; width: 30%"
                            v-model="newRack.cols"
                            label="Cols"
                            type="number"
                            filled
                            label-color="black"
                            :rules="[(val) => !!newRack.cols || 'Column Required']"
                        />
                        <q-input
                            style="display: inline-block; width: 30%"
                            class="q-mx-md"
                            type="number"
                            v-model="newRack.rows"
                            label="Rows"
                            filled
                            label-color="black"
                            :rules="[(val) => !!newRack.rows || 'Row Required']"
                        />
                        <debriefer-select-comp
                            style="display: inline-block; width: 30%"
                            label="Location"
                            :val.sync="newRack.location"
                            lookupView="wcgop-lookups"
                            lookupLabel="doc.description"
                            lookupValue="doc"
                            :filled="true"
                            color="black"
                            :lookupQueryOptions="{ key: 'bs-location' }"
                            :rules="[(val) => !!newRack.location || 'Location Required']"
                        />
                    </div>
                    <div class="q-pt-md text-primary" align="right">
                        <q-btn flat label="Save" type="submit" />
                        <q-btn
                            flat
                            label="Close"
                            class="q-ml-md"
                            @click="close"
                        />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>


<script lang="ts">
import { createComponent, ref } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { get } from 'lodash';
import { Rack, RackType } from '@boatnet/bn-models';

Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    props: {
        show: Boolean,
    },
    setup(props, context) {
        const masterDB: Client<any> = couchService.masterDB;
        const newRack: any = ref({});

        async function saveRack() {
            const currRacks = await masterDB.view('obs_web', 'rack');
            const rackId = currRacks.rows[currRacks.rows.length - 1].key + 1;
            const newVal: Rack = {
                type: 'rack',
                speciesId: {
                    _id: get(newRack.value, 'species._id'),
                    commonNames: get(newRack.value, 'species.commonNames'),
                    wcgopSpeciesId: get(newRack.value, 'species.wcgopSpeciesCode')
                },
                dissectionType: newRack.value.dissection,
                rackName: newRack.value.name,
                rackId,
                rackLocation: newRack.value.location,
                cols: newRack.value.cols,
                rows: newRack.value.rows,
            };            
            const id = await masterDB.post(newVal);
            context.emit('saveRack');
            close();
        }

        function close() {
          newRack.value = {};
          context.emit('update:show', false);  
        }

        return {
            newRack,
            saveRack,
            close
        };
    },
});
</script>