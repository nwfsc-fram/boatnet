<template>
    <div>
        <div class="q-pa-md">
            <debriefer-select-comp
                label="Observer"
                style="display: inline-block; width: 30%"
                :val.sync="observer"
                lookupView="all_wcgop_observers"
                lookupLabel="value"
                lookupValue="id"
            />
            <debriefer-select-comp
                v-if="type === 'scan'"
                style="display: inline-block; width: 30%"
                class="q-pl-md"
                :val:sync="evaluationPeriod"
                label="Evaluation Period"
                lookupView="evaluation_periods"
                lookupLabel="value"
                lookupValue="doc"
                :lookupQueryOptions="{ key: observer}"
                :emptyMessage="observer ? 'No evaluation periods found' : 'Select observer to populate list'"
            />
            <span  v-if="type === 'rack'">
            <v-date-picker v-model="range" is-range style="display: inline-block; width: 30%" class="q-mx-md">
                <template v-slot="{ inputValue, inputEvents }">
                    <div>
                        <input
                            :value="inputValue.start"
                            v-on="inputEvents.start"
                            class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
                        />
                            <input
                            :value="inputValue.end"
                            v-on="inputEvents.end"
                            class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
                        />
      
                       <!-- <q-input
                            style="display: inline-block; width: 45%"
                            class="q-mr-md"
                            v-model="inputValue.start"
                            v-on="inputEvents.start"
                            label="Start Date"
                        >
                            <template v-slot:prepend>
                                <q-icon name="event" />
                            </template>
                        </q-input>
                        <q-input
                            style="display: inline-block; width: 45%"
                            v-model="inputValue.end"
                            v-on="inputEvents.end"
                            label="End Date"
                        >
                            <template v-slot:prepend>
                                <q-icon name="event" />
                            </template>
                        </q-input>-->
                    </div>
                </template>
            </v-date-picker>
            <debriefer-select-comp
                style="display: inline-block; width: 30%"
                label="Species"
                :val.sync="species"
                lookupView="biostructures_species"
                lookupLabel="key"
                lookupValue="key"
                :clearable="true"
            />
            <debriefer-select-comp
                style="display: inline-block; width: 30%"
                label="Rack Name"
                :val.sync="rack"
                lookupView="rack"
                lookupLabel="doc.rackName"
                lookupValue="doc"
                :clearable="true"
            />
            <debriefer-select-comp
                style="display: inline-block; width: 30%"
                class="q-px-md"
                label="Dissection Type"
                :val.sync="dissection"
                lookupView="wcgop-lookups"
                lookupLabel="doc.description"
                lookupValue="doc.description"
                :clearable="true"
                :lookupQueryOptions="{ key: 'biostructure-type' }"
            />
            <q-input
                style="display: inline-block; width: 30%"
                label="Barcode"
                debounce="500"
                v-model="barcode"
                clearable
                clear-icon="close"
            >
                <template v-slot:prepend>
                    <q-icon name="search" />
                </template>
            </q-input>
            </span>
        </div>
        <div class="row">
            <q-btn v-if="type === 'rack'" label="search" color="primary" @click="search" style="text-align: right"/>
        </div>
        <quasar-table
            :columns.sync="columns"
            :tableData="tableData"
            :loading="loading"
            :visibleColumns="visibleColumns"
            :isDownloadable="true"
            @save="save"
            @delete="showDelete"
        />
        <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete rack with barcode {{deleteItem.label}}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Yes" color="primary" @click="deleteBio" v-close-popup />
          <q-btn flat label="No" color="primary" v-close-popup />
        </q-card-actions>
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
import {
    concat,
    get,
    groupBy,
    flattenDeep,
    findIndex,
    orderBy,
    remove,
    set,
    slice
} from 'lodash';
import QuasarTable from './QuasarTable.vue';
import moment from 'moment';

Vue.component('QuasarTable', QuasarTable);
Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);
import { proccessDissectionsCols, snoutCols, otolithCols, reportCols } from '../helpers/biospecimensToolCols';
import { createResult } from '../helpers/biospecimensReportCommons';

export default createComponent({
    components: { DebrieferSelectComp },
    props: {
        type: String
    },
    setup(props, context) {
        const state = context.root.$store.state;
        const masterDB: Client<any> = couchService.masterDB;
        const jp = require('jsonpath');
        const compKey: any = ref(0); // Ensures the rack list is refreshed when a new rack is added

        const species: any = ref('');
        const dissection: any = ref('');
        const rack: any = ref({});
        const barcode: any = ref('');
        const observer: any = ref('');
        const evaluationPeriod: any = ref({});
        const range: any = ref({});

        const speciesLabel = 'doc.speciesId.commonNames[0]';
        const dissectionLabel = 'doc.dissectionType.description';
        const rackLabel = 'value';

        const tableData: any = ref([]);
        const loading: any = ref(false);

        const allRacks: any = ref(null);
        const speciesOptions: any = ref([]);
        const dissectionOptions: any = ref([]);
        const rackOptions: any = ref([]);

        const columns: any = ref([]);
        const visibleColumns: any = ref([]);
        const showDeleteDialog: any = ref(false);
        const deleteItem: any = ref({});

        const pagination: any = {
            sortBy: 'desc',
            descending: false,
            rowsPerPage: 25
        }

        watch(dissection, (updatedSelection, prevSelection) => {
            if (updatedSelection) {
                setCols(updatedSelection)
            }
        });

        function setCols(dissectionType: any) {
            if (dissectionType === 'Otolith') {
                columns.value = concat(proccessDissectionsCols, otolithCols);
            } else {
                columns.value = concat(proccessDissectionsCols, snoutCols);
            }
            visibleColumns.value = columns.value;
            columns.value = concat(columns.value, reportCols);
            columns.value.map((obj: any) =>  obj.sortable = true);
        }
        setCols(null);

        async function search() {
            loading.value = true;
            let results = [];
            let searchKeys: any[] = [];
            if (observer.value) {
                const trips = await masterDB.viewWithDocs('obs_web', 'wcgop_trips_by_observerId', { key: observer.value});
                let operationIds = jp.query(trips.rows, '$[*].doc.operationIDs');
                operationIds = flattenDeep(operationIds);

                const operations = await masterDB.listWithDocs({keys: operationIds});
                let biostructures = jp.query(operations.rows, '$[*]..biostructures');
                biostructures = flattenDeep(biostructures);

                const biostructureIds = jp.apply(biostructures, '$[*]._id', (val: any) => {return ['id', val]});
                const formattedBioIds = jp.query(biostructureIds, '$[*].value');
                searchKeys = concat(searchKeys, formattedBioIds);
            }
            if (range.value) {
                const biostructures: any = await masterDB.viewWithDocs(
                    'obs_web',
                    'biostructures_compound_fields',
                    {
                        start_key: ['upDate', moment(range.value.start).hour(0).minute(0).second(0).format()],
                        end_key: ['upDate', moment(range.value.end).hour(0).minute(0).second(0).format()],
                        include_docs: true,
                        limit: 100
                    } as any
                );
                const biostructureIds = jp.apply(biostructures.rows, '$[*].value', (val: any) => {return ['id', val]});
                const formattedBioIds = jp.query(biostructureIds, '$[*].value');
                searchKeys = concat(searchKeys, formattedBioIds);
            }
            if (species.value) {
                searchKeys.push(['species', species.value]);
            }
            if (get(rack, 'value.rackId')) {
                searchKeys.push(['rackId', rack.value.rackId]);
            }
            if (dissection.value) {
                searchKeys.push(['structureType', dissection.value]);
            }
            if (barcode.value) {
                searchKeys.push(['barcode', parseInt(barcode.value)]);
            }
            let operationDocs: any = await masterDB.viewWithDocs(
                'obs_web',
                'biostructures_compound_fields',
                {
                    keys: searchKeys,
                    include_docs: true,
                    limit: 100
                } as any
            );
            const operationIds = jp.query(operationDocs.rows, '$[*].id');

            const tripDocs: any = await masterDB.viewWithDocs(
                'obs_web',
                'get_trip_by_operationId',
                { keys: operationIds }
            );
            for (let operation of operationDocs.rows) {
                const operationDoc = operation.doc;
                const findStr = '$..biostructures[?(@._id=="' + operation.value + '")]';
                const bios = jp.nodes(operationDoc, findStr);
                const bioValue = bios[0].value;
                const trip = get(tripDocs, "rows[tripIndex].doc", {});
                results.push(createResult(trip, operationDoc, bioValue, bios[0].path));
            }
            tableData.value = orderBy(results, ['position'], ['asc']);
            loading.value = false;
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

        function showDelete(val: any) {
            showDeleteDialog.value = true;
            deleteItem.value = val;
        }

        function deleteBio() {
            // delete from the ui
            const val = deleteItem.value;
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

            barcode,
            species,
            observer,
            evaluationPeriod,
            range,

            speciesLabel,
            speciesOptions,
            dissection,
            dissectionLabel,
            dissectionOptions,
            rack,
            rackLabel,
            rackOptions,

            setCols,
            save,
            deleteBio,
            pagination,

            search,
            showDeleteDialog,
            deleteItem,
            showDelete
        };
    },
});
</script>