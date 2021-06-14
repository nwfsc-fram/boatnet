<template>
    <div>
        <boatnet-tree-table
            :nodes.sync="samples"
            :columns="ashopColumns"
            p-scrollable-body
            :isEditable="true"
            :program="program"
            type="catch"
            :isFullSize="false"
        ></boatnet-tree-table>
    </div>
</template>


<script lang="ts">
import { createComponent, ref, watch } from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { get, round, slice } from 'lodash';

export default createComponent({
    props: {
        isFullSize: Boolean,
        lookupsMap: Array,
    },
    setup(props, context) {
        const store = context.root.$store;
        const state: any = store.state;
        const samples: any = ref([]);
        const program = 'ashop';

        const jp = require('jsonpath');

        const ashopColumns: any[] = [
            {
                name: 'haulNum',
                required: true,
                header: 'Haul',
                align: 'left',
                field: 'haulNum',
                width: '100',
                expander: true,
                isEditable: false,
                order: 1,
            },
            {
                name: 'sample',
                required: true,
                header: 'Sample',
                align: 'left',
                field: 'sampleNum',
                width: '100',
                isEditable: false,
                order: 1,
            },
            {
                name: 'presorted',
                required: true,
                header: 'Presorted',
                align: 'left',
                field: 'isPresorted',
                width: '100',
                isEditable: false,
                order: 1,
            },
            {
                name: 'speciesName',
                required: true,
                header: 'Species Name',
                align: 'left',
                field: 'speciesName',
                width: '200',
                isEditable: true,
                type: 'toggle-search',
                lookupView: 'taxonomy-alias',
                lookupField: 'commonNames[0]',
                order: 1,
            },
            {
                name: 'speciesWeight',
                required: true,
                header: 'Species Weight',
                align: 'left',
                field: 'speciesWeight',
                width: '80',
                type: 'number',
                isEditable: true,
                order: 1,
            },
            {
                name: 'combinationSampled',
                required: true,
                header: 'Combination Sampled',
                align: 'left',
                field: 'sample',
                width: '100',
                isEditable: false,
                order: 1,
            },
            {
                name: 'sampleDesign',
                required: true,
                header: 'Sample Design',
                align: 'left',
                field: 'sampleDesign',
                width: '100',
                isEditable: false,
                order: 1,
            },
            {
                name: 'speciesSampled',
                required: true,
                header: 'Species Sampled',
                align: 'left',
                field: 'speciesSampled',
                width: '100',
                isEditable: false,
                order: 1,
            },
            {
                name: 'totalSampleWt',
                required: true,
                header: 'Total Sample Weight',
                align: 'left',
                field: 'totalSampleWeight',
                width: '100',
                isEditable: false,
                order: 1,
            },
            {
                name: 'sampledBy',
                required: true,
                header: 'Sampled By',
                align: 'left',
                field: 'sampledBy',
                width: '100',
                isEditable: false,
                order: 1,
            },
            {
                name: 'errorCnt',
                required: true,
                header: 'Error Counts',
                align: 'left',
                field: 'errorCnt',
                width: '100',
                isEditable: false,
                order: 1,
            },
        ];

        function getSampleInfo() {
            samples.value = [];
            const currOps = state.debriefer.operations;

            const sampleInfo: any[] = jp.nodes(currOps, '$[*]..samples');
            console.log(sampleInfo);
            for (const sample of sampleInfo) {
                const children: any[] = [];
                let childIndex = 0;
                const currData = sample.value[0];

                const haulPath = jp.stringify(slice(sample.path, 0, 2));
                const haulNum = jp.value(currOps, haulPath + '.haulNum');
                const sampleNum = get(currData, 'sampleNum');

                for (const child of currData.children) {
                    children.push({
                        key: haulNum + '-' + sampleNum + '-' + childIndex,
                        data: {
                            speciesName: get(child, 'catchContent.commonNames[0]'),
                            speciesWeight: round(get(child, 'totalSampleWeight.value'), 2)
                        }
                    });
                    childIndex++;
                }

                samples.value.push({
                    key: haulNum + '-' + sampleNum,
                    data: {
                        sampleNum,
                        isPresorted: get(currData, 'isPresorted'),
                        totalSampleWeight: get(currData, 'totalSampleWeight.value'),
                        haulNum
                    },
                    children
                });
            }
        }

        watch(
            () => state.debriefer.operations,
            () => {
                getSampleInfo();
            }
        );

        return {
            ashopColumns,
            samples,
            program,
        };
    },
});
</script>