<template>
    <div>
        <span>Selected Trips: </span>
        <MultiSelect
            v-model="selectedTrips"
            :options="tripsList"
            optionLabel="legacy.tripId"
            placeholder="Select Trips"
            style="width: 200px"
            @change="updateSelectedTrips"
        />
        <Divider/>
        <DataTable
            :value="vesselSummary"
            :selection.sync="selectedVessel"
            dataKey="vessel"
            :loading="isVesselLoading"
            class="p-datatable-sm"
            @row-select="populateSummary"
            @row-unselect="clear"
        >
            <template #header>
                <div>Vessels</div>
            </template>
            <template #empty>No Data</template>
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
            <Column field="scRecords" header="SC Records">
                <template #body="slotProps">
                    <div v-on:click="open(slotProps)" class="fakelink">
                        {{ slotProps.data.scRecords }}
                    </div>
                </template>
            </Column>
            <Column field="weight" header="Weight Total"></Column>
            <Column field="basketWt" header="Basket Total"></Column>
            <Column field="count" header="Count"></Column>
            <Column field="avgWt" header="Avg Wt"></Column>
            <Column field="bsRecords" header="BS Records">
                <template #body="slotProps">
                    <div v-on:click="goToBios(slotProps.data)" class="fakelink">
                        {{ slotProps.data.bsRecords }}
                    </div>
                </template>
            </Column>
            <Column field="spidDate" header="SPID Date"></Column>
        </DataTable>

        <q-dialog
            v-model="showDialog"
            position="right"
            :maximized="maximizedToggle"
            full-width
        >
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
                         <Column
                            v-for="col of popoutCols"
                            :field="col.field"
                            :header="col.header"
                            :key="col.field"
                        />
                    </DataTable>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>


<script lang="ts">
import { createComponent, ref, watch } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { cloneDeep, concat, flattenDeep, get, groupBy,
        max, maxBy, min, minBy, orderBy, remove, round, sumBy, uniq } from 'lodash';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import MultiSelect from 'primevue/multiselect';

Vue.component('MultiSelect', MultiSelect);
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

        const selectedVessel: any = ref([]);
        const tripsList: any = ref(state.debriefer.trips);
        const selectedTrips: any = ref([]);
        const isVesselLoading: any = ref(false);
        const isLoading: any = ref(false);
        const showDialog: any = ref(false);
        const maximizedToggle: any = ref(false);

        const jp = require('jsonpath');
        const flatten = require('flat');
        const unflatten = flatten.unflatten;

        const prioritySpecies = ['Cowcod', 'Yelloweye', 'Eulachon', 'Chinook', 'Coho', 'Dungeness Crab', 'Green Sturegeon'];

        const popoutCols: any = ref([]);
        const otcCols = [
            {
                field: 'tripNum',
                header: 'Trip #'
            },
            {
                field: 'haulNum',
                header: 'Haul #'
            },
            {
                field: 'otcWM',
                header: 'OTC WM'
            },
            {
                field: 'target',
                header: 'Target'
            },
            {
                field: 'otcWt',
                header: 'OTC (lbs)'
            },
            {
                field: 'totalCW',
                header: 'Total CW'
            },
            {
                field: 'subCW',
                header: 'OTC - Total CW'
            },
            {
                field: 'towTime',
                header: 'Tow Time'
            },
            {
                field: 'fit',
                header: 'Fit #'
            },
            {
                field: 'calWt',
                header: 'Cal WT'
            }
        ];

        const retainedWMCols = [
            {
                field: 'tripNum',
                header: 'Trip #'
            },
            {
                field: 'haulNum',
                header: 'Haul #'
            },
            {
                field: 'catchNum',
                header: 'Catch #'
            },
            {
                field: 'disposition',
                header: 'R/D'
            },
            {
                field: 'wm',
                header: 'WM'
            },
            {
                field: 'name',
                header: 'Name'
            },
            {
                field: 'weight',
                header: 'Weight'
            },
            {
                field: 'count',
                header: 'Count'
            },
            {
                field: 'sampleWt',
                header: 'Sample Wt'
            },
            {
                field: 'sampleCnt',
                header: 'Sample Cnt'
            },
            {
                field: 'ratio',
                header: 'Ratio'
            },
            {
                field: 'cab', // catch additional baskets
                header: 'CAB'
            }
        ];

        const discardedWMCols = [
            {
                field: 'tripNum',
                header: 'Trip #'
            },
            {
                field: 'haulNum',
                header: 'Haul #'
            },
            {
                field: 'catchNum',
                header: 'Catch #'
            },
            {
                field: 'disposition',
                header: 'R/D'
            },
            {
                field: 'wm',
                header: 'WM'
            },
            {
                field: 'name',
                header: 'Name'
            },
            {
                field: 'weight',
                header: 'Weight'
            },
            {
                field: 'count',
                header: 'Count'
            },
            {
                field: 'discard',
                header: 'Discard'
            },
            {
                field: 'sampleWt',
                header: 'Sample Wt'
            },
            {
                field: 'sampleCnt',
                header: 'Sample Cnt'
            },
            {
                field: 'ratio',
                header: 'Ratio'
            },
            {
                field: 'cab', // catch additional baskets
                header: 'CAB'
            },
            {
                field: 'ssTotal',
                header: 'SS Total'
            }
        ];

        const speciesCompCols = [
            {
                field: 'tripNum',
                header: 'Trip #'
            },
            {
                field: 'haulNum',
                header: 'Haul #'
            },
            {
                field: 'catchNum',
                header: 'Catch #'
            },
            {
                field: 'wm',
                header: 'WM'
            },
            {
                field: 'name',
                header: 'Name'
            },
            {
                field: 'weight',
                header: 'Weight'
            },
            {
                field: 'sampleWeight',
                header: 'Sample Wt'
            },
            {
                field: 'fishNum',
                header: 'Fish #'
            },
            {
                field: 'count',
                header: 'Count'
            },
            {
                field: 'avgWt',
                header: 'Avg Wt'
            },
            {
                field: 'baskets',
                header: 'Baskets'
            },
            {
                field: 'discard',
                header: 'Discard'
            },
            {
                field: 'biolist',
                header: 'Biolist'
            },
            {
                field: 'specimenCnt',
                header: 'Specimen Cnt'
            },
        ];

        watch(() => state.debriefer.trips, async () => {
            tripsList.value = state.debriefer.trips;
            selectedTrips.value = tripsList.value;
            await getVesselInfo();
        });

        function updateSelectedTrips(data: any) {
            getVesselInfo();
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

        function formatWeight(val: number) {
            return val ? round(val, 2) : undefined;
        }

        async function getVesselInfo() {
            isVesselLoading.value = true;
            vesselSummary.value = [];
            wmSummary.value = [];
            speciesSummary.value = [];
            popoutData.value = [];
            const vesselGroups = groupBy(selectedTrips.value, 'vessel.vesselName');

            for (const vessel of Object.keys(vesselGroups)) {
                const currVesselInfo = vesselGroups[vessel];

                let operationIds = jp.query(currVesselInfo , '$[*].operationIDs');
                operationIds = flattenDeep(operationIds);
                const operationResults = await masterDB.listWithDocs({ keys: operationIds});
                const operations = operationResults.rows;

                let gearType = jp.query(operations, '$[*].gearType.description');
                gearType = uniq(gearType).join(',');

                let targetStrategy = jp.query(operations, '$[*].targetStrategy');
                targetStrategy = uniq(targetStrategy).join(',');

                const startDepth = jp.query(operations, '$[*].locations[0].depth.value');
                const endDept = jp.query(operations, '$[*].locations[1].depth.value');
                const depths = concat(startDepth, endDept);

                vesselSummary.value.push({
                    vessel,
                    tripCnt: currVesselInfo.length,
                    fishery: get(currVesselInfo[0], 'fishery.description'),
                    haulCnt: operationIds.length,
                    targetStrategy,
                    gearType,
                    depth: [min(depths), max(depths)].join(', '),
                    operations,
                    trips: currVesselInfo
                });
            }
            isVesselLoading.value = false;
        }

        async function populateSummary(info: any) {
            isLoading.value = true;
            wmSummary.value = [];
            speciesSummary.value = [];
            const catches: any[] = [];

            currOpps.value = info.data.operations;

            const otcWMs = groupBy(currOpps.value, 'observerTotalCatch.weightMethod.description');
            for (const otcWM of Object.keys(otcWMs)) {
                const currOTC = otcWMs[otcWM];
                const weightFieldName = 'observerTotalCatch.measurement.value';
                const minOTCWt = getMaxOrMin('min', currOTC, weightFieldName);
                const maxOTCWt = getMaxOrMin('max', currOTC, weightFieldName);
                wmSummary.value.push({
                    type: 'OTC WM',
                    wm: otcWM,
                    sortOrder: 1, // so OTC WM shows at the top of the sampling summary table
                    catchRecords: currOTC.length,
                    cwMin: formatWeight(minOTCWt),
                    cwMax: formatWeight(maxOTCWt),
                    data: currOTC
                });
            }

            // formatting catches
            for (const operation of currOpps.value) {
                if (operation.catches) {
                    for (const currCatch of operation.catches) {
                        if (currCatch) {
                            const catchVal = currCatch;
                            catchVal.biolist = operation.biolist;
                            catchVal.tripNum = operation.legacy.tripId;
                            catchVal.haulNum = operation.operationNum;
                          //  catchVal.otcWM = get(operation, 'observerTotalCatch.weightMethod.description')
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
                    const currItem = dispositionGroups[disposition];

                    const minCatchWeight: number = getMaxOrMin('min', currItem, 'weight.value');
                    const minSampleWeight: number = getMaxOrMin('min', currItem, 'sampleWeight.value');
                    let minWeight: number | undefined = minCatchWeight ? minCatchWeight : minSampleWeight;
                    minWeight = formatWeight(minWeight);

                    const maxCatchWeight: number = getMaxOrMin('max', currItem, 'weight.value');
                    const maxSampleWeight: number = getMaxOrMin('max', currItem, 'sampleWeight.value');
                    let maxWeight: number | undefined = maxCatchWeight ? maxCatchWeight : maxSampleWeight;
                    maxWeight = formatWeight(maxWeight);

                    wmSummary.value.push({
                        type: disposition,
                        sortOrder: disposition === 'Retained' ? 2 : 3,
                        wm,
                        cwMin: minWeight,
                        cwMax: maxWeight,
                        catchRecords: currItem.length,
                        data: currItem
                    });
                }
            }
            wmSummary.value = orderBy(wmSummary.value, ['sortOrder'], ['asc']);

            // breaking into subcatch level
            const speciesCatches: any[] = [];
            for (const catchVal of catches) {
                if (catchVal.children && catchVal.children.length > 0) {
                    for (const child of catchVal.children) {
                        const species = cloneDeep(child);
                        species.biolist = catchVal.biolist;
                        species.catchLevelInfo = catchVal;
                        species.species = get(child, 'catchContent.commonNames[0]');
                        species.weight = parseFloat(get(child, 'weight.value', 0));
                        species.count = parseFloat(get(child, 'sampleCount', 0));
                        if (child.baskets && child.baskets.length > 0) {
                            species.basketCnt = child.baskets.length;
                        }
                        speciesCatches.push(species);
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
                const speciesGroup: any = speciesGroups[species];
                const type: string = prioritySpecies.includes(species) ? 'Priority' : 'Other';
                const weight: number | undefined = formatWeight(sumBy(speciesGroup, 'weight'));
                let basketWt: number | undefined = sumBy(speciesGroup, (group: any) => {
                    return group.baskets ? sumBy(group.baskets, 'weight') : 0;
                });
                basketWt = formatWeight(basketWt);
                const count: number = sumBy(speciesGroup, 'count');
                const avgWt: number | undefined = weight ? formatWeight(weight / count) : undefined;
                const bsRecords: number = sumBy(speciesGroup, (group: any) => {
                    return group.specimens ? group.specimens.length : undefined;
                });
                speciesSummary.value.push({
                    type,
                    species,
                    scRecords: speciesGroup.length,
                    weight,
                    basketWt,
                    count,
                    avgWt,
                    data: speciesGroup,
                    bsRecords,
                    // spid date
                });
            }
            speciesSummary.value = orderBy(speciesSummary.value, ['type', 'species'], ['desc', 'asc']);
            isLoading.value = false;
        }

        function goToBios(data: any) {
            const flattenedTrips: any[] = [];
            const flattenedOps: any[] = [];

            for (const trip of selectedVessel.value.trips) {
                flattenedTrips.push(flatten(trip, {delimiter: '-'}));
            }
            store.dispatch('debriefer/updateSelectedTrips', flattenedTrips);

            for (const op of selectedVessel.value.operations) {
                flattenedOps.push(flatten(op, { delimiter: '-'}));
            }
            store.dispatch('debriefer/updateSelectedOperations', flattenedOps);

            const filters = state.debriefer.filters;
            filters['wcgop-biospecimens'] = { species: data.species };
            store.dispatch('debriefer/updateFilters', filters);
            context.emit('changeTab', { topLevelTab: 'data', dataTab: 'biospecimens'});
        }

        function open(selectedInfo: any) {
            showDialog.value = true;
            popoutData.value = [];

            const type = selectedInfo.data.type;
            const data = selectedInfo.data.data;

            if (type === 'OTC WM') {
                popoutCols.value = otcCols;
                popoutData.value = populateOTC(data);
            } else if (type === 'Retained') {
                popoutCols.value = retainedWMCols;
                popoutData.value = populateSamplingSummary(data);
            } else if (type === 'Discarded') {
                popoutCols.value = discardedWMCols;
                popoutData.value = populateSamplingSummary(data);
            } else if (type === 'Priority' || type === 'Other') {
                popoutCols.value = speciesCompCols;
                popoutData.value = populateSpeciesCompSummary(data);
            }
        }

        function populateSpeciesCompSummary(data: any) {
            const summaryInfo: any[] = [];
            for (const val of data) {
                const catchInfo = val.catchLevelInfo;
                const sampleWeight = val.baskets ? sumBy(val.baskets, 'weight') : undefined;
                const count = val.baskets ? sumBy(val.baskets, 'count') : undefined;
                summaryInfo.push({
                    tripNum: catchInfo.tripNum,
                    haulNum: catchInfo.haulNum,
                    catchNum: catchInfo.catchNum,
                    disposition: get(catchInfo, 'disposition.description'),
                    wm: get(catchInfo, 'weightMethod.description'),
                    name: val.species,
                    weight: formatWeight(val.weight),
                    sampleWeight,
                    // fish#
                    count,
                    avgWt: sampleWeight && count ? formatWeight(sampleWeight / count) : undefined,
                    baskets: val.baskets ? val.baskets.length : undefined,
                    discard: val.discardReason ? get(val, 'discardReason.description') : undefined,
                    biolist: catchInfo.biolist,
                    specimenCnt: val.specimens ? val.specimens.length : undefined
                });
            }
            return summaryInfo;
        }

        function populateSamplingSummary(data: any) {
            const summaryInfo: any[] = [];
            for (const catchVal of data) {
                let weight = typeof catchVal.weight === 'object' ? get(catchVal, 'weight.value') : catchVal.weight;
                weight = formatWeight(weight);
                summaryInfo.push({
                    tripNum: get(catchVal, 'tripNum'),
                    haulNum: get(catchVal, 'haulNum'),
                    catchNum: get(catchVal, 'catchNum'),
                    disposition: get(catchVal, 'disposition.description'),
                    wm: get(catchVal, 'weightMethod.description'),
                    name: get(catchVal, 'catchContent.name'),
                    weight,
                    // count
                    // discard reason - currently this is at subsample level, in new
                    // catch format should be at catch level
                    sampleWt: formatWeight(get(catchVal, 'sampleWeight.value')),
                    sampleCnt: get(catchVal, 'sampleCount'),
                    // ratio - don't see this in the model yet
                    // cab
                    // ss total
                });
            }
            return summaryInfo;
        }

        function populateOTC(data: any) {
            const otcInfo = [];
            for (const op of data) {
                let wm = get(op, 'observerTotalCatch.weightMethod.description');
                wm = wm === 'Visual Experience' ? 14 : 6;

                let totalCW: any = sumBy(op.catches, (catchVal: any) => {
                    if (catchVal.weight && typeof catchVal.weight === 'object') {
                        return get(catchVal, 'weight.value');
                    } else if (catchVal.weight && typeof catchVal.weight === 'number') {
                        return catchVal.weight;
                    }
                });
                totalCW = formatWeight(totalCW);
                const otcWt = formatWeight(get(op, 'observerTotalCatch.measurement.value'));
                const subCW = otcWt && totalCW ? formatWeight(otcWt - totalCW) : undefined;
                otcInfo.push({
                    tripNum: get(op, 'legacy.tripId'),
                    haulNum: get(op, 'operationNum'),
                    otcWM: wm,
                    target: get(op, 'targetStrategy'),
                    otcWt,
                    totalCW,
                    subCW,
                    // tow time
                    fit: get(op, 'fit'),
                    calWt: get(op, 'calWeight')
                });
            }
            return otcInfo;
        }

        return {
            vesselSummary,
            wmSummary,
            speciesSummary,
            selectedVessel,
            selectedTrips,
            tripsList,
            updateSelectedTrips,

            populateSummary,
            clear,
            isVesselLoading,
            isLoading,
            maximizedToggle,

            showDialog,
            open,
            goToBios,
            popoutData,
            popoutCols
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