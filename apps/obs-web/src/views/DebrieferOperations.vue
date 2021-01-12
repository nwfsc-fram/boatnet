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
            @selectValues="selectValues"
            @save="save"
        />
    </div>
</template>


<script lang="ts">
import {
    createComponent,
    ref,
    reactive,
    computed,
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

        const flatten = require('flat');
        const unflatten = flatten.unflatten;

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
                field: 'totalGearSegments',
                header: 'Total Gear',
                type: 'number',
                key: 'wcgopOpTotGear',
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
                lookupField: 'legacy-lookupVal',
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
                field: 'locations-0-location-coordinates-0',
                header: 'Start lat',
                type: 'double',
                key: 'wcgopOpStartLat',
                width: '125',
                isEditable: true,
            },
            {
                field: 'locations-1-location-coorindates-0',
                header: 'End lat',
                type: 'double',
                key: 'wcgopOpEndLat',
                width: '125',
                isEditable: true,
            },
            {
                field: 'locations-0-location-coordinates-1',
                header: 'Start long',
                type: 'double',
                key: 'wcgopOpStartLong',
                width: '125',
                isEditable: true,
            },
            {
                field: 'locations-1-location-coorindates-1',
                header: 'End long',
                type: 'double',
                key: 'wcgopOpEndLong',
                width: '125',
                isEditable: true,
            },
            // depth
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
            },
            // HLFC
            {
                field: 'targetStrategy',
                header: 'Target Strategy',
                type: 'input',
                key: 'wcgopOptargetStrategy',
                width: '100',
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
                type: 'input',
                key: 'wcgopOpNotes',
                width: '200',
                isEditable: true,
            },
        ];

        getOperations();

        function selectValues(data: any) {
            const unflattenData: any[] = [];
            for (const val of data) {
                unflattenData.push(unflatten(val, { delimiter: '-' }));
            }
            store.dispatch('debriefer/updateSelectedOperations', unflattenData);
        }

        async function save(data: any) {
            const result = await masterDB.put(data._id, data, data._rev);
            const index = findIndex(operations.value, { _id: data._id });
            const updatedvalue: any[] = cloneDeep(operations.value);
            updatedvalue[index] = data;
            updatedvalue[index]['_rev'] = result.rev;
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