<template>
    <div>
        <DataTable
            :value="vesselSummary"
            :selection.sync="selection"
            dataKey="vessel"
            :loading="isVesselLoading"
            class="p-datatable-sm"
            @row-select="populateSummary"
            @row-unselect="clear"
        >
            <template #header>
                <div>Vessels</div>
            </template>
            <Column selectionMode="single" headerStyle="width: 3em"></Column>
            <Column field="vessel" header="Vessel"></Column>
            <Column field="tripCnt" header="Trips"></Column>
            <Column field="fishery" header="Fishery"></Column>
            <Column field="haulCnt" header="Hauls"></Column>
            <Column field="target" header="Target"></Column>
            <Column field="gearType" header="Gear Type"></Column>
            <Column field="depth" header="Depth"></Column>
        </DataTable>

        <Divider/>

        <DataTable
            :value="wmSummary"
            rowGroupMode="rowspan"
            groupRowsBy="type"
            sortMode="single"
            sortField="brand"
            class="p-datatable-sm"
            :sortOrder="1"
            :loading="isLoading"
        >
            <template #header>
                <div>Sampling Summary</div>
            </template>
            <template #empty>Select a vessel</template>
            <Column field="type" header="Type"></Column>
            <Column field="wm" header="WM"></Column>
            <Column field="catchRecords" header="Catch Records">
                <template #body="slotProps">
                    <div v-on:click="open(slotProps)" class="fakelink">
                        {{ slotProps.data.catchRecords }}
                    </div>
                </template>
            </Column>
            <Column field="cwMin" header="CW Min"></Column>
            <Column field="cwMax" header="CW Max"></Column>
            <Column field="ssAvg" header="SS Avg"></Column>
            <Column field="complete" header="Complete"></Column>
            <Column field="date" header="Date"></Column>
        </DataTable>

        <Divider/>

        <DataTable
            :value="speciesSummary"
            rowGroupMode="rowspan"
            groupRowsBy="type"
            sortMode="single"
            sortField="brand"
            class="p-datatable-sm"
            :sortOrder="1"
            :loading="isLoading"
        >
            <template #header>
                <div>Species Composition Summary</div>
            </template>
            <template #empty>Select a vessel</template>
            <Column field="type" header="Type"></Column>
            <Column field="species" header="Species"></Column>
            <Column field="scRecords" header="SC Records"></Column>
            <Column field="cwTot" header="CW Tot"></Column>
            <Column field="swTot" header="SW Tot"></Column>
            <Column field="count" header="SC Count"></Column>
            <Column field="avgWt" header="Avg Wt"></Column>
            <Column field="bsRecords" header="BS Records"></Column>
            <Column field="spidDate" header="SPID Date"></Column>
        </DataTable>

        <q-dialog
            v-model="showDialog"
            position="right"
            :maximized="maximizedToggle">
            <q-card>
                <q-bar>
                    <q-space/>
                    <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
                        <q-tooltip v-if="maximizedToggle" content-class="bg-white text-primary">Minimize</q-tooltip>
                    </q-btn>
                    <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
                        <q-tooltip v-if="!maximizedToggle" content-class="bg-white text-primary">Maximize</q-tooltip>
                    </q-btn>
                    <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
                    </q-btn>
                </q-bar>
                <q-card-section class="row items-center">
                    <DataTable
                        :value="popoutData"
                        rowGroupMode="rowspan"
                        groupRowsBy="type"
                        sortMode="single"
                        sortField="brand"
                        class="p-datatable-sm"
                        :sortOrder="1"
                    >
                        <template #empty>No data</template>
                        <Column field="trip" header="Trip"></Column>
                        <Column field="haul" header="Haul"></Column>
                        <Column field="catch" header="Catch"></Column>
                        <Column field="wm" header="WM"></Column>
                        <Column field="target" header="Target"></Column>
                        <Column field="otcEst" header="OTC Est."></Column>
                        <Column field="catchKP" header="Catch KP"></Column>
                        <Column field="otcKP" header="OTC KP"></Column>
                        <Column field="fit" header="Fit"></Column>
                        <Column field="cal" header="Cal"></Column>
                    </DataTable>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>


<script lang="ts">
import { createComponent, ref, watch } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { flattenDeep, get, groupBy, maxBy, minBy, sumBy, cloneDeep, orderBy } from 'lodash';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';

Vue.component('Divider', Divider);
Vue.component('DataTable', DataTable);
Vue.component('Button', Button);
Vue.component('Column', Column);
Vue.component('Dialog', Dialog);

export default createComponent({
    setup(props, context) {
        const masterDB: Client<any> = couchService.masterDB;
        const store = context.root.$store;
        const state: any = store.state;

        const currOpps: any = ref([]);
        const vesselSummary: any = ref([]);
        const wmSummary: any = ref([]);
        const speciesSummary: any = ref([]);
        const popoutData: any = ref([]);

        const selection: any = ref([]);
        const isVesselLoading: any = ref(false);
        const isLoading: any = ref(false);
        const showDialog: any = ref(false);
        const maximizedToggle: any = ref(false);

        const jp = require('jsonpath');
        const prioritySpecies = ['Cowcod', 'Yelloweye', 'Eulachon', 'Chinook', 'Coho', 'Dungeness Crab', 'Green Sturegeon'];

        watch(() => state.debriefer.trips, getVesselInfo);

        async function getVesselInfo() {
            vesselSummary.value = [];
            wmSummary.value = [];
            speciesSummary.value = [];
            popoutData.value = [];
            const vesselGroups = groupBy(state.debriefer.trips, 'vessel.vesselName');
            isVesselLoading.value = true;

            for (const vessel of Object.keys(vesselGroups)) {
                const currVesselInfo = vesselGroups[vessel];
                let operationIds = jp.query( currVesselInfo , '$[*].operationIDs');
                operationIds = flattenDeep(operationIds);

                const ops = await masterDB.get(operationIds[0]);

                vesselSummary.value.push({
                    vessel,
                    tripCnt: currVesselInfo.length,
                    fishery: get(currVesselInfo[0], 'fishery.description'),
                    haulCnt: operationIds.length,
                    gearType: get(ops, 'gearType.description'),
                    operations: operationIds
                });
            }
            isVesselLoading.value = false;
        }

        function clear() {
            wmSummary.value = [];
            speciesSummary.value = [];
        }

        function getMaxOrMin(type: string, obj: any, field: string) {
            let maxOrMin: any;
            if (type === 'max') {
                maxOrMin = maxBy(obj, (val: any) => {
                    const curr = get(val, field);
                    return parseFloat(curr);
                });
            } else if (type === 'min') {
                maxOrMin = minBy(obj, (val: any) => {
                    const curr = get(val, field);
                    return parseFloat(curr);
                });
            }
            return get(maxOrMin, field);
        }

        async function populateSummary(info: any) {
            isLoading.value = true;
            wmSummary.value = [];
            speciesSummary.value = [];
            const catches: any[] = [];

            const ops = await masterDB.listWithDocs({
                keys: info.data.operations
            });
            currOpps.value = ops.rows;

            // formatting catches
            for (const operation of currOpps.value) {
                if (operation.catches) {
                    for (const currCatch of operation.catches) {
                        if (currCatch) {
                            const catchVal = currCatch;
                            catchVal.tripNum = operation.legacy.tripId;
                            catchVal.haulNum = operation.operationNum;
                            catches.push(catchVal);
                        }
                    }
                }
            }

            // populating weight methods table
            const weightMethodGroups = groupBy(catches, 'weightMethod.description');
            for (const wm of Object.keys(weightMethodGroups)) {
                const dispositionGroups = groupBy(weightMethodGroups[wm], 'disposition.description');
                for (const disposition of Object.keys(dispositionGroups)) {

                    const minCatchWeight: number = getMaxOrMin('min', dispositionGroups[disposition], 'weight.value');
                    const minSampleWeight: number = getMaxOrMin('min', dispositionGroups[disposition], 'sampleWeight.value');
                    const minWeight = minCatchWeight ? minCatchWeight.toFixed(2) : minSampleWeight.toFixed(2);

                    const maxCatchWeight: number = getMaxOrMin('max', dispositionGroups[disposition], 'weight.value');
                    const maxSampleWeight: number = getMaxOrMin('max', dispositionGroups[disposition], 'sampleWeight.value');
                    const maxWeight = maxCatchWeight ? maxCatchWeight.toFixed(2) : maxSampleWeight.toFixed(2);

                    const children = flattenDeep(jp.query(dispositionGroups[disposition], '$[*].children'));

                    wmSummary.value.push({
                        type: disposition,
                        wm,
                        cwMin: minWeight,
                        cwMax: maxWeight,
                        catchRecords: children.length ? children.length : dispositionGroups[disposition].length,
                        data: dispositionGroups[disposition]
                    });
                }
            }
            wmSummary.value = orderBy(wmSummary.value, ['type'], ['asc']);

            // breaking into subcatch level
            const speciesCatches: any[] = [];
            for (const catchVal of catches) {
                if (catchVal.children && catchVal.children.length > 0) {
                    for (const child of catchVal.children) {
                        const speciesCatchVal = cloneDeep(catchVal);
                        speciesCatchVal.species = get(child, 'catchContent.commonNames[0]');
                        speciesCatchVal.weight = get(child, 'weight.value');
                        speciesCatchVal.count = get(child, 'sampleCount');
                        if (child.baskets && child.baskets.length > 0) {
                            speciesCatchVal.basketCnt = child.baskets.length;
                        }
                        speciesCatches.push(speciesCatchVal);
                    }
                } else {
                    const name = get(catchVal, 'catchContent.commonNames[0]');
                    catchVal.species = name;
                    catchVal.weight = catchVal.weight ? get(catchVal, 'weight.value') : get(catchVal, 'sampleWeight.value');
                    speciesCatches.push(catchVal);
                }
            }

            // populating species table
            const speciesGroups = groupBy(speciesCatches, 'species');
            for (const species of Object.keys(speciesGroups)) {
                const type: string = prioritySpecies.includes(species) ? 'Priority' : 'Other';
                const totCatchWeight: number = sumBy(speciesGroups[species], (val: any) => {
                    const currWeight = get(val, 'weight');
                    return parseFloat(currWeight);
                });
                const weight: string = totCatchWeight ? totCatchWeight.toFixed(2) : '';
                const count: number = sumBy(speciesGroups[species], (val: any) => {
                    const currcount = get(val, 'count');
                    return parseFloat(currcount);
                });
                speciesSummary.value.push({
                    type,
                    species,
                    count,
                    cwTot: weight
                });
            }
            speciesSummary.value = orderBy(speciesSummary.value, ['type', 'species'], ['desc', 'asc']);
            isLoading.value = false;
        }

        function open(selectedInfo: any) {
            showDialog.value = true;
            popoutData.value = [];
            for (const catches of selectedInfo.data.data) {
                if (catches && catches.children) {
                    for (const child of catches.children) {
                        const target = get(child, 'catchContent.commonNames[0]');
                        const wm = get(child, 'weightMethod.description');
                        popoutData.value.push({
                            trip: catches.tripNum,
                            haul: catches.haulNum,
                            catch: catches.catchNum,
                            wm,
                            target
                        });
                    }
                } else {
                    const target = get(catches, 'catchContent.name');
                    const wm = get(catches, 'weightMethod.description');
                    popoutData.value.push({
                        trip: catches.tripNum,
                        haul: catches.haulNum,
                        catch: catches.catchNum,
                        wm,
                        target
                    });
                }
            }
        }

        return {
            vesselSummary,
            wmSummary,
            speciesSummary,
            selection,

            populateSummary,
            clear,
            isVesselLoading,
            isLoading,
            maximizedToggle,

            showDialog,
            open,
            popoutData
        };
    },
});
</script>

<style>
.fakelink {
    color: blue;
    cursor: pointer;
}
</style>