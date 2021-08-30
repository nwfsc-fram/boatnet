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
            :visible-columns="visibleColumns"
            no-data-label="No data"
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
                <q-space />
                <q-btn color="primary" icon-right="archive" label="Download" no-caps @click="exportTable"/>
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
                        {{ displayValue(props, col) }}
                        <q-popup-edit
                            v-if="col.isEditable"
                            v-model="props.row[col.field]"
                            buttons
                            :title="col.label"
                            @save="save(props.row, col, props.row[col.field])"
                        >
                            <q-input
                                v-model="props.row[col.field]"
                                :type="col.type"
                                dense
                                autofocus
                                counter
                            />
                        </q-popup-edit>
                    </q-td>
                    <q-td auto-width>
                        <q-btn
                            size="sm"
                            color="primary"
                            round
                            dense
                            icon="delete_outline"
                            @click="deleteBio(props.row)"
                        >
                            <q-tooltip class="bg-accent"
                                >Delete Record</q-tooltip
                            >
                        </q-btn>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
        <rack-dialog :show.sync="showRackDialog" @saveRack="saveRack"/>
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
import { exportFile } from 'quasar';

import RackDialog from './RackDialog.vue';
Vue.component('RackDialog', RackDialog);

Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    setup(props, context) {
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
        };

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
                type: 'text',
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
                path: 'legacy.agelocation',
                isEditable: true,
                type: 'text',
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
        ];

        function setCols(val: any) {
            const dissectionType = get(val, dissectionLabel);
            if (dissectionType === 'Otolith') {
                columns.value = concat(commonCols, otolithCols);
            } else {
                columns.value = concat(commonCols, snoutCols);
            }
            columns.value.map((obj: any) =>  obj.sortable = true);
            visibleColumns.value = jp.query(columns.value, '$[*].name');
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
            loading.value = false;
        }

        function displayValue(propsVal: any, col: any) {
            let val = get(propsVal.row, col.field);
            if (col.type === 'date') {
                val = moment(val).format('DD-MMM-YY, hh:mm');
            } else if (col.type === 'coord') {
                val = '[' + round(val[0], 2) + ', ' + round(val[1], 2) + ']';
            }
            return val;
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
                const findStr =
                    '$..biostructures[?(@._id=="' + operation.value + '")]';
                const bios = jp.nodes(operation, findStr);
                const bioValue = bios[0].value;

                const catchPath = jp.stringify(slice(bios[0].path, 0, 4));
                const speciesPath = jp.stringify(slice(bios[0].path, 0, 6));

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
                    gearType: get(operation, 'doc.gearType.description'),
                    gearPerformance: get(
                        operation,
                        'doc.gearPerformance.description'
                    ),
                    haulUpDate: get(operation, 'doc.locations[0].locationDate'),
                    haulUpCoord: [
                        get(
                            operation,
                            'doc.locations[0].location.coordinates[0]'
                        ),
                        get(
                            operation,
                            'doc.locations[0].location.coordinates[1]'
                        ),
                    ],
                    haulSetDate: get(
                        operation,
                        'doc.locations[1].locationDate'
                    ),
                    haulSetCoord: [
                        get(
                            operation,
                            'doc.locations[1].location.coordinates[0]'
                        ),
                        get(
                            operation,
                            'doc.locations[1].location.coordinates[1]'
                        ),
                    ],

                    // trip report attributes
                    observer:
                        get(trip, 'observer.firstName') + ' ' + get(trip, 'observer.lastName'),
                    vessel: get(trip, 'vessel.vesselName'),
                    departureDate: get(trip, 'departureDate', ''),
                    departurePort: get(trip, 'departurePort.name', ''),
                    returnDate: get(trip, 'returnDate', ''),
                    returnPort: get(trip, 'returnPort.name', ''),
                    fishery: get(trip, 'fishery.description', ''),
                });
            }
            results = orderBy(results, ['position'], ['asc']);
            return results;
        }

        async function save(newValObj: any, colInfo: any, updatedVal: any) {
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

        function exportTable() {
            // naive encoding to csv format
            const content = [columns.value.map((col: any) => wrapCsvValue(col.label))].concat(
                tableData.value.map((row: any) => columns.value.map((col: any) => wrapCsvValue(
                    typeof col.field === 'function'
                    ? col.field(row)
                    : row[ col.field === void 0 ? col.name : col.field ],
                    col.format
                )).join(','))
                ).join('\r\n');

            const status = exportFile('table-export.csv', content, 'text/csv');
        }

        function wrapCsvValue(val: any, formatFn?: any) {
            let formatted = formatFn !== void 0 ? formatFn(val) : val;

            formatted =
                formatted === void 0 || formatted === null ? '' : String(formatted);

            formatted = formatted.split('"').join('""');
            /**
             * Excel accepts \n and \r in strings, but some other CSV parsers do not
             * Uncomment the next two lines to escape new lines
             */
            // .split('\n').join('\\n')
            // .split('\r').join('\\r')

            return `"${formatted}"`;
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
            exportTable,
            setCols,
            displayValue,
            showRackDialog,
            save,
            deleteBio,
            pagination
        };
    },
});
</script>