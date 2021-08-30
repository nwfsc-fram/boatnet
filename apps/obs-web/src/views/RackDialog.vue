<template>
    <q-dialog v-model="show" @before-show="beforeShow">
        <q-card style="width: 800px">
            <q-card-section>
                <div class="text-h6">{{title}}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit="saveRack" class="q-gutt-md" greedy>
                    <div>
                        <debriefer-select-comp
                            style="display: inline-block; width: 45%"
                            label="Species"
                            :val.sync="rack.speciesId"
                            lookupView="biostructures_species"
                            lookupLabel="key"
                            lookupValue="key"
                            :filled="true"
                            color="black"
                            :rules="[(val) => !!rack.speciesId || 'Species Required']"
                        />
                        <debriefer-select-comp
                            style="display: inline-block; width: 45%"
                            class="q-ml-md"
                            label="Dissection Type"
                            :val.sync="rack.dissectionType"
                            lookupView="wcgop-lookups"
                            lookupLabel="doc.description"
                            lookupValue="doc.description"
                            :filled="true"
                            color="black"
                            :lookupQueryOptions="{ key: 'biostructure-type' }"
                            :rules="[(val) => !!rack.dissectionType || 'Dissection Required']"
                        />
                    </div>
                    <div>
                        <debriefer-select-comp
                            style="display: inline-block; width: 45%"
                            label="Location"
                            :val.sync="rack.rackLocation"
                            lookupView="wcgop-lookups"
                            lookupLabel="doc.description"
                            lookupValue="doc.description"
                            :filled="true"
                            color="black"
                            :lookupQueryOptions="{ key: 'bs-location' }"
                            :rules="[(val) => !!rack.rackLocation || 'Location Required']"
                        />
                        <q-input
                            style="display: inline-block; width: 45%"
                            class="q-ml-md"
                            type="number"
                            filled
                            v-model="rack.year"
                            label="Year"
                            label-color="black"
                            :rules="[(val) => !!rack.year || 'Location Required']"
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
import { createComponent, onMounted, ref } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { get, isEmpty } from 'lodash';
import moment from 'moment';

Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    props: {
        show: Boolean,
        rack: Object
    },
    setup(props, context) {
        const state = context.root.$store.state;
        const masterDB: Client<any> = couchService.masterDB;
        const title: any = ref('');

        function beforeShow() {
            if (isEmpty(props.rack)) {
                title.value = "Create Rack";
            } else {
                title.value = "Edit Rack";
            }
        }

        async function saveRack() {
            const currRack: any = get(props, 'rack', {});
            const currUser = get(state, 'user.activeUser.apexUserAdminUserName');
            if (currRack._id) {
                currRack.updatedDate = moment().format();
                currRack.updatedBy = currUser;
                const result = await masterDB.put(currRack._id, currRack, currRack._rev);
            } else {
                const currRacks = await masterDB.view('obs_web', 'rack');
                const rackId = currRacks.rows[currRacks.rows.length - 1].key + 1;
                const speciesInfo = await masterDB.viewWithDocs('obs_web', 'biostructures_species', { key: currRack.speciesId });
                const pacfinCode = get(speciesInfo, 'rows[0].doc.taxonomy.pacfinSpeciesCode');
                currRack.type = 'rack';
                currRack.rackId = rackId;
                currRack.rackName = pacfinCode ? pacfinCode : currRack.speciesId;
                currRack.rackName += '-' + currRack.dissectionType + '-' + currRack.year;
                currRack.createdDate = moment().format();
                currRack.createdBy = currUser;
                const result = masterDB.post(currRack);
            }
            context.emit('saveRack');
            close();
        }

        function close() {
          context.emit('update:show', false);  
        }

        return {
            beforeShow,
            title,
            saveRack,
            close
        };
    },
});
</script>