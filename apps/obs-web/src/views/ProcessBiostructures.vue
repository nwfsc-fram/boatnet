<template>
    <div>
        <div class="q-pa-md">
            <q-select
                style="display: inline-block; width: 30%"
                label="Species"
                v-model="species"
                :options="speciesOptions"
                use-input
                hide-selected
                fill-input
                clearable
                @filter="speciesFilterFn"
                :option-label="(item) => get(item, speciesLabel)"
                :option-value="(item) => get(item, speciesLabel)"
            />
            <q-select
                style="display: inline-block; width: 30%"
                class="q-px-md"
                label="DissectionType"
                v-model="dissection"
                use-input
                hide-selected
                fill-input
                clearable
                @filter="dissectionFilterFn"
                :options="dissectionOptions"
                :option-label="(item) => get(item, dissectionLabel)"
                :option-value="(item) => get(item, dissectionLabel)"
            />
            <q-select
                style="display: inline-block; width: 30%"
                label="Rack Name"
                v-model="rack"
                use-input
                hide-selected
                fill-input
                clearable
                @filter="rackFilterFn"
                :options="rackOptions"
                :option-label="(item) => get(item, rackLabel)"
                :option-value="(item) => get(item, rackLabel)"
                @input="selectRack"
            />
            <q-btn
                round
                class="q-mr-md"
                style="display: inline-block"
                color="white"
                text-color="black"
                icon="add"
                @click="addRack"
            />
        </div>
        <q-table
            :data="tableData"
            :columns="columns"
            row-key="name"
            :pagination="{
                rowsPerPage: 25
            }"
            :visible-columns="visibleColumns"
            no-data-label="No data in this rack"
            :loading="loading"
        >
            <template v-slot:top>
                <q-select
                    v-model="visibleColumns"
                    multiple
                    outlined
                    dense
                    options-dense
                    :display-value="$q.lang.table.columns"
                    emit-value
                    map-options
                    :options="columns"
                    option-value="name"
                    options-cover
                    style="min-width: 150px"
                />
            </template>
            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                    >
                        {{ col.label }}
                    </q-th>
                    <q-th auto-width />
                </q-tr>                   
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td
                        v-for="col of columns"
                        :key="col.field"
                        :props="props"
                    >
                        {{ get(props.row, col.field) }}
                        <q-popup-edit
                            v-if="col.isEditable"
                            v-model="props.row[col.field]"
                        >
                            <q-input
                                v-model="props.row[col.field]"
                                dense
                                autofocus
                                counter
                            />
                        </q-popup-edit>
                    </q-td>
                    <q-td auto-width>
                        <q-btn size="sm" color="primary" round dense icon="delete_outline" />
                    </q-td>
                </q-tr>
            </template>
        </q-table>

        <q-dialog v-model="showRackDialog">
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
                                lookupValue="doc.commonNames[0]"
                                :filled="true"
                                color="black"
                                :lookupQueryOptions="{ key: 'taxonomy-alias' }"
                                :rules="[
                                    (val) =>
                                        !!newRack.species || 'Species Required',
                                ]"
                            />
                            <debriefer-select-comp
                                style="display: inline-block; width: 30%"
                                class="q-mx-md"
                                label="Dissection Type"
                                :val.sync="newRack.dissection"
                                lookupView="wcgop-lookups"
                                lookupLabel="doc.description"
                                lookupValue="doc.description"
                                :filled="true"
                                color="black"
                                :lookupQueryOptions="{
                                    key: 'biostructure-type',
                                }"
                                :rules="[
                                    (val) =>
                                        !!newRack.dissection ||
                                        'Dissection Type Required',
                                ]"
                            />
                            <q-input
                                style="display: inline-block; width: 30%"
                                v-model="newRack.name"
                                label="Rack Name"
                                filled
                                label-color="black"
                                :rules="[
                                    (val) =>
                                        !!newRack.name || 'Rack Name Required',
                                ]"
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
                                :rules="[
                                    (val) =>
                                        !!newRack.cols || 'Column Required',
                                ]"
                            />
                            <q-input
                                style="display: inline-block; width: 30%"
                                class="q-mx-md"
                                type="number"
                                v-model="newRack.rows"
                                label="Rows"
                                filled
                                label-color="black"
                                :rules="[
                                    (val) => !!newRack.rows || 'Row Required',
                                ]"
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
                                :rules="[
                                    (val) =>
                                        !!newRack.location ||
                                        'Location Required',
                                ]"
                            />
                        </div>
                        <div class="q-pt-md text-primary" align="right">
                            <q-btn flat label="Save" type="submit" />
                            <q-btn
                                flat
                                label="Close"
                                v-close-popup
                                class="q-ml-md"
                            />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>


<script lang="ts">
import { createComponent, ref, reactive, watch } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { get, filter, orderBy, slice, uniqBy } from 'lodash';
import { Rack, RackType } from '@boatnet/bn-models';
import { trip } from '../_store/trip.module';

Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    setup(props, context) {
        const masterDB: Client<any> = couchService.masterDB;
        const jp = require('jsonpath');
        const compKey: any = ref(0); // Ensures the rack list is refreshed when a new rack is added

        const species: any = ref(null);
        const dissection: any = ref(null);
        const rack: any = ref(null);

        const speciesLabel = "doc.speciesId.commonNames[0]";
        const dissectionLabel = "doc.dissectionType.description";
        const rackLabel = "value";

        const showRackDialog: any = ref(false);
        const newRack: any = ref({});
        const tableData: any = ref([]);
        const loading: any = ref(false);

        const allRacks: any = ref(null);
        const speciesOptions: any = ref([]);
        const dissectionOptions: any = ref([]);
        const rackOptions: any = ref([]);

        const columns: any[] = [
            {
                name: 'position',
                label: 'Position',
                field: 'position',
                sortable: true,
            },
            {
                name: 'tripNum',
                label: 'Trip #',
                field: 'tripNum',
            },
            {
                name: 'haulNum',
                label: 'Haul #',
                field: 'haulNum',
            },
            {
                name: 'species',
                label: 'Species',
                field: 'species',
            },
            {
                name: 'dissection',
                label: 'Dissection',
                field: 'dissection',
            },
            {
                name: 'barcodeNum',
                label: 'Barcode #',
                field: 'barcodeNum',
            },
            {
                name: 'received',
                label: 'Received',
                field: 'received',
            },
            {
                name: 'cwtStatus',
                label: 'CWT Status',
                field: 'cwtStatus',
                isEditable: true,
            },
            {
                name: 'cwtCode',
                label: 'CWT Code',
                field: 'cwtCode',
                isEditable: true,
            },
            {
                name: 'cwtType',
                label: 'CWT Type',
                field: 'cwtType',
                isEditable: true,
            },
        ];
        const visibleColumns: any = jp.query(columns, '$[*].name');

        async function speciesFilterFn(val: any, update: any) {
            await filterFn(val, update, speciesLabel, speciesOptions);
        }

        async function dissectionFilterFn(val: any, update: any) {
            await filterFn(val, update, dissectionLabel, dissectionOptions);
        }

        async function rackFilterFn(val: any, update: any) {
            await filterFn(val, update, rackLabel, rackOptions);
        }

        async function filterFn(val: any, update: any, label: string, optionsList: any) {
            if (allRacks.value === null) {
                allRacks.value = await masterDB.viewWithDocs('obs_web', 'rack');
                allRacks.value = allRacks.value.rows;
            }
            let filteredList: any[] = allRacks.value;

            const speciesName = get(species.value, speciesLabel);
            filteredList = filter(filteredList, speciesName ? [speciesLabel, speciesName] : {});

            const dissectionName = get(dissection.value, dissectionLabel);
            filteredList = filter(filteredList, dissectionName ? [dissectionLabel, dissectionName] : {});

            speciesOptions.value = uniqBy(filteredList, speciesLabel);
            speciesOptions.value = orderBy(speciesOptions.value, speciesLabel);
            dissectionOptions.value = uniqBy(filteredList, dissectionLabel);
            dissectionOptions.value = orderBy(dissectionOptions.value, dissectionLabel);
            rackOptions.value = orderBy(filteredList, rackLabel);

            update(() => {
                const needle = val.toLowerCase();
                 optionsList.value = filter(optionsList.value, (option: any) => {
                    const currLabel = get(option, label).toLowerCase();
                    return currLabel.includes(needle);
                });
                return optionsList.value;
            });
        }

        function addRack() {
            showRackDialog.value = true;
        }

        async function saveRack() {
            showRackDialog.value = false;
            const currRacks = await masterDB.view('obs_web', 'rack');
            const rackId = currRacks.rows[currRacks.rows.length - 1].key + 1;
            const newVal: Rack = {
                type: 'rack',
                species: newRack.value.species,
                dissection: newRack.value.dissection,
                rackName: newRack.value.name,
                rackId,
                location: newRack.value.location,
                cols: newRack.value.cols,
                rows: newRack.value.rows,
            };
            const id = await masterDB.post(newVal);
            compKey.value++;
        }

        async function selectRack(val: any) {
            loading.value = true;
            tableData.value = val ? await select('rackId', val.doc.rackId) : [];
            loading.value = false;
        }

        async function select(fieldName: any, fieldVal: any) {
            let results = [];
            const operationDocs: any = await masterDB.viewWithDocs(
                'obs_web',
                'biostructures_compound_fields',
                {
                    key: [ fieldName, fieldVal ],
                    include_docs: true,
                    //limit: 100
                } as any
            );
            for (const operation of operationDocs.rows) {
                const findStr = '$..biostructures[?(@._id=="' + operation.value + '")]';
                const bios = jp.nodes(operation, findStr);
                const bioValue = bios[0].value;

                const speciesPath = jp.stringify(slice(bios[0].path, 0, 6));
                const speciesName = jp.value(operation, speciesPath + '.catchContent.commonNames[0]');

                results.push({
                    position: get(bioValue, 'legacy.rackPosition'),
                    tripNum: get(operation, 'doc.legacy.tripId'),
                    haulNum: get(operation, 'doc.operationNum'),
                    species: speciesName,
                    dissection: get(bioValue, 'structureType.description'),
                    barcodeNum: get(bioValue, 'label'),
                    received: get(bioValue, 'isReceived', 'No'),
                    cwtStatus: get(bioValue, 'legacy.cwtStatus'),
                    cwtCode: get(bioValue, 'legacy.cwtCode'),
                    cwtType: get(bioValue, 'legacy.cwtType')
                })
            }
            results = orderBy(results, ['position'], ['asc']);
            return results;
        }

        return {
            columns,
            visibleColumns,
            tableData,
            loading,
            compKey,
            get,

            species,
            speciesFilterFn,
            speciesLabel,
            speciesOptions,
            dissection,
            dissectionFilterFn,
            dissectionLabel,
            dissectionOptions,
            rack,
            rackFilterFn,
            rackLabel,
            rackOptions,

            newRack,
            addRack,
            saveRack,
            selectRack,
            showRackDialog
        };
    },
});
</script>