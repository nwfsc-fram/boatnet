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
                :lookupQueryOptions="{ key: observer }"
                :emptyMessage="observer ? 'No evaluation periods found' : 'Select observer to populate list'"
                @select="getTrips"
            />
        </div>
        <quasar-table
            :columns.sync="columns"
            :tableData="tableData"
            :loading="loading"
            :visibleColumns="visibleColumns"
            :isDownloadable="true"
            @delete="showDelete"
        />
        <q-dialog v-model="showDeleteDialog">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar
                        icon="warning"
                        color="primary"
                        text-color="white"
                    />
                    <span class="q-ml-sm">Are you sure you want to delete rack with barcode {{ deleteItem.label }}?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn
                        flat
                        label="Yes"
                        color="primary"
                        @click="deleteBio"
                        v-close-popup
                    />
                    <q-btn flat label="No" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>


<script lang="ts">
import { createComponent, ref } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import {
    concat,
    get,
    flattenDeep,
    findIndex,
    orderBy,
    remove,
    set,
    slice,
} from 'lodash';
import QuasarTable from './QuasarTable.vue';
import { commonCols, reportCols } from '../helpers/biospecimensToolCols';
import { createResult } from '../helpers/biospecimensReportCommons';
import {wcgopTripImpll} from '@boatnet/bn-data-access';

Vue.component('QuasarTable', QuasarTable);
Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
    components: { DebrieferSelectComp },
    props: {
        type: String,
    },
    setup(props, context) {
        const masterDB: Client<any> = couchService.masterDB;
        const jp = require('jsonpath');

        const observer: any = ref('');
        const evaluationPeriod: any = ref({});

        const tableData: any = ref([]);
        const loading: any = ref(false);

        const columns: any = ref([]);
        const visibleColumns: any = ref([]);
        const showDeleteDialog: any = ref(false);
        const deleteItem: any = ref({});

        function setCols() {
            visibleColumns.value = commonCols;
            columns.value = concat(commonCols, reportCols);
            columns.value.map((obj: any) => (obj.sortable = true));
        }
        setCols();

        async function getTrips(evalPeriod: any) {
            if (
                evalPeriod &&
                evalPeriod.startDate &&
                evalPeriod.endDate &&
                observer.value
            ) {
                loading.value = true;
                const results: any[] = [];
                const trips = await wcgopTripImpll.getTripsByEvaluationPeriod(evalPeriod);
                for (const trip of trips) {
                    let operationIds = jp.query(trip, '$.operationIDs');
                    operationIds = flattenDeep(operationIds);
                    const operations: any = await masterDB.listWithDocs({
                        keys: operationIds,
                    });
                    for (const operation of operations.rows) {
                        let bios = jp.query(operation, '$..biostructures');
                        bios = flattenDeep(bios);
                        for (const bio of bios) {
                            if (bio) {
                                const bioId = get(bio, '_id', '');
                                const findStr ='$..biostructures[?(@._id=="' + bioId + '")]';
                                const path = jp.paths(operation, findStr);
                                results.push(await createResult(trip, operation, bio, path[0]));
                            }
                        }
                    }
                }
                tableData.value = orderBy(results, ['position'], ['asc']);
                loading.value = false;
            } else {
                tableData.value = [];
            }
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
            const couchBio = jp.nodes(
                doc,
                '$..biostructures[?(@._id=="' + val.id + '")]'
            );
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
            getTrips,
            loading,

            observer,
            evaluationPeriod,

            deleteBio,

            showDeleteDialog,
            deleteItem,
            showDelete
        };
    },
});
</script>