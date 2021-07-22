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
                clear-icon="close"
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
                clear-icon="close"
                @filter="dissectionFilterFn"
                :options="dissectionOptions"
                :option-label="(item) => get(item, dissectionLabel)"
                :option-value="(item) => get(item, dissectionLabel)"
                @input="setCols"
            />
            <q-select
                style="display: inline-block; width: 30%"
                label="Rack Name"
                v-model="rack"
                use-input
                hide-selected
                fill-input
                clearable
                clear-icon="close"
                @filter="rackFilterFn"
                :options="rackOptions"
                :option-label="(item) => get(item, rackLabel)"
                :option-value="(item) => get(item, rackLabel)"
                @input="selectRack"
            />
            <q-btn
                v-if="isAuthorized(['debriefer'])"
                round
                class="q-mr-md"
                style="display: inline-block"
                color="white"
                text-color="black"
                icon="add"
                @click="addRack"
            >
                <q-tooltip class="bg-accent">Create New Rack</q-tooltip>
            </q-btn>
        </div>
        <quasar-table
            :columns.sync="columns"
            :tableData="tableData"
            :loading="loading"
            :visibleColumns="visibleColumns"
            :isDownloadable="true"
            @save="save"
            @delete="deleteBio"
        />
        <rack-dialog
            :show.sync="showRackDialog"
            :rackInfo="rack"
            @saveRack="saveRack"
        />
    </div>
</template>


<script lang="ts">
import { createComponent, ref, reactive, watch } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import {
    concat,
    get,
    filter,
    findIndex,
    orderBy,
    round,
    remove,
    set,
    slice,
    uniqBy,
} from 'lodash';
import moment from 'moment';
import { exportFile } from 'quasar'

import RackDialog from './RackDialog.vue';

import QuasarTable from './QuasarTable.vue';
Vue.component('QuasarTable', QuasarTable);

Vue.component('RackDialog', RackDialog);

Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    setup(props, context) {
        const state = context.root.$store.state;
        const masterDB: Client<any> = couchService.masterDB;
        const jp = require('jsonpath');
        const compKey: any = ref(0); // Ensures the rack list is refreshed when a new rack is added

        const species: any = ref('');
        const dissection: any = ref('');
        const rack: any = ref('');

        const speciesLabel = 'doc.speciesId.commonNames[0]';
        const dissectionLabel = 'doc.dissectionType.description';
        const rackLabel = 'value';

        const showRackDialog: any = ref(false);
        const tableData: any = ref([]);
        const loading: any = ref(false);

        const allRacks: any = ref(null);
        const speciesOptions: any = ref([]);
        const dissectionOptions: any = ref([]);
        const rackOptions: any = ref([]);

        const columns: any = ref([]);
        const visibleColumns: any = ref([]);

        const pagination: any = {
            sortBy: 'desc',
            descending: false,
            rowsPerPage: 25
        }

        const commonCols: any[] = [
            {
                name: 'position',
                label: 'Position',
                field: 'position',
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
                name: 'catchNum',
                label: 'Catch #',
                field: 'catchNum',
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
                name: 'label',
                label: 'Barcode #',
                path: 'label',
                field: 'label',
            },
            {
                name: 'received',
                label: 'Received',
                field: 'received',
            },
        ];

        const snoutCols = [
            {
                name: 'cwtCode',
                label: 'CWT Code',
                field: 'cwtCode',
                path: 'legacy.cwtCode',
                isEditable: true,
                type: 'text',
            },
            {
                name: 'cwtType',
                label: 'CWT Type',
                field: 'cwtType',
                path: 'legacy.cwtType',
                isEditable: true,
                type: 'text',
            },
            {
                name: 'cwtStatus',
                label: 'CWT Status',
                field: 'cwtStatus',
                path: 'legacy.cwtStatus',
                isEditable: true,
                type: 'text',
            },
        ];

        const otolithCols = [
            {
                name: 'age',
                label: 'Age',
                field: 'age',
                path: 'legacy.age',
                isEditable: true,
                type: 'number',
            },
            {
                name: 'ageReader',
                label: 'Reader',
                field: 'ageReader',
                path: 'legacy.ageReader',
                isEditable: true,
                type: 'text',
            },
            {
                name: 'ageMethod',
                label: 'Method',
                field: 'ageMethod',
                path: 'legacy.ageMethod',
                isEditable: true,
                type: 'select',
                key: 'age-methods'
            },
            {
                name: 'ageDate',
                label: 'Date',
                field: 'ageDate',
                path: 'legacy.ageDate',
                isEditable: true,
                type: 'date',
            },
            {
                name: 'ageLocation',
                label: 'Location',
                field: 'ageLocation',
                path: 'legacy.ageLocation',
                isEditable: true,
                type: 'select',
                key: 'reader-location'
            },
        ];

        const reportCols = [
            {
                name: 'observer',
                label: 'Observer',
                field: 'observer',
            },
            {
                name: 'vessel',
                label: 'Vessel',
                field: 'vessel',
            },
            {
                name: 'departureDate',
                label: 'Departure Date',
                field: 'departureDate',
                type: 'date',
            },
            {
                name: 'departurePort',
                label: 'Departure Port',
                field: 'departurePort',
            },
            {
                name: 'returnDate',
                label: 'Return Date',
                field: 'returnDate',
                type: 'date',
            },
            {
                name: 'returnPort',
                label: 'Return Port',
                field: 'returnPort',
            },
            {
                name: 'fishery',
                label: 'Fishery',
                field: 'fishery',
            },
            {
                name: 'gearType',
                label: 'Gear Type',
                field: 'gearType',
            },
            {
                name: 'gearPerformance',
                label: 'Gear Perf',
                field: 'gearPerformance',
            },
            {
                name: 'haulUpDate',
                label: 'Haul Up Date',
                field: 'haulUpDate',
                type: 'date',
            },
            {
                name: 'haulUpCoord',
                label: 'Haul Up Coord',
                field: 'haulUpCoord',
                type: 'coord',
            },
            {
                name: 'haulSetDate',
                label: 'Haul Set Date',
                field: 'haulSetDate',
                type: 'date',
            },
            {
                name: 'haulSetCoord',
                label: 'Haul Set Coord',
                field: 'haulSetCoord',
                type: 'coord',
            },
            {
                name: 'sex',
                label: 'Sex',
                field: 'sex'
            },
            {
                name: 'length',
                label: 'Length',
                field: 'length'
            },
            {
                name: 'weight',
                label: 'Weight',
                field: 'weight',
                type: 'number'
            },
            {
                name: 'rackName',
                label: 'Rack Name',
                field: 'rackName',
            },
            {
                name: 'rackLocation',
                label: 'Rack Location',
                field: 'rackLocation',
            },
            {
                name: 'tag',
                label: 'Tag/Band Id',
                field: 'tag'
            },
        ];

        function isAuthorized(authorizedRoles: string[]) {
            for (const role of authorizedRoles) {
                if (state.user.userRoles.includes(role)) {
                    return true;
                }
            }
            return false;
        }

        function setCols(val: any) {
            const dissectionType = get(val, dissectionLabel);
            if (dissectionType === 'Otolith') {
                columns.value = concat(commonCols, otolithCols);
            } else {
                columns.value = concat(commonCols, snoutCols);
            }
            columns.value.map((obj: any) =>  obj.sortable = true);
            visibleColumns.value = columns.value;
            columns.value = concat(columns.value, reportCols);
        }
        setCols(null); 

        async function speciesFilterFn(val: any, update: any) {
            await filterFn(val, update, speciesLabel, speciesOptions, 'species');
        }

        async function dissectionFilterFn(val: any, update: any) {
            await filterFn(val, update, dissectionLabel, dissectionOptions, 'dissection');
        }

        async function rackFilterFn(val: any, update: any) {
            await filterFn(val, update, rackLabel, rackOptions, 'rack');
        }

        async function filterFn(
            val: any,
            update: any,
            label: string,
            optionsList: any,
            type: string
        ) {
            if (allRacks.value === null) {
                allRacks.value = await masterDB.viewWithDocs('obs_web', 'rack');
                allRacks.value = allRacks.value.rows;
            }
            let filteredList: any[] = allRacks.value;

            if (type !== 'species') {
                const speciesName = get(species.value, speciesLabel);
                filteredList = filter(
                    filteredList,
                    speciesName ? [speciesLabel, speciesName] : {}
                );
            }
            if (type !== 'dissection') {
                const dissectionName = get(dissection.value, dissectionLabel);
                filteredList = filter(
                    filteredList,
                    dissectionName ? [dissectionLabel, dissectionName] : {}
                );
            }

            speciesOptions.value = uniqBy(filteredList, speciesLabel);
            speciesOptions.value = orderBy(speciesOptions.value, speciesLabel);
            dissectionOptions.value = uniqBy(filteredList, dissectionLabel);
            dissectionOptions.value = orderBy(
                dissectionOptions.value,
                dissectionLabel
            );
            rackOptions.value = orderBy(filteredList, rackLabel);

            update(() => {
                const needle = val.toLowerCase();
                optionsList.value = filter(optionsList.value, (option: any) => {
                    const currLabel = get(option, label, '').toLowerCase();
                    return currLabel.includes(needle);
                });
                return optionsList.value;
            });
        }

        function addRack() {
            showRackDialog.value = true;
        }

        async function saveRack() {
            const updatedRacks = await masterDB.viewWithDocs('obs_web', 'rack');
            allRacks.value = orderBy(updatedRacks.rows, rackLabel);
        }

        async function selectRack(val: any) {
            loading.value = true;
            species.value = val;
            dissection.value = val;
            tableData.value = val ? await select('rackId', val.doc.rackId) : [];
            setCols(val);
            loading.value = false;
        }

        async function select(fieldName: any, fieldVal: any) {
            let results = [];
            const operationDocs: any = await masterDB.viewWithDocs(
                'obs_web',
                'biostructures_compound_fields',
                {
                    key: [fieldName, fieldVal],
                    include_docs: true,
                } as any
            );
            const operationIds = jp.query(operationDocs.rows, '$[*].id');
            const tripDocs: any = await masterDB.viewWithDocs(
                'obs_web',
                'get_trip_by_operationId',
                { keys: operationIds }
            );
            for (const operation of operationDocs.rows) {
                const findStr = '$..biostructures[?(@._id=="' + operation.value + '")]';
                const bios = jp.nodes(operation, findStr);
                const bioValue = bios[0].value;

                const catchPath = jp.stringify(slice(bios[0].path, 0, 4));
                const speciesPath = jp.stringify(slice(bios[0].path, 0, 6));
                const specimenPath = jp.stringify(slice(bios[0].path, 0, 8));

                const tripIndex = findIndex(tripDocs.rows, ['key', operation.id]);
                const trip = tripDocs.rows[tripIndex].doc;

                results.push({
                    position: get(bioValue, 'legacy.rackPosition'),
                    tripNum: get(operation, 'doc.legacy.tripId'),
                    haulNum: get(operation, 'doc.operationNum'),
                    catchNum: jp.value(operation, catchPath + '.catchNum'),
                    species: jp.value(
                        operation,
                        speciesPath + '.catchContent.commonNames[0]'
                    ),
                    dissection: get(bioValue, 'structureType.description'),
                    label: get(bioValue, 'label'),
                    received: get(bioValue, 'isReceived', 'No'),
                    cwtStatus: get(bioValue, 'legacy.cwtStatus'),
                    cwtCode: get(bioValue, 'legacy.cwtCode'),
                    cwtType: get(bioValue, 'legacy.cwtType'),
                    doc: operation.doc,
                    id: operation.value,
                    age: get(bioValue, 'legacy.age'),
                    ageReader: get(bioValue, 'legacy.ageReader'),
                    ageDate: get(bioValue, 'legacy.ageDate'),
                    ageLocation: get(bioValue, 'legacy.ageLocation'),
                    ageMethod: get(bioValue, 'legacy.ageMethod'),

                    // haul report attributes
                    gearType: get(operation, 'gearType.description'),
                    gearPerformance: get(operation, 'gearPerformance.description'),
                    haulUpDate: get(operation, 'locations[0].locationDate'),
                    haulUpCoord: [
                        get(operation, 'locations[0].location.coordinates[0]'),
                        get(operation, 'locations[0].location.coordinates[1]'),
                    ],
                    haulSetDate: get(operation, 'locations[1].locationDate'),
                    haulSetCoord: [
                        get(operation, 'locations[1].location.coordinates[0]'),
                        get(operation, 'locations[1].location.coordinates[1]'),
                    ],

                    // trip report attributes
                    observer: get(trip, 'observer.firstName') + ' ' + get(trip, 'observer.lastName'),
                    vessel: get(trip, 'vessel.vesselName'),
                    departureDate: get(trip, 'departureDate', ''),
                    departurePort: get(trip, 'departurePort.name', ''),
                    returnDate: get(trip, 'returnDate', ''),
                    returnPort: get(trip, 'returnPort.name', ''),
                    fishery: get(trip, 'fishery.description', ''),

                    sex: jp.value(operation, specimenPath + '.sex'),
                    length: jp.value(operation, specimenPath + '.length.value'),
                    weight: jp.value(operation, specimenPath + '.weight.value'),
                    tag: jp.value(operation, specimenPath + '.tags[0]')
                });
            }
            results = orderBy(results, ['position'], ['asc']);
            return results;
        }

        async function save(newInfo: any) {
            const newValObj = get(newInfo, 'newValObj');
            const colInfo = get(newInfo, 'colInfo');
            const updatedVal = get(newInfo, 'updatedVal');

            const doc = newValObj.doc;
            const couchBio = jp.nodes(doc, '$..biostructures[?(@._id=="' + newValObj.id + '")]');

            const path = jp.stringify(couchBio[0].path).slice(2);
            const currBio = couchBio[0].value;

            set(currBio, colInfo.path, updatedVal);
            set(doc, path, currBio);
            const result = await masterDB.put(doc._id, doc, doc._rev);
            const updateIndex = findIndex(tableData.value, ['id', newValObj.id]);
            set(tableData.value, '[' + updateIndex + '].doc._rev', result.rev);
        }

        function deleteBio(val: any) {
            // delete from the ui
            const deleteIndex = findIndex(tableData.value, ['id', val.id]);
            tableData.value.splice(deleteIndex, 1);

            // delete bio from couch doc
            const doc = val.doc;
            const couchBio = jp.nodes(doc, '$..biostructures[?(@._id=="' + val.id + '")]');
            const path = jp.stringify(slice(couchBio[0].path, 0, 8));
            const biostructures: any[] = jp.query(doc, path);
            remove(biostructures[0], (bio: any) => bio._id === val.id);
            set(doc, path, biostructures);
            masterDB.put(doc._id, doc, doc._rev);
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

            addRack,
            saveRack,
            selectRack,
            setCols,
            showRackDialog,
            save,
            deleteBio,
            pagination,
            isAuthorized,
        };
    },
});
</script>