<template>
    <div>
        <prime-table
            :value="operations"
            :columns="wcgopColumns"
            type="Operations"
            uniqueKey="_id"
            :enableSelection="true"
            :isFullSize="isFullSize"
            :initialSelection="initialSelection"
            :loading="loading"
            :showSelectionBoxes="true"
            @selectValues="selectValues"
            @save="save"
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
import { cloneDeep, findIndex } from 'lodash';

export default createComponent({
    props: {
        isFullSize: Boolean
    },
    setup(props, context) {
        const store = context.root.$store;
        const state: any = store.state;
        const initialSelection = state.debriefer.selectedOperations
            ? state.debriefer.selectedOperations
            : [];
        const masterDB: Client<any> = couchService.masterDB;
        const operations: any = ref([]);
        const loading: any = ref(false);

        watch(() => state.debriefer.operations, getOperations);

        const wcgopColumns = [
            {
                field: 'legacy-tripId',
                header: 'Trip Id',
                type: 'number',
                key: 'wcgopOpTripId',
                width: '80',
            },
            {
                field: 'operationNum',
                header: 'Haul #',
                type: 'number',
                key: 'wcgopOpHaulNum',
                width: '60',
            },
            {
                field: 'haulScore',
                header: 'Haul Score',
                type: 'toggle',
                listType: 'template',
                list: ['Pass', 'Fail'],
                key: 'wcgopHaulScore',
                isEditable: true,
                width: '100',
            },
            {
                field: 'observerTotalCatch-measurement-value',
                header: 'OTC (lbs)',
                type: 'double',
                key: 'wcgopOpOTC',
                width: '100',
                isEditable: true,
            },
            {
                field: 'observerTotalCatch-weightMethod-description',
                header: 'OTC WT Method',
                type: 'toggle',
                key: 'wcgopOpWM',
                width: '150',
                listType: 'fetch',
                search: true,
                lookupKey: 'weight-method',
                lookupField: 'description',
                isEditable: true,
            },
            {
                field: 'gearPerformance-description',
                header: 'Gear Perf',
                type: 'toggle',
                key: 'wcgopGearPerf',
                width: '150',
                listType: 'fetch',
                search: true,
                lookupKey: 'gear-performance',
                lookupField: 'description',
                isEditable: true,
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
            },
            {
                field: 'beaufortValue',
                header: 'Beaufort',
                type: 'toggle',
                key: 'wcgopOpBeaufort',
                listType: 'fetch',
                lookupKey: 'beaufort',
                lookupField: 'legacy.lookupVal',
                width: '70',
                isEditable: true,
            },
            {
                field: 'fit',
                header: 'Fit #',
                type: 'number',
                key: 'wcgopOpFit',
                width: '70',
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
                width: '275',
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
                width: '275',
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
                width: '250',
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
            // HLFC
            {
                field: 'targetStrategy',
                header: 'Target Strategy',
                type: 'input',
                key: 'wcgopOptargetStrategy',
                width: '100',
                isEditable: true
            },
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
        ];

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
        }
        async function getOperations() {
            loading.value = true;
            operations.value = state.debriefer.operations;
            loading.value = false;
        }

        return {
            wcgopColumns,
            selectValues,
            initialSelection,
            save,
            operations,
            loading,
        };
    },
});
</script>