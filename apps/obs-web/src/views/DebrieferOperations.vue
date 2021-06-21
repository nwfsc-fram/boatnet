<template>
    <div>
        <prime-table
            :value="operations"
            :columns="columns"
            type="Operations"
            uniqueKey="_id"
            :enableSelection="true"
            :isFullSize="isFullSize"
            :loading="loading"
            :showSelectionBoxes="false"
            :lookupsMap="lookupsMap"
            :totalRecords="totalRecords"
            @save="save"
            @paginate="paginate"
        />
    </div>
</template>


<script lang="ts">
import {
    createComponent,
    ref,
    watch,
} from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { cloneDeep, findIndex, orderBy, replace, slice } from 'lodash';

export default createComponent({
    props: {
        isFullSize: Boolean,
        lookupsMap: Array
    },
    setup(props, context) {
        const store = context.root.$store;
        const state: any = store.state;
        const masterDB: Client<any> = couchService.masterDB;
        const operations: any = ref([]);
        const loading: any = ref(false);
        const displayColumns: any = state.debriefer.displayColumns;
        const totalRecords: any = ref(0);
        const columns: any = ref([]);

        const flatten = require('flat');
        const unflatten = flatten.unflatten;

        watch(() => state.debriefer.selectedTrips, async () => {
            await getOperations(0, state.debriefer.pageSize);
        });

        const wcgopColumns = [
            {
                field: 'legacy-tripId',
                header: 'Trip',
                type: 'number',
                key: 'wcgopOpTripId',
                width: '80',
            },
            {
                field: 'operationNum',
                header: 'Haul',
                type: 'number',
                key: 'wcgopOpHaulNum',
                width: '80',
            },
            {
                field: 'targetStrategy',
                header: 'Target Stra',
                type: 'input',
                key: 'wcgopOptargetStrategy',
                width: '140',
                isEditable: true
            },
            {
                field: 'haulScore',
                header: 'Haul Score',
                type: 'toggle',
                listType: 'template',
                list: ['Pass', 'Fail'],
                key: 'wcgopHaulScore',
                isEditable: true,
                width: '130',
            },
            {
                field: 'observerTotalCatch-measurement-value',
                header: 'OTC (lbs)',
                type: 'double',
                key: 'wcgopOpOTC',
                width: '110',
                isEditable: true,
            },
            {
                field: 'observerTotalCatch-weightMethod-description',
                code: 'observerTotalCatch-weightMethod-lookupVal',
                header: 'Otc Wt',
                type: 'toggle',
                key: 'wcgopOpWM',
                width: '150',
                codeWidth: '100',
                listType: 'fetch',
                search: true,
                lookupKey: 'otc-weight-method',
                lookupField: 'description',
                isEditable: true,
            },
            {
                field: 'gearPerformance-description',
                header: 'Gear Perf',
                type: 'toggle',
                key: 'wcgopGearPerf',
                width: '110',
                codeWidth: '110',
                listType: 'fetch',
                search: true,
                lookupKey: 'gear-performance',
                lookupField: 'description',
                isEditable: true,
            },
            {
                field: 'beaufortValue',
                header: 'Beaufort',
                type: 'toggle',
                key: 'wcgopOpBeaufort',
                listType: 'fetch',
                lookupKey: 'beaufort',
                lookupField: 'legacy.lookupVal',
                width: '120',
                isEditable: true,
            },
            {
                field: 'fit',
                header: 'Fit #',
                type: 'number',
                key: 'wcgopOpFit',
                width: '80',
                isEditable: true,
            },
            {
                field: 'calWeight',
                header: 'Cal WT',
                type: 'number',
                key: 'wcgopOpCalWeight',
                width: '70',
                isEditable: true,
            },
            {
                field: 'biolist',
                header: 'Biolist',
                type: 'number',
                key: 'wcgopOpBiolist',
                width: '100',
            },
            {
                field: 'locations-0-locationDate',
                header: 'Start Date',
                type: 'date',
                key: 'wcgopOpStartDate',
                width: '150',
                isEditable: true,
            },
            {
                field: 'locations-1-locationDate',
                header: 'End Date',
                type: 'date',
                key: 'wcgopOpEndDate',
                width: '150',
                isEditable: true,
            },
            {
                field: 'locations-0-location-coordinates',
                displayField: ['locations-0-location-coordinates-0', 'locations-0-location-coordinates-1'],
                header: 'Start location',
                type: 'coordinate',
                key: 'wcgopOpStartLoc',
                width: '150',
                isEditable: true,
            },
            {
                field: 'locations-0-depth-value',
                header: 'Start Depth (FM)',
                type: 'double',
                key: 'wcgopOpStartDepth',
                width: '90',
                isEditable: true,
            },
            {
                field: 'locations-1-location-coordinates',
                displayField: ['locations-1-location-coordinates-0', 'locations-1-location-coordinates-1'],
                header: 'End location',
                type: 'coordinate',
                key: 'wcgopOpEndLoc',
                width: '150',
                isEditable: true,
            },
            {
                field: 'locations-1-depth-value',
                header: 'End Depth (FM)',
                type: 'double',
                key: 'wcgopOpEndDepth',
                width: '90',
                isEditable: true,
            },
            {
                field: 'gearType-description',
                header: 'Gear Type',
                type: 'toggle',
                key: 'wcgopOpGearType',
                listType: 'fetch',
                search: true,
                lookupKey: 'gear-type',
                lookupField: 'description',
                width: '200',
                isEditable: true,
            },
            // HLFC
            {
                field: 'isEfpUsed',
                header: 'EFP',
                type: 'toggle',
                listType: 'boolean',
                key: 'wcgopOpEFPUsed',
                width: '80',
                isEditable: true,
            },
            // MMSBST
            {
                field: 'notes',
                header: 'Notes',
                type: 'textArea',
                key: 'wcgopOpNotes',
                width: '200',
                isEditable: true,
            },
            {
                field: 'legacy-isBrdPresent',
                header: 'BRD',
                type: 'toggle',
                listType: 'boolean',
                key: 'wcgopOpIsBRDPresent',
                width: '100',
                isEditable: true
            },
            {
                field: 'totalHooks',
                header: 'Total Hooks',
                type: 'number',
                key: 'wcgopOpTotHooks',
                width: '100',
                isEditable: true,
            },
            {
                field: 'totalGearSegments',
                header: 'Total Gear Segments',
                type: 'number',
                key: 'wcgopOpTotGear',
                width: '100',
                isEditable: true,
            },
            {
                field: 'avgNumHooksPerSegment',
                header: 'Hook Count Per Segment',
                type: 'number',
                key: 'wcgopOpAvgNumHooksPerSeg',
                width: '100',
                isEditable: true,
            },
            {
                field: 'catches-0-legacy-hooksSampled',
                header: 'Hooks Sampled',
                type: 'number',
                key: 'wcgopOpHooksSampled',
                width: '100',
                isEditable: true,
            },
            {
                field: 'gearSegmentsLost',
                header: 'Lost Gear',
                type: 'number',
                key: 'wcgopOpTotGearLost',
                width: '100',
                isEditable: true,
            },
            // sea bird avoidance
            {
                field: 'avgSoakTime-value',
                header: 'Average Soak Time',
                type: 'number',
                key: 'wcgopOpAvgSoakTime',
                width: '100',
                isEditable: true,
            }
        ];

        const ashopColumns = [
            {
                field: 'gearType-gearTypeCode',
                header: 'Gear Type',
                type: 'number',
                key: 'ashopOpGearType',
                width: '80',
            },
            {
                field: 'legacy-tripSeq',
                header: 'Trip',
                type: 'number',
                key: 'ashopOpTripId',
                width: '80',
            },
            {
                field: 'haulNum',
                header: 'Haul',
                type: 'number',
                key: 'ashopOpHaulNum',
                width: '80',
            },
            {
                field: 'vesselType-vesselType',
                header: 'Vessel Type',
                type: 'number',
                key: 'ashopOpVesselType',
                width: '80',
            },
            {
                field: 'gearPerformance-gearPerformanceCode',
                header: 'Gear Perf',
                type: 'number',
                key: 'ashopOpGearPerf',
                width: '80',
            },
            {
                field: 'startFishingLocation-date',
                header: 'Start Date',
                type: 'date',
                key: 'ashopOpStartDate',
                width: '150',
                isEditable: true,
            },
            {
                field: '',
                header: 'Start Time',
                type: 'time',
                key: 'ashopOpStartTime',
                width: '150',
                isEditable: true,
            },
            {
                field: 'startFishingLocation-ddLocation-coordinates-0',
                displayField: ['startFishingLocation-ddLocation-coordinates-0', 'startFishingLocation-ddLocation-coordinates-1'],
                header: 'Start Lat',
                type: 'latitude',
                key: 'ashopOpStartLat',
                width: '150',
                isEditable: true,
            },
            {
                field: 'startFishingLocation-ddLocation-coordinates-1',
                displayField: ['startFishingLocation-ddLocation-coordinates-0', 'startFishingLocation-ddLocation-coordinates-1'],
                header: 'Start Long',
                type: 'longitude',
                key: 'ashopOpStartLong',
                width: '150',
                isEditable: true,
            },
            {
                field: 'bottomDepth-value',
                header: 'Bottom Depth',
                type: 'number',
                key: 'ashopOpBottomDepth',
                width: '120',
            },
            {
                field: 'fishingDepth-value',
                header: 'Fishing Depth',
                type: 'number',
                key: 'ashopOpFishingDepth',
                width: '120',
            },
             {
                field: 'fishingDepth-units',
                header: 'Depth Units',
                type: 'input',
                key: 'ashopOpDepthUnits',
                width: '100',
            },
            {
                field: 'endFishingLocation-date',
                header: 'End Date',
                type: 'date',
                key: 'ashopOpEndDate',
                width: '150',
                isEditable: true,
            },
            {
                field: '',
                header: 'End Time',
                type: 'time',
                key: 'ashopOpEndTime',
                width: '150',
                isEditable: true,
            },
            {
                field: 'endFishingLocation-ddLocation-coordinates-0',
                displayField: ['endFishingLocation-ddLocation-coordinates-0', 'endFishingLocation-ddLocation-coordinates-1'],
                header: 'End lat',
                type: 'latitude',
                key: 'ashopOpEndLat',
                width: '150',
                isEditable: true,
            },
            {
                field: 'endFishingLocation-ddLocation-coordinates-1',
                displayField: ['endFishingLocation-ddLocation-coordinates-0', 'endFishingLocation-ddLocation-coordinates-1'],
                header: 'End long',
                type: 'longitude',
                key: 'ashopOpEndLong',
                width: '150',
                isEditable: true,
            },
            {
                field: 'legacy-rstCode',
                header: 'RST',
                type: 'input',
                key: 'ashopOpRST',
                width: '80',
            },
            {
                field: 'legacy-rbtCode',
                header: 'RBT',
                type: 'input',
                key: 'ashopOpRBT',
                width: '80',
            },
            {
                field: 'sampleDesignType-sampleSystemCode',
                header: 'Sample Design',
                type: 'number',
                key: 'ashopOpSampleDesign',
                width: '120',
            },
        ];

        function setColumns() {
            const program = state.debriefer.program;
            columns.value = [];
            if (program === 'ashop') {
                columns.value = ashopColumns;
            } else {
                columns.value = wcgopColumns;
            }
        }
        setColumns();

        function selectValues(data: any) {
            store.dispatch('debriefer/updateSelectedOperations', data);
        }

        async function save(data: any) {
            const result = await masterDB.put(data._id, data, data._rev);
            const index = findIndex(operations.value, { _id: data._id });
            const updatedvalue: any[] = cloneDeep(operations.value);
            updatedvalue[index] = data;
            updatedvalue[index]._rev = result.rev;
            operations.value = updatedvalue;
            store.dispatch('debriefer/updateOperations', operations.value);
        }

        async function paginate(event: any) {
            await getOperations(event.first, event.rows);
        }

        async function getOperations(start: number, rowSize: number) {
            loading.value = true;
            let operationIds: any[] = [];
            const currTrips = state.debriefer.program === 'ashop' ?
                state.debriefer.trips :
                state.debriefer.selectedTrips;

            for (const trip of currTrips) {
                const unflattenedTrip = unflatten(trip, { delimiter: '-' });
                if (unflattenedTrip.operationIDs) {
                    operationIds = operationIds.concat(unflattenedTrip.operationIDs);
                }
            }
            totalRecords.value = operationIds.length;
            try {
                // get just the operations we want to display
                const operationOptions = { keys: operationIds };
                const operationDocs = await masterDB.listWithDocs(operationOptions);
                operations.value = operationDocs.rows;
                store.dispatch('debriefer/updateOperations', operationDocs.rows);
            } catch (err) {
                console.log('cannot fetch operation docs ' + err);
            }
            loading.value = false;
        }

        return {
            columns,
            selectValues,
            save,
            displayColumns,
            operations,
            loading,
            totalRecords,
            paginate
        };
    },
});
</script>