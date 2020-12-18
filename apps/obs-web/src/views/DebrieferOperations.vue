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
            @selectValues="selectValues"
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

export default createComponent({
    props: {
        isFullSize: Boolean,
        operations: Array,
    },
    setup(props, context) {
        const store = context.root.$store;
        const state: any = store.state;
        const initialSelection = state.debriefer.operations ? state.debriefer.operations : [];

        const wcgopColumns = [
            {
                field: 'legacy.tripId',
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
                field: 'observerTotalCatch.measurement.value',
                header: 'OTC (lbs)',
                type: 'double',
                key: 'wcgopOpOTC',
                width: '100',
                isEditable: true,
            },
            {
                field: 'observerTotalCatch.weightMethod.description',
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
                field: 'gearPerformance.description',
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
                field: 'avgSoakTime.value',
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
                field: 'locations[0].locationDate',
                header: 'Start Date',
                type: 'date',
                key: 'wcgopOpStartDate',
                width: '150',
                isEditable: true,
            },
            {
                field: 'locations[1].locationDate',
                header: 'End Date',
                type: 'date',
                key: 'wcgopOpEndDate',
                width: '150',
                isEditable: true,
            },
            {
                field: 'locations[0].location.coordinates[0]',
                header: 'Start lat',
                type: 'double',
                key: 'wcgopOpStartLat',
                width: '125',
                isEditable: true,
            },
            {
                field: 'locations[1].location.coorindates[0]',
                header: 'End lat',
                type: 'double',
                key: 'wcgopOpEndLat',
                width: '125',
                isEditable: true,
            },
            {
                field: 'locations[0].location.coordinates[1]',
                header: 'Start long',
                type: 'double',
                key: 'wcgopOpStartLong',
                width: '125',
                isEditable: true,
            },
            {
                field: 'locations[1].location.coorindates[1]',
                header: 'End long',
                type: 'double',
                key: 'wcgopOpEndLong',
                width: '125',
                isEditable: true,
            },
            // depth
            {
                field: 'gearType.description',
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
                field: 'legacy.isBrdPresent',
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

        function selectValues(data: any) {
            store.dispatch('debriefer/updateOperations', data);
        }

        return {
            wcgopColumns,
            selectValues,
            initialSelection
        };
    },
});
</script>